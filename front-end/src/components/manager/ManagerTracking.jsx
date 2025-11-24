import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { LeafletMap } from "../map/LeafletMap";
import { useIsMobile } from "../ui/use-mobile";
import { io } from "socket.io-client";
import {
  MapPin,
  RefreshCw,
  Map,
  List,
  Bus,
  Clock,
  Gauge,
  Users,
} from "lucide-react";
import { getAllBus, getAllRoute } from "../../service/adminService";
import { useNotificationHelpers } from "../useNotificationHelpers";

const SOCKET_URL = "http://26.58.101.232:5000"; // giữ như DriverGPS

export default function ManagerTracking() {
  const { showError, showSuccess } = useNotificationHelpers();
  const [vehicles, setVehicles] = useState([]); // mỗi phần tử: { id, license_plate, driverName, route, position:{lat,lng}, speed, status, lastUpdate, studentsOnBoard, totalCapacity }
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isTracking, setIsTracking] = useState(true);
  const [viewMode, setViewMode] = useState("map");
  const isMobile = useIsMobile();

  const socketRef = useRef(null);

  // Lấy danh sách xe ban đầu từ backend
  useEffect(() => {
    let mounted = true;
    const fetchBuses = async () => {
      try {
        const res = await getAllBus();
        const data = res?.data?.DT || res?.data || [];
        if (!Array.isArray(data) && typeof data === "object") {
          // trả về object chứa list
          const arr = Array.isArray(data?.buses) ? data.buses : [];
          if (mounted) setVehicles(arr.map(mapBusFromApi));
        } else {
          if (mounted) setVehicles((data || []).map(mapBusFromApi));
        }
      } catch (err) {
        console.warn("Không lấy được danh sách xe từ server:", err);
        // fallback mẫu nếu cần
        if (mounted && vehicles.length === 0) {
          setVehicles([
            {
              id: "XE001",
              license_plate: "59A-12345",
              driverName: "Nguyễn Văn Minh",
              route: "Tuyến 1",
              position: { lat: 10.8231, lng: 106.6297 },
              speed: 35,
              status: "active",
              lastUpdate: new Date().toISOString(),
              studentsOnBoard: 10,
              totalCapacity: 45,
            },
          ]);
        }
      }
    };
    fetchBuses();
    return () => { mounted = false; };
  }, []);

  // Map helper: chuẩn hoá object bus từ API sang state vehicle
  const mapBusFromApi = (b) => {
    return {
      id: b.id ?? b.bus_id ?? b._id ?? String(b.license_plate || b.id || Math.random()),
      licensePlate: b.license_plate ?? b.licensePlate ?? b.plate ?? "",
      driverName: b.driverName ?? b.driver_name ?? (b.driver?.name) ?? "Không rõ",
      route: b.route_name ?? b.route ?? (b.route?.name) ?? "",
      position: {
        lat: Number(b.latitude ?? b.lat ?? 10.8231),
        lng: Number(b.longitude ?? b.lng ?? 106.6297),
      },
      speed: Number(b.speed ?? 0),
      status: b.status ?? "active",
      lastUpdate: b.updatedAt ?? b.lastUpdate ?? new Date().toISOString(),
      studentsOnBoard: Number(b.studentsOnBoard ?? b.load ?? 0),
      totalCapacity: Number(b.capacity ?? 45),
    };
  };

  // Thiết lập socket realtime
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("ManagerTracking socket connected", socket.id);
    });
    socket.on("disconnect", (reason) => {
      console.log("ManagerTracking socket disconnected", reason);
    });

    // broadcast từ server khi 1 xe gửi vị trí
    socket.on("bus_location_broadcast", (data) => {
      // data expected: { bus_id, latitude, longitude, speed?, status? }
      try {
        setVehicles((prev) => {
          const idx = prev.findIndex((v) => String(v.id) === String(data.bus_id));
          const nextPos = { lat: Number(data.latitude), lng: Number(data.longitude) };
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              position: nextPos,
              speed: data.speed ?? updated[idx].speed,
              status: data.status ?? updated[idx].status,
              lastUpdate: new Date().toISOString(),
            };
            return updated;
          } else {
            // thêm xe mới nếu chưa có
            return [
              ...prev,
              {
                id: data.bus_id,
                licensePlate: data.license_plate ?? `Xe ${data.bus_id}`,
                driverName: data.driverName ?? "Không rõ",
                route: data.route ?? "",
                position: nextPos,
                speed: data.speed ?? 0,
                status: data.status ?? "active",
                lastUpdate: new Date().toISOString(),
                studentsOnBoard: 0,
                totalCapacity: 45,
              },
            ];
          }
        });
      } catch (err) {
        console.warn("bus_location_broadcast handler error", err);
      }
    });

    // optional: kênh cập nhật tường minh
    socket.on("bus_location_update", (data) => {
      // same handling
      socket.emit && socket.emit("ack", { ok: true });
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connect_error", err);
    });

    return () => {
      socket.off("bus_location_broadcast");
      socket.off("bus_location_update");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  // Map markers from vehicles
  const mapMarkers = useMemo(() => {
    return vehicles.map((v) => ({
      id: v.id,
      position: v.position,
      title: `${v.licensePlate} — ${v.driverName}\nTuyến: ${v.route}`,
      type: "bus",
      status: v.status === "active" ? "active" : "offline",
      info: `
        <div class="p-2 min-w-[200px]">
          <h4 class="font-medium text-sm">${v.licensePlate}</h4>
          <p class="text-xs text-gray-600">Tài xế: ${v.driverName}</p>
          <p class="text-xs text-gray-600">Tuyến: ${v.route}</p>
          <p class="text-xs text-gray-600">Tốc độ: ${v.speed} km/h</p>
          <p class="text-xs text-gray-600">Cập nhật: ${new Date(v.lastUpdate).toLocaleTimeString("vi-VN")}</p>
        </div>
      `,
    }));
  }, [vehicles]);

  // Routes (có thể lấy từ backend nếu cần)
  const [routes, setRoutes] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAllRoute();
        const data = res?.data?.DT || res?.data || [];
        if (mounted) setRoutes(Array.isArray(data) ? data : []);
      } catch (err) { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, []);

  // UI helpers
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className={isMobile ? "p-3" : ""}>
          <div className={`flex items-center ${isMobile ? "flex-col gap-3" : "justify-between"}`}>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Theo dõi GPS — Quản lý
              <Badge className={`ml-2 ${isTracking ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {isTracking ? "Đang theo dõi" : "Tạm dừng"}
              </Badge>
            </CardTitle>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsTracking((p) => !p)} className={isMobile ? "text-xs" : ""}>
                <RefreshCw className="w-4 h-4 mr-1" /> {isTracking ? "Tạm dừng" : "Tiếp tục"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Map left + Vehicles list right (giống DriverGPS) */}
      <div className={`grid ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"} gap-6`}>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Map className="w-4 h-4" /> Bản đồ</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LeafletMap
                height={isMobile ? "400px" : "600px"}
                center={vehicles[0]?.position ?? { lat: 10.8231, lng: 106.6297 }}
                zoom={13}
                markers={mapMarkers}
                polylines={[]}
                showControls
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bus className="w-4 h-4" /> Danh sách xe</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className={`p-3 rounded-lg border ${selectedVehicleId === v.id ? "bg-blue-50 border-blue-400" : "border-gray-100"} cursor-pointer`}
                    onClick={() => setSelectedVehicleId(selectedVehicleId === v.id ? "" : v.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(v.status)}`} />
                        <div>
                          <p className="font-medium">{v.licensePlate}</p>
                          <p className="text-sm text-muted-foreground">{v.driverName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{v.route}</p>
                        <p className="text-xs text-muted-foreground">Cập nhật: {new Date(v.lastUpdate || Date.now()).toLocaleTimeString("vi-VN")}</p>
                      </div>
                    </div>

                    {selectedVehicleId === v.id && (
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tốc độ</p>
                          <p className="font-medium">{v.speed ?? 0} km/h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Học sinh</p>
                          <p className="font-medium">{v.studentsOnBoard ?? 0}/{v.totalCapacity ?? "-"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid ${isMobile ? "grid-cols-2" : "md:grid-cols-2"} gap-4`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><Bus className="w-6 h-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Xe hoạt động</p>
                <p className="font-semibold">{vehicles.filter((v) => v.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Users className="w-6 h-6 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng H.sinh (ước tính)</p>
                <p className="font-semibold">{vehicles.reduce((sum, v) => sum + (v.studentsOnBoard || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
