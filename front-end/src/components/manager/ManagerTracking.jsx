import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import VehicleTracker from "../map/VehicleTracker";
import { LeafletMap } from "../map/LeafletMap";
import { useIsMobile } from "../ui/use-mobile";
import {
  MapPin,
  Navigation,
  RefreshCw,
  Maximize,
  Bus,
  Users,
  Clock,
  Gauge,
  AlertTriangle,
  CheckCircle,
  PauseCircle,
  List,
  Map,
} from "lucide-react";

export default function ManagerTracking() {
  const [vehicles, setVehicles] = useState([
    {
      id: "XE001",
      licensePlate: "59A-12345",
      driverName: "Nguyễn Văn Minh",
      route: "Tuyến 1",
      position: { lat: 10.8231, lng: 106.6297 },
      speed: 35,
      status: "active",
      lastUpdate: new Date().toLocaleTimeString("vi-VN"),
      studentsOnBoard: 42,
      totalCapacity: 45,
      fuel: 75,
      temperature: 28,
      nextStop: "Trường THPT Lê Quý Đôn",
      estimatedArrival: "15:30",
    },
    {
      id: "XE002",
      licensePlate: "59A-67890",
      driverName: "Trần Văn Hùng",
      route: "Tuyến 2",
      position: { lat: 10.835, lng: 106.64 },
      speed: 28,
      status: "active",
      lastUpdate: new Date().toLocaleTimeString("vi-VN"),
      studentsOnBoard: 38,
      totalCapacity: 45,
      fuel: 65,
      temperature: 29,
      nextStop: "Khu đô thị Phú Mỹ Hưng",
      estimatedArrival: "15:45",
    },
    {
      id: "XE003",
      licensePlate: "59A-11111",
      driverName: "Lê Thị Lan",
      route: "Tuyến 3",
      position: { lat: 10.81, lng: 106.65 },
      speed: 0,
      status: "stopped",
      lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(
        "vi-VN"
      ),
      studentsOnBoard: 45,
      totalCapacity: 45,
      fuel: 80,
      temperature: 27,
      nextStop: "Bệnh viện Chợ Rẫy",
      estimatedArrival: "16:00",
    },
  ]);

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isTracking, setIsTracking] = useState(true);
  const [viewMode, setViewMode] = useState("map");
  const isMobile = useIsMobile();

  // Tạo markers cho bản đồ
  const mapMarkers = vehicles.map((vehicle) => ({
    id: vehicle.id,
    position: vehicle.position,
    title: `${vehicle.licensePlate} - ${vehicle.driverName}`,
    type: "bus",
    status:
      vehicle.status === "active"
        ? "active"
        : vehicle.status === "stopped"
        ? "warning"
        : "danger",
    info: `
      <div class="p-2 min-w-[200px]">
        <h4 class="font-medium text-sm">${vehicle.licensePlate}</h4>
        <p class="text-xs text-gray-600">Tài xế: ${vehicle.driverName}</p>
        <p class="text-xs text-gray-600">Tuyến: ${vehicle.route}</p>
        <p class="text-xs text-gray-600">Tốc độ: ${vehicle.speed} km/h</p>
        <p class="text-xs text-gray-600">Học sinh: ${vehicle.studentsOnBoard}/${vehicle.totalCapacity}</p>
        <p class="text-xs text-gray-600">Nhiên liệu: ${vehicle.fuel}%</p>
        <p class="text-xs text-gray-600">Trạm tiếp theo: ${vehicle.nextStop}</p>
      </div>
    `,
  }));

  // Tạo routes mẫu
  const mapRoutes = [
    {
      id: "route1",
      title: "Tuyến 1",
      color: "#3b82f6",
      path: [
        { lat: 10.8231, lng: 106.6297 },
        { lat: 10.83, lng: 106.635 },
        { lat: 10.835, lng: 106.64 },
        { lat: 10.84, lng: 106.645 },
      ],
    },
    {
      id: "route2",
      title: "Tuyến 2",
      color: "#10b981",
      path: [
        { lat: 10.835, lng: 106.64 },
        { lat: 10.838, lng: 106.643 },
        { lat: 10.841, lng: 106.646 },
        { lat: 10.844, lng: 106.649 },
      ],
    },
    {
      id: "route3",
      title: "Tuyến 3",
      color: "#f59e0b",
      path: [
        { lat: 10.81, lng: 106.65 },
        { lat: 10.815, lng: 106.655 },
        { lat: 10.82, lng: 106.66 },
        { lat: 10.825, lng: 106.665 },
      ],
    },
  ];

  // Simulate real-time tracking
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((vehicle) => ({
          ...vehicle,
          position: {
            lat: vehicle.position.lat + (Math.random() - 0.5) * 0.001,
            lng: vehicle.position.lng + (Math.random() - 0.5) * 0.001,
          },
          speed:
            vehicle.status === "active"
              ? Math.max(
                  0,
                  Math.min(60, vehicle.speed + (Math.random() - 0.5) * 10)
                )
              : 0,
          lastUpdate: new Date().toLocaleTimeString("vi-VN"),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "break":
        return "bg-yellow-500";
      case "incident":
        return "bg-red-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatLastUpdate = (date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    return `${Math.floor(diff / 3600)} giờ trước`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className={isMobile ? "p-3" : ""}>
          <div
            className={`flex items-center ${
              isMobile ? "flex-col gap-3" : "justify-between"
            }`}
          >
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Theo dõi GPS thời gian thực
              <Badge
                className={`ml-2 ${
                  isTracking
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isTracking ? "Đang theo dõi" : "Tạm dừng"}
              </Badge>
            </CardTitle>

            <div className="flex gap-2">
              <Select
                value={viewMode}
                onValueChange={(value) => setViewMode(value)}
              >
                <SelectTrigger
                  className={`w-auto ${isMobile ? "text-xs" : ""}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      Xem bản đồ
                    </div>
                  </SelectItem>
                  <SelectItem value="list">
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4" />
                      Xem danh sách
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTracking(!isTracking)}
                className={isMobile ? "text-xs" : ""}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                {isTracking ? "Tạm dừng" : "Tiếp tục"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content based on view mode */}
      {viewMode === "map" ? (
        <LeafletMap
          height={isMobile ? "400px" : "600px"}
          center={{ lat: 10.8231, lng: 106.6297 }}
          zoom={13}
          markers={mapMarkers}
          routes={mapRoutes}
          showTraffic={true}
          showControls={true}
          className="w-full"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách xe buýt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`p-4 border rounded-lg ${
                    selectedVehicleId === vehicle.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  } cursor-pointer transition-colors`}
                  onClick={() =>
                    setSelectedVehicleId(
                      selectedVehicleId === vehicle.id ? "" : vehicle.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          vehicle.status
                        )}`}
                      ></div>
                      <div>
                        <p className="font-medium">{vehicle.licensePlate}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.driverName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">{vehicle.route}</p>
                      <p className="text-xs text-muted-foreground">
                        Cập nhật: {vehicle.lastUpdate}
                      </p>
                    </div>
                  </div>

                  {selectedVehicleId === vehicle.id && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tốc độ</p>
                        <p className="font-medium">{vehicle.speed} km/h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Học sinh</p>
                        <p className="font-medium">
                          {vehicle.studentsOnBoard}/{vehicle.totalCapacity}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Nhiên liệu</p>
                        <p className="font-medium">{vehicle.fuel}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Nhiệt độ</p>
                        <p className="font-medium">{vehicle.temperature}°C</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Trạm tiếp theo</p>
                        <p className="font-medium">{vehicle.nextStop}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Dự kiến đến</p>
                        <p className="font-medium">
                          {vehicle.estimatedArrival}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div
        className={`grid ${isMobile ? "grid-cols-2" : "md:grid-cols-4"} gap-4`}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Navigation className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Xe hoạt động</p>
                <p className="font-semibold">
                  {vehicles.filter((v) => v.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gauge className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tốc độ TB</p>
                <p className="font-semibold">
                  {Math.round(
                    vehicles.reduce((sum, v) => sum + v.speed, 0) /
                      vehicles.length
                  )}{" "}
                  km/h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng H.sinh</p>
                <p className="font-semibold">
                  {vehicles.reduce((sum, v) => sum + v.studentsOnBoard, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nhiên liệu TB</p>
                <p className="font-semibold">
                  {Math.round(
                    vehicles.reduce((sum, v) => sum + v.fuel, 0) /
                      vehicles.length
                  )}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
