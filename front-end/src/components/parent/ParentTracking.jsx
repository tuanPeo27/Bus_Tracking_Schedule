import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import { LeafletMap } from "../map/LeafletMap";
import { io } from "socket.io-client";
import { getBusStopsByRouteId, getScheduleByStudentId } from "../../service/driverService";
import L from "leaflet";

const GEOAPIFY_KEY = "2b833a5c3c1649d89c2e52d7976c7534";

export function ParentTracking({ studentInfo, routeInfo }) {
  const isMobile = useIsMobile();

  // ---- FIX ROUTE INFO + STUDENT INFO ----
  const students = Array.isArray(studentInfo) ? studentInfo : studentInfo ? [studentInfo] : [];
  const routes = Array.isArray(routeInfo) ? routeInfo : routeInfo ? [routeInfo] : [];

  // --- SỬA LỖI 1: GỘP KHAI BÁO ROUTE IDS VÀO MỘT CHỖ DUY NHẤT ---
  // Sử dụng useMemo để tính toán routeIds và chỉ tính lại khi routes thay đổi
  const routeIds = useMemo(() => {
    return routes.map((r) => r.route?.id);
  }, [routes]); 
  
  // Tạo string để làm dependency cho useEffect fetch (tránh loop)
  const routeIdsString = routeIds.join(',');

  const [currentLocation, setCurrentLocation] = useState({
    lat: 10.8231,
    lng: 106.6297,
  }); 
  const [busStops, setBusStops] = useState([]);

  // Static & dynamic route
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [staticRouteCoords, setStaticRouteCoords] = useState([]);
  const [driverToFirstStopCoords, setDriverToFirstStopCoords] = useState([]);
  const [routeStatus, setRouteStatus] = useState("idle");

  const isFetchingStatic = useRef(false);
  const isFetchingDynamic = useRef(false);

  const socket = useMemo(() => io("http://26.58.101.232:5000"), []);
  const STOP_REMOVE_RADIUS = 100;

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

  // Logic đánh dấu trạm đã đi qua
  useEffect(() => {
    if (!currentLocation || !busStops || busStops.length === 0) return;

    const nextUnvisitedIndex = busStops.findIndex((s) => !s.visited);
    if (nextUnvisitedIndex === -1) return;

    const nextStop = busStops[nextUnvisitedIndex];
    const stopPos = {
      lat: Number(nextStop.latitude),
      lng: Number(nextStop.longitude),
    };

    const dist = distanceMeters(currentLocation, stopPos);

    if (dist <= STOP_REMOVE_RADIUS) {
      setBusStops((prevStops) =>
        prevStops.map((s, index) => {
          if (index === nextUnvisitedIndex) {
            return { ...s, visited: true };
          }
          return s;
        })
      );
    }
  }, [currentLocation, busStops]);

  // ---- FETCH BUS STOPS ----
  useEffect(() => {
    if (!routeIds || routeIds.length === 0) return;

    const fetchStops = async () => {
      try {
        const res = await getBusStopsByRouteId(routeIds);
        if (res?.data?.EC === 0) {
          const sorted = res.data.DT || [];
          setBusStops(sorted);
        }
      } catch (e) {
        console.error("Error loading bus stops", e);
      }
    };

    fetchStops();
    // Dùng chuỗi ID làm dependency để tránh infinite loop
  }, [routeIdsString]); 

  useEffect(() => {
  if (!students || students.length === 0) return;

  const fetchScheduleInfo = async () => {
    try {
      const res = await getScheduleByStudentId(students[0]?.id);
      if (res?.data?.EC === 0) {
        const scheduleData = res.data.DT || {};
        setScheduleInfo(scheduleData);
        console.log("Schedule info loaded:", scheduleData);
      }
    } catch (e) {
      console.error("Error loading schedule info", e);
    }
  };

  fetchScheduleInfo();
}, [students]);


  // ---- SỬA LỖI 2: SOCKET LISTENER ----
  useEffect(() => {
    const handleLocationUpdate = (data) => {
      try {
        console.log("Vị trí xe cập nhật:", data);
        console.log("Thông tin lịch trình hiện tại:", scheduleInfo[0]);
        if (scheduleInfo[0]?.bus_id === data.busId){
          setCurrentLocation({
            lat: data.latitude,
            lng: data.longitude,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    // Lắng nghe sự kiện
    socket.on("bus-location-update", handleLocationUpdate);

    // CLEANUP FUNCTION: Quan trọng! Hủy lắng nghe khi component unmount
    return () => {
        socket.off("bus-location-update", handleLocationUpdate);
    };
  }, [socket]); // Chỉ chạy lại khi biến socket thay đổi (thường là chỉ 1 lần)

  // ---- GEOAPIFY FETCH ----
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchSegment = async (a, b) => {
    const url = `https://api.geoapify.com/v1/routing?waypoints=${a.lat},${a.lng}|${b.lat},${b.lng}&mode=bus&apiKey=${GEOAPIFY_KEY}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      const geometry = json?.features?.[0]?.geometry;
      if (!geometry?.coordinates) return [];
      let coords = [];
      if (geometry.type === "LineString") {
        coords = geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
      } else if (geometry.type === "MultiLineString") {
        coords = geometry.coordinates.flatMap((line) =>
          line.map(([lng, lat]) => ({ lat, lng }))
        );
      }
      return coords.filter(Boolean);
    } catch {
      return [];
    }
  };

  // ---- STATIC ROUTE (BUS ROUTE) ----
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

  // ---- DYNAMIC ROUTE (driver → first stop) ----
  useEffect(() => {
    const buildDynamicRoute = async () => {
      if (
        !currentLocation ||
        !busStops ||
        busStops.length === 0 ||
        isFetchingDynamic.current
      )
        return;

      const nextUnvisited = busStops.find((s) => !s.visited);
      
      if (!nextUnvisited) {
        setDriverToFirstStopCoords([]);
        return;
      }
      
      isFetchingDynamic.current = true;

      const firstStopCoords = {
        lat: Number(nextUnvisited.latitude),
        lng: Number(nextUnvisited.longitude),
      };

      const seg = await fetchSegment(currentLocation, firstStopCoords);

      setDriverToFirstStopCoords(
        seg.length > 0 ? seg : [currentLocation, firstStopCoords]
      );

      isFetchingDynamic.current = false;
    };

    buildDynamicRoute();
  }, [currentLocation, busStops]);

  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "bus-marker-icon",
  });

  // ---- COMBINE POLYLINES ----
  const polylines = useMemo(() => {
    const lines = [];
    if (driverToFirstStopCoords.length > 0)
      lines.push({
        id: "driver-to-stop",
        positions: driverToFirstStopCoords,
        color: "#3b82f6",
        weight: 6,
        dashArray: "10,10",
      });

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

  // ---- MARKERS ----
  const mapMarkers = useMemo(() => {
    return [
      {
        id: "current-vehicle",
        position: currentLocation,
        title: "Xe của bạn",
        type: "bus-current",
        draggable: true,
        onDrag: (pos) => setCurrentLocation(pos),
        icon: busIcon,
      },
      ...busStops.map((stop, idx) => ({
        id: `stop-${stop.id || idx}`,
        position: { lat: stop.latitude, lng: stop.longitude },
        title: `${idx + 1}. ${stop.name}`,
        type: "stop",
      })),
    ];
  }, [currentLocation, busStops]);

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"} gap-6`}>
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm text-gray-600 flex justify-between">
            <span>
              <strong>Trạng thái:</strong> {routeStatus}
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              GPS OK
            </span>
          </div>

          <LeafletMap
            height={isMobile ? "400px" : "600px"}
            center={currentLocation}
            zoom={15}
            markers={mapMarkers}
            polylines={polylines}
            className="w-full rounded-lg shadow-md border"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Các điểm đón/trả</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto space-y-4">
              {studentInfo.length === 0 && (
                <p className="text-sm text-center text-gray-500 py-4">
                  Chưa có dữ liệu học sinh
                </p>
              )}
              {studentInfo.map((student, index) => (
                <div key={student.id || index} className="border-l-2 border-gray-200 pl-4 pb-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border space-y-1">
                    <p className="font-semibold text-sm">
                      Họ và tên: {student.name}
                    </p>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>
                        Điểm đón: {student.pickup_point.name || "Đang cập nhật"}
                      </span>
                      <span>
                        Điểm trả: {student.dropoff_point.name || "Đang cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}