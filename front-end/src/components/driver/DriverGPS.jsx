import React, { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import { LeafletMap } from "../map/LeafletMap";
import { Navigation, MapPin, Gauge, Clock, Route } from "lucide-react";

export default function DriverGPS({ vehicleId, socket }) {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 10.8231, // Vị trí mặc định
    lng: 106.6297,
    speed: 35,
    timestamp: new Date(),
  });

  const [isTracking, setIsTracking] = useState(true);
  const [otherBuses, setOtherBuses] = useState({}); // State để lưu vị trí các xe khác
  const isMobile = useIsMobile();

  // Real-time GPS tracking using Geolocation API and Socket.IO
  useEffect(() => {
    if (!isTracking || !socket) return;

    // 2. Lắng nghe vị trí của các xe khác
    socket.on("bus_location_broadcast", (data) => {
      console.log("Vị trí mới từ xe khác:", data);
      if (data.bus_id !== vehicleId) {
        setOtherBuses(prev => ({
          ...prev,
          [data.bus_id]: { lat: data.latitude, lng: data.longitude }
        }));
      }
    });

    // 3. Lấy vị trí của tài xế và gửi lên server
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const newLocation = {
          lat: latitude,
          lng: longitude,
          speed: speed ? speed * 3.6 : 0, // m/s to km/h
          timestamp: new Date(),
        };
        setCurrentLocation(newLocation);

        // Gửi vị trí lên server
        socket.emit("bus_location_update", {
          bus_id: vehicleId,
          latitude: latitude,
          longitude: longitude,
        });
      },
      (error) => console.error("Lỗi lấy vị trí GPS:", error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Cleanup khi component unmount hoặc khi socket/tracking thay đổi
    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off("bus_location_broadcast");
    };
  }, [isTracking, vehicleId, socket]);

  const upcomingStops = [
    {
      name: "Ngã tư Hàng Xanh",
      distance: 1.2,
      estimatedTime: "2 phút",
      type: "pickup",
      position: { lat: 10.7917, lng: 106.7028 }
    },
    {
      name: "Cầu Sài Gòn",
      distance: 3.5,
      estimatedTime: "6 phút",
      type: "pickup",
      position: { lat: 10.7968, lng: 106.7196 }
    },
    {
      name: "Chợ Thủ Đức",
      distance: 7.8,
      estimatedTime: "12 phút",
      type: "dropoff",
      position: { lat: 10.8494, lng: 106.7537 }
    },
    {
      name: "Trường THPT Nguyễn Du",
      distance: 12.5,
      estimatedTime: "18 phút",
      type: "dropoff",
      position: { lat: 10.7783, lng: 106.6983 }
    },
  ];

  const routeProgress = {
    completed: 8.5,
    total: 25.0,
    percentage: Math.round((8.5 / 25.0) * 100),
  };

  // Markers for the map
  const mapMarkers = useMemo(
    () => [
      // Vị trí xe hiện tại
      {
        id: "current-vehicle",
        position: currentLocation,
        title: `Xe ${vehicleId} (Bạn)`,
        type: "bus-current",
      },
      // Các điểm dừng sắp tới
      ...upcomingStops.map((stop, index) => ({
        id: `stop-${index}`,
        position: stop.position,
        title: stop.name,
        type: stop.type === "pickup" ? "stop" : "school",
      })),
      // Vị trí các xe khác
      ...Object.entries(otherBuses).map(([busId, pos]) => ({
        id: `bus-${busId}`,
        position: pos,
        title: `Xe ${busId}`,
        type: "bus",
      }))
    ],
    [currentLocation, upcomingStops, vehicleId, otherBuses]
  );

  // Routes for the map (để trống vì không có dữ liệu tuyến đường thực tế)
  const mapRoutes = useMemo(
    () => [],
    []
  );

  return (
    <div className="space-y-6">
      {/* GPS Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Theo dõi GPS
            <Badge
              className={`ml-auto ${
                isTracking
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isTracking ? "Đang theo dõi" : "Tạm dừng"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Vị trí hiện tại</p>
                <p className="font-medium">
                  {currentLocation.lat.toFixed(6)},{" "}
                  {currentLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Vận tốc</p>
                <p className="font-medium">
                  {Math.round(currentLocation.speed)} km/h
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Cập nhật lần cuối
                </p>
                <p className="font-medium">
                  {currentLocation.timestamp.toLocaleTimeString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tiến độ tuyến</p>
                <p className="font-medium">{routeProgress.percentage}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className={`grid ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"} gap-6`}
      >
        {/* Map Container */}
        <div className="lg:col-span-2">
          {/* Đây là nơi component LeafletMap được "gắn vào" và hiển thị */}
          <LeafletMap
            height={isMobile ? "400px" : "600px"}
            center={currentLocation}
            zoom={15}
            markers={mapMarkers}
            routes={mapRoutes}
            showTraffic={true}
            showControls={true}
            className="w-full"
          />
        </div>

        {/* Upcoming Stops */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Điểm dừng sắp tới</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingStops.map((stop, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      stop.type === "pickup" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{stop.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{stop.distance} km</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{stop.estimatedTime}</span>
                    </div>
                  </div>
                  <Badge
                    variant={stop.type === "pickup" ? "default" : "secondary"}
                  >
                    {stop.type === "pickup" ? "Đón" : "Trả"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Route Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê hành trình</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Hoàn thành</span>
                  <span className="text-sm font-medium">
                    {routeProgress.completed}/{routeProgress.total} km
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${routeProgress.percentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
