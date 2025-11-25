import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import { LeafletMap } from "../map/LeafletMap";
import { useNotificationHelpers } from "../useNotificationHelpers";
import { io } from "socket.io-client";
import { getBusStopsByRouteId , editStatusBusStop , editAllStatus, getStudentsByScheduleId } from "../../service/driverService";
import { map } from "leaflet";
import L from "leaflet";

//api key geoapify
const GEOAPIFY_KEY = "2b833a5c3c1649d89c2e52d7976c7534";

export default function DriverGPS({ schedule_id, route_id, vehicle_id }) {
  //state cho vi tri hien tai
  const [currentLocation, setCurrentLocation] = useState(null);
  //state cho loi vi tri
  const [locationError, setLocationError] = useState(null);
  //state cho danh sach xe khac
  const [otherBuses, setOtherBuses] = useState({});
  //state cho thong bao
  const isMobile = useIsMobile();
  const notifications = useNotificationHelpers();
  //state cho danh sach tram
  const [busStops, setBusStops] = useState([]);
  const [students, setStudents] = useState([]); //pickup_point_id, dropoff_point_id, id, name ...

  //tuyen co dinh va dong
  const [staticRouteCoords, setStaticRouteCoords] = useState([]);
  const [driverToFirstStopCoords, setDriverToFirstStopCoords] = useState([]);
    //khoang cach de xoa tram
    const STOP_REMOVE_RADIUS = 100; // meters

    //ham tinh khoang cach giua 2 diem
    const distanceMeters = (a, b) => {
      if (!a || !b) return Infinity;
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371000;
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const sinDlat = Math.sin(dLat / 2);
      const sinDlon = Math.sin(dLon / 2);
      const h = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
      const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
      return R * c;
    };
    
    //tu dong danh dau tram da den khi xe den gan tram
    useEffect(() => {
      if (!currentLocation || !busStops || busStops.length === 0) return;
      //chuyen to do sang dang so
      const cleanedStops = busStops.map((s) => ({ ...s, latitude: Number(s.latitude), longitude: Number(s.longitude) }));
      const toMark = [];
      //kiem tra tung tram de kiem tra khoang cach 
      for (let i = 0; i < cleanedStops.length; i++) {
        const next = cleanedStops[i];
        if (next.visited) continue;// da den roi thi bo qua
        const stopPos = { lat: next.latitude, lng: next.longitude };
        const dist = distanceMeters(currentLocation, stopPos);
        if (dist <= STOP_REMOVE_RADIUS) {
          toMark.push(next.id ?? i);
        } else {
          break;
        }
      }
      //phat hien tram can danh dau
      if (toMark.length > 0) {
        //cap nhat lai danh sach tram
        let updated = busStops.map((s, idx) => {
          const sid = s.id ?? idx;
          if (toMark.includes(sid)) {
            //goi API de cap nhat trang thai tram
            editStatusBusStop(s.id ?? sid, "arrived");
            return { ...s, visited: true, status: "arrived" };
          }
          return s;
        });

        //kiem tra con tram nao chua den khong
        const remainingAfterMark = updated.filter((s) => !s.visited);
        if (remainingAfterMark.length === 0) {
          //logic neu da den het tram thi dat tram cuoi cung thanh pending
          const lastMarkedId = toMark[toMark.length - 1];
          updated = updated.map((s, idx) => {
            const sid = s.id ?? idx;
            if (sid === lastMarkedId)
              //reset tat ca trang thai tram ve pending
              {
                editAllStatus(s.route_id, "pending");
                return { ...s, visited: true, status: "arrived" };
              } 
            return s;
          });
        }
        setBusStops(updated);

        //gui thong bao cho server ve danh sach hoc sinh o tram vua den
        for (const markedId of toMark) {
          //loc danh sach hoc sinh o tram do
          const pickupList = students.filter(s => Number(s.pickup_point_id) === Number(markedId));
          const dropoffList = students.filter(s => Number(s.dropoff_point_id) === Number(markedId));

          //gui len server
          emitStopStudents(markedId, pickupList, dropoffList);
        }

        //thong bao cho tai xe
        try {
          //neu het tram roi thi thong bao da den diem cuoi cung chuyen sang pending
          if (remainingAfterMark.length === 0) {
            const lastMarkedId = toMark[toMark.length - 1];
            const lastIdx = updated.findIndex((s, i) => (s.id ?? i) === lastMarkedId);
            const last = lastIdx >= 0 ? updated[lastIdx] : null;
            if (last && last.name) {
              notifications.showInfo?.("Xe đã đến điểm cuối", `${last.name} .`);
              try {
              } catch (e) {
                console.warn("Failed to update stop status on server for final stop", e);
              }
            } else {
              notifications.showInfo?.("Đã đến điểm cuối", "Điểm dừng cuối đã được đánh dấu là pending.");
            }
          } else {
            const firstIdx = busStops.findIndex((s, i) => toMark.includes(s.id ?? i));
            const first = firstIdx >= 0 ? busStops[firstIdx] : null;
            if (first && first.name) {
              notifications.showSuccess?.("Đã đến điểm dừng", `${first.name} — đã đến và được đánh dấu.`);
              try {
              } catch (e) {
                console.warn("Failed to update stop status on server", e);
              }
            } else {
              notifications.showInfo?.("Đã đến điểm dừng", "Một điểm dừng đã được đánh dấu là đã đến.");
            }
          }
        } catch (err) {
          console.warn("Notification failed:", err);
        }

        //khi den tram thi tinh lai duong di dong tu vi tri hien tai den tram tiep theo
        (async () => {
          try {
            const remaining = updated.filter((s) => !s.visited);
            if (remaining.length > 0 && currentLocation) {
              const first = { lat: Number(remaining[0].latitude), lng: Number(remaining[0].longitude) };
              const seg2 = await fetchSegment(currentLocation, first);
              if (seg2 && seg2.length > 0) {
                setDriverToFirstStopCoords(seg2);
              } else {
                setDriverToFirstStopCoords([currentLocation, first]);
              }
            } else {
              setDriverToFirstStopCoords([]);
            }
          } catch (e) {
            console.warn("Failed to recompute dynamic route after stop mark", e);
          }
        })();
      }
    }, [currentLocation, busStops]);

  //state cho trang thai ve tuyen duong
  const [routeStatus, setRouteStatus] = useState("idle");
  
  //co kiem soat viec fetch du lieu
  const isFetchingStatic = useRef(false);
  const isFetchingDynamic = useRef(false);
  //tao socket
  const socket = useMemo(() => io("http://26.58.101.232:5000"), []);
  const emitIntervalRef = useRef(null);
  const vehicleIdRef = useRef(vehicle_id);
  
  //cap nhat vehicleIdRef khi vehicle_id thay doi
  useEffect(() => {
    vehicleIdRef.current = vehicle_id;
  }, [vehicle_id]);

  //lay du lieu ve tram
  useEffect(() => {
    if (route_id) {
      const fetchBusStops = async () => {
        try {
          const res = await getBusStopsByRouteId(route_id);
          if (res && res.data && res.data.EC === 0) {
            // Sắp xếp trạm theo thứ tự (order_index) nếu có, hoặc theo ID
            const sortedStops = res.data.DT || []; 
            console.log("Fetched bus stops:", sortedStops);
            setBusStops(sortedStops);
          }
        } catch (err) {
          console.error("Error fetching bus stops", err);
        }
      };
      fetchBusStops();
    }
  }, [route_id]);

  //lay danh sach hoc sinh theo schedule_id
  useEffect(() => {
    const fetchStudents = async (sid) => {
      if (!sid) return;
      try {
        const res = await getStudentsByScheduleId(sid);
        if (res && res.data && res.data.EC === 0) {
          const dt = res.data.DT || {};
          const studentsFromApi = Array.isArray(dt.students) ? dt.students : [];
          const enriched = studentsFromApi.map((s) => ({ ...s }));
          setStudents(enriched);
          console.log("Loaded students for schedule:", sid, enriched.length);
        } else {
          console.warn("No students returned for schedule", sid, res?.data?.EM);
        }
      } catch (err) {
        console.error("Failed to fetch students for schedule", sid, err);
      }
    };

    if (schedule_id) fetchStudents(schedule_id);
  }, [schedule_id]);

  //xu ly socket va vi tri
  useEffect(() => {
    if (!navigator.geolocation) {
      const errorMsg = "Trình duyệt không hỗ trợ GPS.";
      setLocationError(errorMsg);
      return;
    }

    //lang nghe vi tri xe bus khac
    socket.on("bus_location_broadcast", (data) => {
      if (data.bus_id !== vehicle_id) {
        setOtherBuses((prev) => ({ ...prev, [data.bus_id]: { lat: data.latitude, lng: data.longitude } }));
      }
    });
    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
    });
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected", reason);
    });
    socket.on("connect_error", (err) => {
      console.warn("Socket connect_error", err);
    });

    //lay vi tri hien tai
    setCurrentLocation({lat: 10.8231, lng: 106.6297})

    //watch vi tri thay doi
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        //TODO: Tao sua ne
        // setCurrentLocation({ lat: latitude, lng: longitude });

        //gui vi tri len server
        const bid = vehicleIdRef.current;
        if (!bid) {
          console.warn("vehicle_id not available yet — skipping immediate emit");
        } else {
          socket.emit("bus-location", { busId: bid, latitude, longitude });
        }
      },
      (error) => {
        setLocationError(error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off("bus_location_broadcast");
    };
  }, [vehicle_id, socket]);

  //gui danh sach hoc sinh o tram vua den len server
  useEffect(() => {
    if (emitIntervalRef.current) {
      clearInterval(emitIntervalRef.current);
      emitIntervalRef.current = null;
    }
    //gui vi tri xe len server luc dau va lap lai moi 3 giay
    if (!socket || !currentLocation) return;
    try {
      if (vehicleIdRef.current) {
        socket.emit("bus_location_update", {
          bus_id: vehicleIdRef.current,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
        });
      } else {
        console.warn("vehicle_id not set — skipping initial bus_location_update emit");
      }
    } catch (e) {
      console.warn("Failed to emit initial location:", e);
    }

    //lap lai gui vi tri
    emitIntervalRef.current = setInterval(() => {
      try {
        const loc = currentLocation; // lay vi tri moi nhat
        if (loc) {
          const bid = vehicleIdRef.current;
          console.log("Emitting location for bus:", bid);
          if (!bid) {
            console.warn("vehicle_id not available yet; skipping periodic emit");
          } else {
            socket.emit("bus-location", {
              busId: bid,
              latitude: loc.lat,
              longitude: loc.lng,
              sentAt: Date.now(),
            });
          }
        }
      } catch (e) {
        console.warn("Periodic emit failed:", e);
      }
    }, 3000);

    return () => {
      if (emitIntervalRef.current) {
        clearInterval(emitIntervalRef.current);
        emitIntervalRef.current = null;
      }
    };
  }, [socket, currentLocation, vehicle_id]);

  //ham giup doi nguoi dung doi
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  //ham fetch duong di giua 2 diem
  const fetchSegment = async (a, b) => {
  //xay dung url
  const url = `https://api.geoapify.com/v1/routing?waypoints=${a.lat},${a.lng}|${b.lat},${b.lng}&mode=bus&apiKey=${GEOAPIFY_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    console.log("json", json);
    const geometry = json?.features?.[0]?.geometry;

    if (!geometry || !geometry.coordinates) return [];
    
    let coords = [];
    
    if (geometry.type === "LineString") {
      coords = geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    } else if (geometry.type === "MultiLineString") {
      coords = geometry.coordinates.flatMap(line =>
        line.map(([lng, lat]) => ({ lat, lng }))
      );
    }

    //loai bo diem null
    coords = coords.filter(Boolean);

    console.log("Segment fetched:", coords.length);
    return coords;
  } catch (err) {
    console.warn("Routing fail:", err);
    return [];
  }
};
  //tinh toan duong di "CO DINH" (tram bus)
  useEffect(() => {
    const buildStaticRoute = async () => {
      if (!busStops || busStops.length < 2 || isFetchingStatic.current) return;

      //reset duong cu
      setStaticRouteCoords([]);

      isFetchingStatic.current = true;
      setRouteStatus("Đang vẽ tuyến đường cố định...");

      let allCoords = [];
      //loc nhung tram chua den
      const unvisited = (busStops || []).filter((s) => !s.visited);
      if (unvisited.length < 2) {
        setStaticRouteCoords([]);
        isFetchingStatic.current = false;
        setRouteStatus("Đã tải xong tuyến đường.");
        return;
      }
      const stops = unvisited.map((s) => ({ lat: Number(s.latitude), lng: Number(s.longitude) }));

      for (let i = 0; i < stops.length - 1; i++) {
        //gian cach giua cac lan goi
        await sleep(200);
        const seg = await fetchSegment(stops[i], stops[i + 1]);
        //them doan vao mang
        if (seg.length > 0) {
          //noi tiep cac doan
          if (allCoords.length > 0) {
            allCoords = [...allCoords, ...seg.slice(1)];
          } else {
            allCoords = [...seg];
          }
        } else {
          //fallback neu khong co duong di(duong thang)
          allCoords.push(stops[i], stops[i + 1]);
        }
      }

      setStaticRouteCoords(allCoords);
      setRouteStatus("Đã tải xong tuyến đường.");
      isFetchingStatic.current = false;
    };

    buildStaticRoute();
  }, [busStops]);

  //tinh toan duong di "DONG" (tu vi tri tai xe den tram dau tien)
  useEffect(() => {
    const buildDynamicRoute = async () => {
      if (!currentLocation || !busStops || busStops.length === 0) return;
      if (isFetchingDynamic.current) return;
      
      isFetchingDynamic.current = true;

      //tim tram chua den dau tien
      const nextUnvisited = (busStops || []).find((s) => !s.visited);
      if (!nextUnvisited) {
        setDriverToFirstStopCoords([]);
        isFetchingDynamic.current = false;
        return;
      }

      const firstStop = { lat: Number(nextUnvisited.latitude), lng: Number(nextUnvisited.longitude) };

      //fetch duong di tu vi tri hien tai den tram dau tien
      const seg = await fetchSegment(currentLocation, firstStop);
      
      if (seg.length > 0) {
        setDriverToFirstStopCoords(seg);
      } else {
        //fall back duong thang
        setDriverToFirstStopCoords([currentLocation, firstStop]);
      }
      
      isFetchingDynamic.current = false;
    };
    buildDynamicRoute();

  }, [currentLocation, busStops]); //chay khi vi tri hoac danh sach tram thay doi

  //tao polylines cho map
  const polylines = useMemo(() => {
    const lines = [];

    //duong mau xanh duong (net dut): tu vi tri xe den tram dau tien
    if (driverToFirstStopCoords.length > 0) {
      lines.push({
        id: "route-driver-start",
        positions: driverToFirstStopCoords,
        color: "#3b82f6",
        weight: 6,
        opacity: 1,
        dashArray: "10, 10",
      });
    }

    //duong mau xanh la cay: tuyen co dinh
    if (staticRouteCoords.length > 0) {
      lines.push({
        id: "route-static-busline",
        positions: staticRouteCoords,
        color: "#28a745",
        weight: 4,
        opacity: 0.5,
      });
    }

    return lines;
  }, [driverToFirstStopCoords, staticRouteCoords]);

  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "bus-marker-icon",
  });
  //tao markers cho map
  const mapMarkers = useMemo(() => {
  const fallback = { lat: 10.8231, lng: 106.6297 };
  return [
    {
      id: "current-vehicle",
      position: currentLocation || fallback,
      title: `Xe của bạn`,
      type: "bus-current",
      draggable: true,                
      onDrag: (pos) => setCurrentLocation(pos),
      icon: busIcon,
    },
    ...busStops.map((stop, index) => ({
      id: `stop-${stop.id || index}`,
      position: { lat: stop.latitude, lng: stop.longitude },
      title: `${index + 1}. ${stop.name}`,
      type: "stop",
    })),
    ...Object.entries(otherBuses).map(([busId, pos]) => ({
      id: `bus-${busId}`,
      position: pos,
      title: `Xe ${busId}`,
      type: "bus",
    })),
  ];
}, [currentLocation, busStops, otherBuses]);

//gui qua trinh don hoc sinh o tram len server
const emitStopStudents = (stopId, pickupList, dropoffList) => {
  try {
    if ((!Array.isArray(pickupList) || pickupList.length === 0) && (!Array.isArray(dropoffList) || dropoffList.length === 0)) {
      console.log("No pickup/dropoff students for stop", stopId, "— skipping emit");
      return;
    }

    if (!Array.isArray(students) || students.length === 0) {
      console.warn("No students loaded in state — emitted lists may be incomplete");
    }

    socket.emit("student-dropoff", { stopId, dropoff: dropoffList }, (ack) => {
      console.log("stop_students ack for", stopId, ack);
    });

    socket.emit("student-pickup", { stopId, pickup: pickupList }, (ack) => {
      console.log("stop_students ack for", stopId, ack);  
    });


    console.log("Emitted stop_students for stopId:", stopId, { pickupCount: pickupList.length, dropoffCount: dropoffList.length });
  } catch (err) {
    console.warn("Failed to emit stop_students", err);
  }
};
  //render giao dien
  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"} gap-6`}>
        <div className="lg:col-span-2">
            <div className="mb-2 flex justify-between items-center text-sm text-gray-600">
                <span><strong>Trạng thái:</strong> {routeStatus}</span>
                {currentLocation && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">GPS OK</span>}
            </div>
            
            {/* Render Map */}
            {currentLocation ? (
                <LeafletMap 
                    height={isMobile ? "400px" : "600px"} 
                    center={currentLocation} 
                    zoom={15} 
                    markers={mapMarkers} 
                    polylines={polylines} 
                    className="w-full rounded-lg shadow-md border" 
                />
            ) : (
                <div className="flex items-center justify-center w-full bg-gray-100 rounded-lg border border-dashed border-gray-300" style={{ height: isMobile ? "400px" : "600px" }}>
                <div className="text-center text-gray-500">
                    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mb-2" role="status"></div>
                    <p>Đang lấy vị trí GPS...</p>
                    {locationError && <p className="mt-2 text-sm text-red-500">{locationError}</p>}
                </div>
                </div>
            )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lộ trình ({busStops.length} trạm)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 max-h-[600px] overflow-y-auto pr-2">
              {busStops.length > 0 ? (
                busStops.map((stop, index) => (
                  <div key={stop.id || index} className="relative pl-6 pb-6 last:pb-0 border-l-2 border-gray-200 last:border-l-0 ml-2">
                    {/* Đường nối dọc (timeline) */}
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${stop.visited ? 'border-gray-400 bg-gray-400' : (index === 0 ? 'border-blue-500 bg-white' : 'border-green-500 bg-green-500')}`}></div>
                    
                    <div className="bg-white p-3 rounded-lg border shadow-sm -mt-1 ml-2">
                        <div className="flex justify-between items-start">
                            <p className="font-semibold text-sm text-gray-800">Trạm {index + 1}: {stop.name}</p>
                            <Badge variant="outline" className="text-[10px]">Điểm dừng</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{stop.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu trạm.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}