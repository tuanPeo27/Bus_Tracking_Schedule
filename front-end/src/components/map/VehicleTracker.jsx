import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { LeafletMap } from "./LeafletMap";
import { useIsMobile } from "../ui/use-mobile";
import {
  Bus,
  Navigation,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle,
  Zap,
  Fuel,
  Thermometer,
} from "lucide-react";

export default function VehicleTracker({
  vehicles = [],
  selectedVehicleId,
  onVehicleSelect,
  showRoutes = true,
  autoRefresh = true,
  refreshInterval = 30000,
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      setSelectedVehicle(vehicle || null);
    }
  }, [selectedVehicleId, vehicles]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // TODO: API fetch live data
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    onVehicleSelect && onVehicleSelect(vehicle.id);
  };

  const getVehicleMarkers = () =>
    vehicles.map((vehicle) => ({
      id: vehicle.id,
      position: vehicle.position,
      title: `${vehicle.licensePlate} - ${vehicle.driverName}`,
      type: "bus",
      status:
        vehicle.status === "active"
          ? "active"
          : vehicle.status === "incident"
          ? "danger"
          : "warning",
      info: `
        <div class="min-w-[200px]">
          <div class="font-medium text-lg mb-2">${vehicle.licensePlate}</div>
          <div class="space-y-1 text-sm">
            <div><strong>Tài xế:</strong> ${vehicle.driverName}</div>
            <div><strong>Tuyến:</strong> ${vehicle.route}</div>
            <div><strong>Tốc độ:</strong> ${vehicle.speed} km/h</div>
            <div><strong>Học sinh:</strong> ${vehicle.studentsOnBoard}/${vehicle.totalCapacity}</div>
            <div><strong>Trạm tiếp theo:</strong> ${vehicle.nextStop}</div>
          </div>
        </div>
      `,
    }));

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "stopped":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-blue-100 text-blue-800";
      case "incident":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "stopped":
        return <Clock className="w-4 h-4" />;
      case "maintenance":
        return <Zap className="w-4 h-4" />;
      case "incident":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bus className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "stopped":
        return "Đang dừng";
      case "maintenance":
        return "Bảo trì";
      case "incident":
        return "Sự cố";
      default:
        return "Không xác định";
    }
  };

  const mapCenter = selectedVehicle
    ? selectedVehicle.position
    : vehicles.length > 0
    ? vehicles[0].position
    : { lat: 10.8231, lng: 106.6297 };

  return (
    <div
      className={`grid ${
        isMobile ? "grid-rows-[auto_1fr]" : "grid-cols-[350px_1fr]"
      } gap-4 h-full`}
    >
      {/* Vehicle List */}
      <Card className={`${isMobile ? "order-2" : ""}`}>
        <CardHeader className={isMobile ? "p-3" : ""}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5" />
              Danh sách xe
            </div>
            <Badge variant="outline">{vehicles.length} xe</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent
          className={`${
            isMobile ? "p-2" : ""
          } space-y-3 max-h-[400px] overflow-y-auto`}
        >
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedVehicle?.id === vehicle.id
                  ? "border-blue-500 bg-blue-50"
                  : ""
              }`}
              onClick={() => handleVehicleSelect(vehicle)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{vehicle.licensePlate}</div>
                  <Badge className={getStatusColor(vehicle.status)}>
                    {getStatusIcon(vehicle.status)}
                    <span className="ml-1">
                      {getStatusText(vehicle.status)}
                    </span>
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {vehicle.speed} km/h
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3" />
                  {vehicle.route}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  {vehicle.studentsOnBoard}/{vehicle.totalCapacity} học sinh
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Tiếp theo: {vehicle.nextStop}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Dự kiến: {vehicle.estimatedArrival}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    {vehicle.fuel}%
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    {vehicle.temperature}°C
                  </div>
                </div>
                <div>Cập nhật: {vehicle.lastUpdate}</div>
              </div>
            </div>
          ))}

          {vehicles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Không có xe nào đang hoạt động</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <div className={`${isMobile ? "order-1" : ""}`}>
        <LeafletMap
          height={isMobile ? "300px" : "600px"}
          center={mapCenter}
          zoom={selectedVehicle ? 15 : 12}
          markers={getVehicleMarkers()}
          showTraffic={true}
          showControls={true}
        />
      </div>
    </div>
  );
}
