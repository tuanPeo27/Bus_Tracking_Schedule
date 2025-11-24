import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import { LeafletMap } from "../map/LeafletMap";
import { useNotificationHelpers } from "../useNotificationHelpers";
import { io } from "socket.io-client";
import {
  getBusStopsByRouteId,
  editStatusBusStop,
  editAllStatus,
  getStudentsByScheduleId,
} from "../../service/driverService";
import { map } from "leaflet";

const GEOAPIFY_KEY = "2b833a5c3c1649d89c2e52d7976c7534";

export default function DriverGPS({ schedule_id, route_id, vehicle_id }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [otherBuses, setOtherBuses] = useState({});
  const isMobile = useIsMobile();
  const notifications = useNotificationHelpers();

  const [busStops, setBusStops] = useState([]);
  const [students, setStudents] = useState([]); // mỗi phần tử có pickup_point_id, dropoff_point_id, id, name ...

  // Tách ra 2 state riêng biệt cho đường đi
  const [staticRouteCoords, setStaticRouteCoords] = useState([]); // Đường nối các trạm (Cố định)
  const [driverToFirstStopCoords, setDriverToFirstStopCoords] = useState([]); // Đường từ Tài xế -> Trạm 1 (Thay đổi)
  // Radius (meters) within which a stop is considered 'reached' and should be removed
  const STOP_REMOVE_RADIUS = 100; // meters

  // Haversine distance in meters between two lat/lng points
  const distanceMeters = (a, b) => {
    if (!a || !b) return Infinity;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDlat = Math.sin(dLat / 2);
    const sinDlon = Math.sin(dLon / 2);
    const h =
      sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  };
  // Mark stops that are reached (within STOP_REMOVE_RADIUS) as visited instead of removing.
  // We update the `status` and set a `visited` flag; route building will ignore visited stops.
  useEffect(() => {
    if (!currentLocation || !busStops || busStops.length === 0) return;
    const cleanedStops = busStops.map((s) => ({
      ...s,
      latitude: Number(s.latitude),
      longitude: Number(s.longitude),
    }));
    const toMark = [];
    // Only check from the start (next stops in order)
    for (let i = 0; i < cleanedStops.length; i++) {
      const next = cleanedStops[i];
      if (next.visited) continue; // already visited
      const stopPos = { lat: next.latitude, lng: next.longitude };
      const dist = distanceMeters(currentLocation, stopPos);
      if (dist <= STOP_REMOVE_RADIUS) {
        toMark.push(next.id ?? i);
      } else {
        break;
      }
    }

    if (toMark.length > 0) {
      let updated = busStops.map((s, idx) => {
        const sid = s.id ?? idx;
        if (toMark.includes(sid)) {
          editStatusBusStop(s.id ?? sid, "arrived");
          return { ...s, visited: true, status: "arrived" };
        }
        return s;
      });

      // If after marking there are no unvisited stops left, set the last marked stop's status to 'pending'
      const remainingAfterMark = updated.filter((s) => !s.visited);
      if (remainingAfterMark.length === 0) {
        const lastMarkedId = toMark[toMark.length - 1];
        updated = updated.map((s, idx) => {
          const sid = s.id ?? idx;
          if (sid === lastMarkedId) {
            editAllStatus(s.route_id, "pending");
            return { ...s, visited: true, status: "arrived" };
          }
          return s;
        });
      }

      setBusStops(updated);

      // send students for each marked stop
      for (const markedId of toMark) {
        // Lọc list học sinh cho điểm dừng này
        const pickupList = students.filter(
          (s) => Number(s.pickup_point_id) === Number(markedId)
        );
        const dropoffList = students.filter(
          (s) => Number(s.dropoff_point_id) === Number(markedId)
        );

        // Send students lists to server via socket only
        emitStopStudents(markedId, pickupList, dropoffList);
      }

      // show notification and update server status
      try {
        // If this marking consumed the last unvisited stop, set that last marked stop to 'pending'
        if (remainingAfterMark.length === 0) {
          const lastMarkedId = toMark[toMark.length - 1];
          const lastIdx = updated.findIndex(
            (s, i) => (s.id ?? i) === lastMarkedId
          );
          const last = lastIdx >= 0 ? updated[lastIdx] : null;
          if (last && last.name) {
            notifications.showInfo?.(
              "Đã đến điểm cuối",
              `${last.name} — đã đến và chuyển sang trạng thái pending.`
            );
            try {
            } catch (e) {
              console.warn(
                "Failed to update stop status on server for final stop",
                e
              );
            }
          } else {
            notifications.showInfo?.(
              "Đã đến điểm cuối",
              "Điểm dừng cuối đã được đánh dấu là pending."
            );
          }
        } else {
          const firstIdx = busStops.findIndex((s, i) =>
            toMark.includes(s.id ?? i)
          );
          const first = firstIdx >= 0 ? busStops[firstIdx] : null;
          if (first && first.name) {
            notifications.showSuccess?.(
              "Đã đến điểm dừng",
              `${first.name} — đã đến và được đánh dấu.`
            );
            try {
            } catch (e) {
              console.warn("Failed to update stop status on server", e);
            }
          } else {
            notifications.showInfo?.(
              "Đã đến điểm dừng",
              "Một điểm dừng đã được đánh dấu là đã đến."
            );
          }
        }
      } catch (err) {
        console.warn("Notification failed:", err);
      }

      // Immediately recompute dynamic route (driver -> new first unvisited stop)
      (async () => {
        try {
          const remaining = updated.filter((s) => !s.visited);
          if (remaining.length > 0 && currentLocation) {
            const first = {
              lat: Number(remaining[0].latitude),
              lng: Number(remaining[0].longitude),
            };
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
  const [routeStatus, setRouteStatus] = useState("idle");

  // Cờ kiểm soát việc fetch
  const isFetchingStatic = useRef(false);
  const isFetchingDynamic = useRef(false);

  const socket = useMemo(() => io("http://26.58.101.232:5000"), []);
  const emitIntervalRef = useRef(null);
  const vehicleIdRef = useRef(vehicle_id);

  useEffect(() => {
    vehicleIdRef.current = vehicle_id;
  }, [vehicle_id]);

  // 1. Lấy danh sách trạm
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

  // 1b. Lấy danh sách học sinh cho lịch trình (nếu có)
  useEffect(() => {
    const fetchStudents = async (sid) => {
      if (!sid) return;
      try {
        const res = await getStudentsByScheduleId(sid);
        if (res && res.data && res.data.EC === 0) {
          const dt = res.data.DT || {};
          const studentsFromApi = Array.isArray(dt.students) ? dt.students : [];
          // mark default attendance/payload field if needed
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

  // 2. Xử lý Socket và GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      const errorMsg = "Trình duyệt không hỗ trợ GPS.";
      setLocationError(errorMsg);
      return;
    }

    socket.on("bus_location_broadcast", (data) => {
      if (data.bus_id !== vehicle_id) {
        setOtherBuses((prev) => ({
          ...prev,
          [data.bus_id]: { lat: data.latitude, lng: data.longitude },
        }));
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

    //TODO: Tao sua ne
    setCurrentLocation({ lat: 10.8231, lng: 106.6297 });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        //TODO: Tao sua ne
        // setCurrentLocation({ lat: latitude, lng: longitude });

        const bid = vehicleIdRef.current;
        if (!bid) {
          console.warn(
            "vehicle_id not available yet — skipping immediate emit"
          );
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

  // Emit current location to the server every 3 seconds while we have a location
  useEffect(() => {
    // clear any existing interval
    if (emitIntervalRef.current) {
      clearInterval(emitIntervalRef.current);
      emitIntervalRef.current = null;
    }

    if (!socket || !currentLocation) return;

    // Emit immediately once
    try {
      if (vehicleIdRef.current) {
        socket.emit("bus_location_update", {
          bus_id: vehicleIdRef.current,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
        });
      } else {
        console.warn(
          "vehicle_id not set — skipping initial bus_location_update emit"
        );
      }
    } catch (e) {
      console.warn("Failed to emit initial location:", e);
    }

    // Then emit every 3 seconds
    emitIntervalRef.current = setInterval(() => {
      try {
        const loc = currentLocation; // use latest from closure
        if (loc) {
          const bid = vehicleIdRef.current;
          console.log("Emitting location for bus:", bid);
          if (!bid) {
            console.warn(
              "vehicle_id not available yet; skipping periodic emit"
            );
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

  // --- Helper Functions ---
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchSegment = async (a, b) => {
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
        // Flatten tất cả các line thành 1 mảng duy nhất
        coords = geometry.coordinates.flatMap((line) =>
          line.map(([lng, lat]) => ({ lat, lng }))
        );
      }

      // Loại bỏ điểm null/undefined
      coords = coords.filter(Boolean);

      console.log("Segment fetched:", coords.length);
      return coords;
    } catch (err) {
      console.warn("Routing fail:", err);
      return [];
    }
  };

  // --- Logic Routing Mới ---

  // 3. Tính toán đường đi "TĨNH" (Nối các trạm với nhau)
  // Chỉ chạy 1 lần khi danh sách trạm thay đổi (busStops)
  useEffect(() => {
    const buildStaticRoute = async () => {
      if (!busStops || busStops.length < 2 || isFetchingStatic.current) return;

      // Clear previous static route so we rebuild according to latest stops
      setStaticRouteCoords([]);

      isFetchingStatic.current = true;
      setRouteStatus("Đang vẽ tuyến đường cố định...");

      let allCoords = [];
      // Only include unvisited stops when building the static route
      const unvisited = (busStops || []).filter((s) => !s.visited);
      if (unvisited.length < 2) {
        setStaticRouteCoords([]);
        isFetchingStatic.current = false;
        setRouteStatus("Đã tải xong tuyến đường.");
        return;
      }
      const stops = unvisited.map((s) => ({
        lat: Number(s.latitude),
        lng: Number(s.longitude),
      }));

      for (let i = 0; i < stops.length - 1; i++) {
        // Delay nhỏ để tránh spam API
        await sleep(200);
        const seg = await fetchSegment(stops[i], stops[i + 1]);

        if (seg.length > 0) {
          // Nối mảng, tránh trùng điểm nối
          if (allCoords.length > 0) {
            allCoords = [...allCoords, ...seg.slice(1)];
          } else {
            allCoords = [...seg];
          }
        } else {
          // Fallback đường thẳng nếu API lỗi
          allCoords.push(stops[i], stops[i + 1]);
        }
      }

      setStaticRouteCoords(allCoords);
      setRouteStatus("Đã tải xong tuyến đường.");
      isFetchingStatic.current = false;
    };

    buildStaticRoute();
  }, [busStops]);

  // 4. Tính toán đường đi "ĐỘNG" (Tài xế -> Trạm đầu tiên)
  // Chạy khi currentLocation thay đổi
  useEffect(() => {
    const buildDynamicRoute = async () => {
      if (!currentLocation || !busStops || busStops.length === 0) return;
      if (isFetchingDynamic.current) return;

      // Chỉ tính toán nếu khoảng cách thay đổi đáng kể hoặc chưa có đường
      // Ở đây ta fetch đơn giản
      isFetchingDynamic.current = true;

      // Find the first unvisited stop
      const nextUnvisited = (busStops || []).find((s) => !s.visited);
      if (!nextUnvisited) {
        setDriverToFirstStopCoords([]);
        isFetchingDynamic.current = false;
        return;
      }

      const firstStop = {
        lat: Number(nextUnvisited.latitude),
        lng: Number(nextUnvisited.longitude),
      };

      // Fetch đoạn đường từ Tài xế -> Trạm 1 (first unvisited)
      const seg = await fetchSegment(currentLocation, firstStop);

      if (seg.length > 0) {
        setDriverToFirstStopCoords(seg);
      } else {
        // Fallback đường thẳng
        setDriverToFirstStopCoords([currentLocation, firstStop]);
      }

      isFetchingDynamic.current = false;
    };

    // Debounce đơn giản: Chỉ gọi nếu vị trí cập nhật (useEffect đã handle),
    // nhưng Geoapify giới hạn request, nên cẩn thận.
    // Có thể thêm điều kiện check khoảng cách nếu cần tối ưu hơn nữa.
    buildDynamicRoute();
  }, [currentLocation, busStops]); // Chạy khi vị trí thay đổi

  // --- Gom dữ liệu hiển thị ---

  const polylines = useMemo(() => {
    const lines = [];

    // Đường màu Xanh dương (Nét đứt): Từ Tài xế -> Trạm 1
    if (driverToFirstStopCoords.length > 0) {
      lines.push({
        id: "route-driver-start",
        positions: driverToFirstStopCoords,
        color: "#3b82f6", // Blue
        weight: 6,
        opacity: 1,
        dashArray: "10, 10", // Tạo hiệu ứng nét đứt để phân biệt
      });
    }

    // Đường màu Xanh lá (Liền mạch): Tuyến đường chính
    if (staticRouteCoords.length > 0) {
      lines.push({
        id: "route-static-busline",
        positions: staticRouteCoords,
        color: "#28a745", // Green
        weight: 4,
        opacity: 0.5,
      });
    }

    return lines;
  }, [driverToFirstStopCoords, staticRouteCoords]);

  const mapMarkers = useMemo(() => {
    const fallback = { lat: 10.8231, lng: 106.6297 };
    return [
      {
        id: "current-vehicle",
        position: currentLocation || fallback,
        title: `Xe của bạn`,
        type: "bus-current",
        draggable: true, // <-- bật draggable
        onDrag: (pos) => setCurrentLocation(pos), // <-- cập nhật vị trí khi kéo
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

  // Hoặc gửi qua socket
  const emitStopStudents = (stopId, pickupList, dropoffList) => {
    try {
      if (
        (!Array.isArray(pickupList) || pickupList.length === 0) &&
        (!Array.isArray(dropoffList) || dropoffList.length === 0)
      ) {
        console.log(
          "No pickup/dropoff students for stop",
          stopId,
          "— skipping emit"
        );
        return;
      }

      if (!Array.isArray(students) || students.length === 0) {
        console.warn(
          "No students loaded in state — emitted lists may be incomplete"
        );
      }

      // include acknowledgement callback so we know server received or errored
      socket.emit(
        "student-dropoff",
        { stopId, dropoff: dropoffList },
        (ack) => {
          console.log("stop_students ack for", stopId, ack);
        }
      );

      socket.emit("student-pickup", { stopId, pickup: pickupList }, (ack) => {
        console.log("stop_students ack for", stopId, ack);
      });

      console.log("Emitted stop_students for stopId:", stopId, {
        pickupCount: pickupList.length,
        dropoffCount: dropoffList.length,
      });
    } catch (err) {
      console.warn("Failed to emit stop_students", err);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`grid ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"} gap-6`}
      >
        <div className="lg:col-span-2">
          <div className="mb-2 flex justify-between items-center text-sm text-gray-600">
            <span>
              <strong>Trạng thái:</strong> {routeStatus}
            </span>
            {currentLocation && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                GPS OK
              </span>
            )}
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
            <div
              className="flex items-center justify-center w-full bg-gray-100 rounded-lg border border-dashed border-gray-300"
              style={{ height: isMobile ? "400px" : "600px" }}
            >
              <div className="text-center text-gray-500">
                <div
                  className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mb-2"
                  role="status"
                ></div>
                <p>Đang lấy vị trí GPS...</p>
                {locationError && (
                  <p className="mt-2 text-sm text-red-500">{locationError}</p>
                )}
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
                  <div
                    key={stop.id || index}
                    className="relative pl-6 pb-6 last:pb-0 border-l-2 border-gray-200 last:border-l-0 ml-2"
                  >
                    {/* Đường nối dọc (timeline) */}
                    <div
                      className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
                        stop.visited
                          ? "border-gray-400 bg-gray-400"
                          : index === 0
                          ? "border-blue-500 bg-white"
                          : "border-green-500 bg-green-500"
                      }`}
                    ></div>

                    <div className="bg-white p-3 rounded-lg border shadow-sm -mt-1 ml-2">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm text-gray-800">
                          Trạm {index + 1}: {stop.name}
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                          Điểm dừng
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {stop.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có dữ liệu trạm.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
