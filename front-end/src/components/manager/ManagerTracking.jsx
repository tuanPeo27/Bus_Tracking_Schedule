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
import socket from "../../setup/socket";
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
import L from "leaflet";

const SOCKET_URL = "http://localhost:5000"; // giữ như DriverGPS

export default function ManagerTracking() {
  const { showError, showSuccess } = useNotificationHelpers();
  const [vehicles, setVehicles] = useState([]); // mỗi phần tử: { id, license_plate, driverName, route, position:{lat,lng}, speed, status, lastUpdate, studentsOnBoard, totalCapacity }
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isTracking, setIsTracking] = useState(true);
  const [activeBusSet, setActiveBusSet] = useState(new Set());
  const [viewMode, setViewMode] = useState("map");
  const activeTimersRef = useRef({}); // key: busId, value: timeoutId
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

      }
    };
    fetchBuses();
    return () => { mounted = false; };
  }, []);

  // Map helper: chuẩn hoá object bus từ API sang state vehicle
  const mapBusFromApi = (b) => {
    return {
      id: b.id ?? b.busId ?? b._id ?? String(b.license_plate || b.id || Math.random()),
      licensePlate: b.license_plate ?? b.licensePlate ?? b.plate ?? "",
      position: {
        lat: Number(b.latitude ?? b.lat ?? 10.8231),
        lng: Number(b.longitude ?? b.lng ?? 106.6297),
      },
      lastUpdate: b.updatedAt ?? b.lastUpdate ?? new Date().toISOString(),
    };
  };

  // Thiết lập socket realtime
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("disconnect", (reason) => {
      console.log("ManagerTracking socket disconnected", reason);
    });

    // broadcast từ server khi 1 xe gửi vị trí
    socket.on("bus-location-update", (data) => {
      // data = { busId, latitude, longitude, timestamp }

      console.log("Received bus-location-update", data);
      setActiveBusSet(prev => {
        const newSet = new Set(prev);
        newSet.add(data.busId); // đánh dấu xe đang hoạt động
        return newSet;
      });

      // Xóa timeout cũ nếu có
      if (activeTimersRef.current[data.busId]) {
        clearTimeout(activeTimersRef.current[data.busId]);
      }

      // Set timeout mới 5s
      activeTimersRef.current[data.busId] = setTimeout(() => {
        setActiveBusSet(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.busId); // xe không hoạt động nữa → tắt highlight
          return newSet;
        });
        delete activeTimersRef.current[data.busId];
      }, 5000);
      setVehicles((prev) => {
        // tìm đúng bus đã tồn tại trong DB
        return prev.map((v) => {
          if (String(v.id) === String(data.busId)) {
            return {
              ...v,
              position: {
                lat: Number(data.latitude),
                lng: Number(data.longitude),
              },
              lastUpdate: data.timestamp ?? new Date().toISOString(),
            };
          }

          return v;
        });
      });
    });

    // optional: kênh cập nhật tường minh


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

  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "bus-marker-icon",
  });
  // Map markers from vehicles
  const mapMarkers = useMemo(() => {
    return vehicles.map((v) => ({
      id: v.id,
      position: v.position,
      title: `${v.licensePlate} `,
      type: "bus",
      info: `
        <div class="p-2 min-w-[200px]">
          <h4 class="font-medium text-sm">${v.licensePlate}</h4>
        </div>
      `,
      icon: busIcon,
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
                        <div className={`w-3 h-3 rounded-full ${activeBusSet.has(v.id) ? "bg-green-500" : "bg-gray-500"}`} />
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
