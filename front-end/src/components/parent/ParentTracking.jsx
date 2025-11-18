import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { LeafletMap } from "../map/LeafletMap";
import { useIsMobile } from "../ui/use-mobile";
import {
  MapPin,
  Navigation,
  Bus,
  Clock,
  RefreshCw,
  Bell,
  Phone,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function ParentTracking({ children }) {
  const [busLocation, setBusLocation] = useState({
    lat: 10.8231,
    lng: 106.6297,
    speed: 32,
    timestamp: new Date(),
  });

  const [isTracking, setIsTracking] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const isMobile = useIsMobile();

  // Mock real-time tracking
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setBusLocation((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0005,
        lng: prev.lng + (Math.random() - 0.5) * 0.0005,
        speed: Math.max(
          0,
          Math.min(50, prev.speed + (Math.random() - 0.5) * 8)
        ),
        timestamp: new Date(),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const child = Array.isArray(children) ? children[0] : children;
  if (!child) {
    return (
      <div className="text-center p-4">
        ⚠️ Không có dữ liệu học sinh để theo dõi.
      </div>
    );
  }

  const busInfo = {
    vehicle: child.vehicle || "51B-12345",
    driver: child.driver || "Nguyễn Văn A",
    route: child.route || "Tuyến 01",
    status: "on_route",
    nextStop: "Chợ Thủ Đức",
    estimatedArrival: "12 phút",
    distanceToChild: 2.8,
    studentsOnBoard: 28,
  };

  const upcomingStops = [
    { name: "Ngã tư Hàng Xanh", status: "passed", time: "07:10", distance: 0 },
    { name: "Cầu Sài Gòn", status: "current", time: "07:22", distance: 1.2 },
    { name: "Chợ Thủ Đức", status: "upcoming", time: "07:35", distance: 3.5 },
    {
      name: "Điểm đón con em",
      status: "upcoming",
      time: "07:45",
      distance: 5.2,
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "on_route":
        return (
          <Badge className="bg-green-100 text-green-800">Đang di chuyển</Badge>
        );
      case "at_stop":
        return (
          <Badge className="bg-blue-100 text-blue-800">Tại điểm dừng</Badge>
        );
      case "delayed":
        return <Badge className="bg-red-100 text-red-800">Bị trễ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStopIcon = (status) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "current":
        return <Navigation className="w-4 h-4 text-blue-600" />;
      case "upcoming":
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatLastUpdate = (date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    return `${Math.floor(diff / 3600)} giờ trước`;
  };

  // ✅ Dữ liệu routes an toàn
  const routes = [
    {
      id: "bus-route",
      path: [
        busLocation,
        { lat: busLocation.lat + 0.005, lng: busLocation.lng + 0.005 },
        { lat: busLocation.lat + 0.01, lng: busLocation.lng + 0.01 },
        { lat: busLocation.lat + 0.015, lng: busLocation.lng + 0.015 },
        { lat: busLocation.lat + 0.02, lng: busLocation.lng + 0.02 },
      ],
      color: "#3b82f6",
      strokeWeight: 4,
      title: busInfo.route,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Theo dõi xe buýt - {child.name || "Học sinh"}
              {getStatusBadge(busInfo.status)}
            </CardTitle>

            <div className="flex gap-2">
              <Button
                variant={notificationsEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <Bell className="w-4 h-4 mr-2" />
                {notificationsEnabled ? "Tắt thông báo" : "Bật thông báo"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTracking(!isTracking)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isTracking ? "Tạm dừng" : "Tiếp tục"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div
        className={`grid ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"} gap-6`}
      >
        {/* Map View */}
        <div className="lg:col-span-2">
          <LeafletMap
            height={isMobile ? "300px" : "400px"}
            center={busLocation || { lat: 10.762622, lng: 106.660172 }}
            zoom={14}
            markers={[
              {
                id: "current-bus",
                position: busLocation,
                title: `Xe ${busInfo.vehicle}`,
                type: "bus",
                status: "active",
                info: `
                  <div class="min-w-[200px]">
                    <div class="font-medium text-lg mb-2">Xe ${
                      busInfo.vehicle
                    }</div>
                    <div class="space-y-1 text-sm">
                      <div><strong>Tài xế:</strong> ${busInfo.driver}</div>
                      <div><strong>Tốc độ:</strong> ${Math.round(
                        busLocation.speed
                      )} km/h</div>
                      <div><strong>Học sinh:</strong> ${
                        busInfo.studentsOnBoard
                      } em</div>
                      <div><strong>Trạm tiếp theo:</strong> ${
                        busInfo.nextStop
                      }</div>
                      <div><strong>Dự kiến đến:</strong> ${
                        busInfo.estimatedArrival
                      }</div>
                    </div>
                  </div>
                `,
              },
              ...upcomingStops.map((stop, index) => ({
                id: `stop-${index}`,
                position: {
                  lat: busLocation.lat + index * 0.005,
                  lng: busLocation.lng + index * 0.005,
                },
                title: stop.name,
                type: stop.name.includes("con em") ? "home" : "stop",
                status: stop.status === "passed" ? "active" : "inactive",
                info: `
                  <div class="min-w-[150px]">
                    <div class="font-medium text-lg mb-2">${stop.name}</div>
                    <div class="space-y-1 text-sm">
                      <div><strong>Thời gian:</strong> ${stop.time}</div>
                      <div><strong>Khoảng cách:</strong> ${
                        stop.distance
                      } km</div>
                      <div><strong>Trạng thái:</strong> ${
                        stop.status === "passed"
                          ? "Đã qua"
                          : stop.status === "current"
                          ? "Hiện tại"
                          : "Sắp tới"
                      }</div>
                    </div>
                  </div>
                `,
              })),
            ]}
            routes={routes}
            showTraffic={true}
            showControls={true}
          />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Lộ trình */}
          <Card>
            <CardHeader>
              <CardTitle>Lộ trình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingStops.map((stop, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      stop.status === "current"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    {getStopIcon(stop.status)}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          stop.status === "current" ? "text-blue-800" : ""
                        }`}
                      >
                        {stop.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{stop.time}</span>
                        {stop.distance > 0 && (
                          <>
                            <span>•</span>
                            <span>{stop.distance} km</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hành động nhanh */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Gọi điện cho tài xế
              </Button>

              <Button className="w-full justify-start" variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Nhắc nhở đón con
              </Button>

              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Báo cáo sự cố
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
