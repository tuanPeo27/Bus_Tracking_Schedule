import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import { LeafletMap } from "../map/LeafletMap";
import { useNotificationHelpers } from "../useNotificationHelpers";
import { io } from "socket.io-client";
import { getBusStopsByRouteId } from "../../service/driverService";

const GEOAPIFY_KEY = "2b833a5c3c1649d89c2e52d7976c7534";

export default function DriverGPS({ route_id, vehicle_id }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [otherBuses, setOtherBuses] = useState({});
  const isMobile = useIsMobile();
  const notifications = useNotificationHelpers();

  const [busStops, setBusStops] = useState([]);
  
  // Tách ra 2 state riêng biệt cho đường đi
  const [staticRouteCoords, setStaticRouteCoords] = useState([]); // Đường nối các trạm (Cố định)
  const [driverToFirstStopCoords, setDriverToFirstStopCoords] = useState([]); // Đường từ Tài xế -> Trạm 1 (Thay đổi)
  
  const [routeStatus, setRouteStatus] = useState("idle");
  
  // Cờ kiểm soát việc fetch
  const isFetchingStatic = useRef(false);
  const isFetchingDynamic = useRef(false);

  const socket = useMemo(() => io("http://26.58.101.232:5000"), []);

  // 1. Lấy danh sách trạm
  useEffect(() => {
    if (route_id) {
      const fetchBusStops = async () => {
        try {
          const res = await getBusStopsByRouteId(route_id);
          if (res && res.data && res.data.EC === 0) {
            // Sắp xếp trạm theo thứ tự (order_index) nếu có, hoặc theo ID
            const sortedStops = res.data.DT || []; 
            setBusStops(sortedStops);
          }
        } catch (err) {
          console.error("Error fetching bus stops", err);
        }
      };
      fetchBusStops();
    }
  }, [route_id]);

  // 2. Xử lý Socket và GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      const errorMsg = "Trình duyệt không hỗ trợ GPS.";
      setLocationError(errorMsg);
      return;
    }

    socket.on("bus_location_broadcast", (data) => {
      if (data.bus_id !== vehicle_id) {
        setOtherBuses((prev) => ({ ...prev, [data.bus_id]: { lat: data.latitude, lng: data.longitude } }));
      }
    });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        socket.emit("bus_location_update", { bus_id: vehicle_id, latitude, longitude });
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

  // --- Helper Functions ---
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchSegment = async (a, b) => {
    const url = `https://api.geoapify.com/v1/routing?waypoints=${a.lat},${a.lng}|${b.lat},${b.lng}&mode=drive&apiKey=${GEOAPIFY_KEY}`;
    try {
      const res = await fetch(url);
      if (!res.ok){
        return [];
      }
      const json = await res.json();
      const coords = json?.features?.[0]?.geometry?.coordinates || [];
      console
      return coords.map((c) => ({ lat: c[1], lng: c[0] }));
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
      if (staticRouteCoords.length > 0) return; // Đã có đường rồi thì thôi

      isFetchingStatic.current = true;
      setRouteStatus("Đang vẽ tuyến đường cố định...");
      
      let allCoords = [];
      const stops = busStops.map(s => ({ lat: Number(s.latitude), lng: Number(s.longitude) }));

      for (let i = 0; i < stops.length - 1; i++) {
        // Delay nhỏ để tránh spam API
        await sleep(200); 
        const seg = await fetchSegment(stops[i], stops[i + 1]);
        
        if (seg.length > 0) {
          
          // Nối mảng, tránh trùng điểm nối
          if (allCoords.length > 0) {
            allCoords = [...allCoords, ...seg.slice(1)];
            console.log("BayGa");
            } else {
              console.log("XamLon");
                 allCoords = [...seg];
            }
        } else {
            // Fallback đường thẳng nếu API lỗi
            allCoords.push(stops[i], stops[i+1]);
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

      const firstStop = { lat: Number(busStops[0].latitude), lng: Number(busStops[0].longitude) };
      
      // Fetch đoạn đường từ Tài xế -> Trạm 1
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
        weight: 4,
        opacity: 0.8,
        dashArray: "10, 10", // Tạo hiệu ứng nét đứt để phân biệt
      });
    }

    // Đường màu Xanh lá (Liền mạch): Tuyến đường chính
    if (staticRouteCoords.length > 0) {
      lines.push({
        id: "route-static-busline",
        positions: staticRouteCoords,
        color: "#28a745", // Green
        weight: 6,
        opacity: 1,
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
        type: "bus-current", // Bạn có thể custom icon trong LeafletMap dựa trên type này
      },
      ...busStops.map((stop, index) => ({
        id: `stop-${stop.id || index}`,
        position: { lat: stop.latitude, lng: stop.longitude },
        title: `${index + 1}. ${stop.name}`, // Đánh số thứ tự trạm
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
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${index === 0 ? 'border-blue-500 bg-white' : 'border-green-500 bg-green-500'}`}></div>
                    
                    <div className="bg-white p-3 rounded-lg border shadow-sm -mt-1 ml-2">
                        <div className="flex justify-between items-start">
                            <p className="font-semibold text-sm text-gray-800">Trạm {index + 1}: {stop.name}</p>
                            <Badge variant="outline" className="text-[10px]">Điểm dừng</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{stop.address || "Đang cập nhật địa chỉ"}</p>
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