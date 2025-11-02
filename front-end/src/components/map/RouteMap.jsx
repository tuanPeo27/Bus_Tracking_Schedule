import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { LeafletMap } from "./LeafletMap";
import { useIsMobile } from "../ui/use-mobile";
import { Route, MapPin, Clock, Users, School, Home } from "lucide-react";

export function RouteMap({
  routes,
  selectedRouteId,
  onRouteSelect,
  showAnimation = true,
  showStops = true,
}) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [animationEnabled, setAnimationEnabled] = useState(showAnimation);
  const [selectedStop, setSelectedStop] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedRouteId) {
      const route = routes.find((r) => r.id === selectedRouteId);
      setSelectedRoute(route || null);
    } else if (routes.length > 0) {
      setSelectedRoute(routes[0]);
    }
  }, [selectedRouteId, routes]);

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setSelectedStop(null);
    if (onRouteSelect) onRouteSelect(route.id);
  };

  const getStopTypeText = (type) => {
    switch (type) {
      case "school":
        return "Trường học";
      case "regular":
        return "Trạm thường";
      case "home":
        return "Khu dân cư";
      default:
        return "Không xác định";
    }
  };

  const getStopTypeIcon = (type) => {
    switch (type) {
      case "school":
        return <School className="w-4 h-4" />;
      case "regular":
        return <MapPin className="w-4 h-4" />;
      case "home":
        return <Home className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getRouteMarkers = () => {
    if (!selectedRoute || !showStops) return [];

    return selectedRoute.stops.map((stop) => ({
      id: stop.id,
      position: stop.position,
      title: stop.name,
      type: stop.type,
      info: `
        <div class="min-w-[200px]">
          <div class="font-medium text-lg mb-2">${stop.name}</div>
          <div class="space-y-1 text-sm">
            <div><strong>Số học sinh:</strong> ${stop.studentsCount}</div>
            <div><strong>Giờ đến:</strong> ${stop.arrivalTime}</div>
            <div><strong>Giờ khởi hành:</strong> ${stop.departureTime}</div>
            <div><strong>Loại trạm:</strong> ${getStopTypeText(stop.type)}</div>
          </div>
        </div>
      `,
    }));
  };

  const getRoutes = () => {
    if (!selectedRoute) return [];
    return [
      {
        id: selectedRoute.id,
        path: selectedRoute.path,
        color: selectedRoute.color,
        strokeWeight: 4,
        title: selectedRoute.name,
      },
    ];
  };

  const mapCenter =
    selectedRoute && selectedRoute.stops.length > 0
      ? selectedRoute.stops[0].position
      : { lat: 10.8231, lng: 106.6297 };

  return (
    <div
      className={`grid ${
        isMobile ? "grid-rows-[auto_1fr]" : "grid-cols-[350px_1fr]"
      } gap-4 h-full`}
    >
      {/* List Panel */}
      <div className={`space-y-4 ${isMobile ? "order-2" : ""}`}>
        {/* Route List */}
        <Card>
          <CardHeader className={isMobile ? "p-3" : ""}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5" />
                Tuyến đường
              </div>
              <Badge variant="outline">{routes.length} tuyến</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className={`${isMobile ? "p-2" : ""} space-y-2`}>
            {routes.map((route) => (
              <div
                key={route.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedRoute?.id === route.id
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => handleRouteSelect(route)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: route.color }}
                  />
                  <div className="font-medium">{route.name}</div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {route.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>{route.stops.length} trạm</span>
                    <span>{route.totalDistance} km</span>
                    <span>{route.estimatedDuration} phút</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {route.activeVehicles} xe
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stops List */}
        {selectedRoute && showStops && (
          <Card>
            <CardHeader className={isMobile ? "p-3" : ""}>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Trạm dừng
                </div>
                <Badge variant="outline">
                  {selectedRoute.stops.length} trạm
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent
              className={`${
                isMobile ? "p-2" : ""
              } space-y-2 max-h-[300px] overflow-y-auto`}
            >
              {selectedRoute.stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedStop?.id === stop.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedStop(stop)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    {getStopTypeIcon(stop.type)}
                    <div className="font-medium">{stop.name}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {stop.studentsCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {stop.arrivalTime}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getStopTypeText(stop.type)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Map Section */}
      <div className={`${isMobile ? "order-1" : ""}`}>
        <LeafletMap
          height={isMobile ? "350px" : "600px"}
          center={mapCenter}
          zoom={13}
          markers={getRouteMarkers()}
          routes={getRoutes()}
          showTraffic={false}
          showControls={true}
        />
      </div>
    </div>
  );
}

export function RouteStats({ route }) {
  const isMobile = useIsMobile();

  const totalStudents = route.stops.reduce(
    (sum, stop) => sum + stop.studentsCount,
    0
  );
  const schoolStops = route.stops.filter(
    (stop) => stop.type === "school"
  ).length;
  const regularStops = route.stops.filter(
    (stop) => stop.type === "regular"
  ).length;
  const homeStops = route.stops.filter((stop) => stop.type === "home").length;

  return (
    <Card>
      <CardHeader className={isMobile ? "p-3" : ""}>
        <CardTitle className="flex items-center gap-2">
          <Route className="w-5 h-5" />
          Thống kê tuyến {route.name}
        </CardTitle>
      </CardHeader>

      <CardContent className={`${isMobile ? "p-3" : ""} space-y-4`}>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-lg">{route.stops.length}</div>
            <div className="text-sm text-gray-600">Tổng trạm</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-lg">{totalStudents}</div>
            <div className="text-sm text-gray-600">Học sinh</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-lg">{route.totalDistance} km</div>
            <div className="text-sm text-gray-600">Quãng đường</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-lg">
              {route.estimatedDuration} phút
            </div>
            <div className="text-sm text-gray-600">Thời gian</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4" />
              <span className="text-sm">Trường học</span>
            </div>
            <Badge variant="outline">{schoolStops}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Trạm thường</span>
            </div>
            <Badge variant="outline">{regularStops}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="text-sm">Khu dân cư</span>
            </div>
            <Badge variant="outline">{homeStops}</Badge>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Xe đang hoạt động</span>
            <Badge className="bg-green-100 text-green-800">
              {route.activeVehicles} xe
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
