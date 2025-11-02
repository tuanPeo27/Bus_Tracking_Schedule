import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import { LeafletMap } from "../map/LeafletMap";
import { Navigation, MapPin, Gauge, Clock, Route } from "lucide-react";

export default function DriverGPS({ vehicleId }) {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 10.8231,
    lng: 106.6297,
    speed: 35,
    timestamp: new Date(),
  });

  const [isTracking, setIsTracking] = useState(true);
  const isMobile = useIsMobile();

  // Mock GPS tracking simulation
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setCurrentLocation((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
        speed: Math.max(
          0,
          Math.min(60, prev.speed + (Math.random() - 0.5) * 10)
        ),
        timestamp: new Date(),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const upcomingStops = [
    {
      name: "Ngã tư Hàng Xanh",
      distance: 1.2,
      estimatedTime: "2 phút",
      type: "pickup",
    },
    {
      name: "Cầu Sài Gòn",
      distance: 3.5,
      estimatedTime: "6 phút",
      type: "pickup",
    },
    {
      name: "Chợ Thủ Đức",
      distance: 7.8,
      estimatedTime: "12 phút",
      type: "dropoff",
    },
    {
      name: "Trường THPT Nguyễn Du",
      distance: 12.5,
      estimatedTime: "18 phút",
      type: "dropoff",
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
      {
        id: "current-vehicle",
        position: currentLocation,
        title: `Xe ${vehicleId}`,
        type: "bus",
      },
      ...upcomingStops.map((stop, index) => ({
        id: `stop-${index}`,
        position: {
          lat: currentLocation.lat + (Math.random() - 0.5) * 0.01,
          lng: currentLocation.lng + (Math.random() - 0.5) * 0.01,
        },
        title: stop.name,
        type: stop.type === "pickup" ? "stop" : "school",
      })),
    ],
    [currentLocation, upcomingStops, vehicleId]
  );

  // Routes for the map
  const mapRoutes = useMemo(
    () => [
      {
        id: "current-route",
        path: [
          currentLocation,
          {
            lat: currentLocation.lat + 0.005,
            lng: currentLocation.lng + 0.005,
          },
          { lat: currentLocation.lat + 0.01, lng: currentLocation.lng + 0.01 },
          {
            lat: currentLocation.lat + 0.015,
            lng: currentLocation.lng + 0.005,
          },
        ],
        color: "#3b82f6",
        strokeWeight: 4,
        title: "Tuyến hiện tại",
      },
    ],
    [currentLocation]
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
