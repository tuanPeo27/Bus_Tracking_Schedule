import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import { LeafletMap } from "../map/LeafletMap";
import { io } from "socket.io-client";
import { getBusStopsByRouteId } from "../../service/driverService";

const GEOAPIFY_KEY = "2b833a5c3c1649d89c2e52d7976c7534";

export function ParentTracking({ studentInfo, routeInfo }) {
  const isMobile = useIsMobile();

  const students = Array.isArray(studentInfo)
    ? studentInfo
    : studentInfo
    ? [studentInfo]
    : [];
  const routes = Array.isArray(routeInfo)
    ? routeInfo
    : routeInfo
    ? [routeInfo]
    : [];

  const routeIds = routes.map((r) => r.route?.id);

  const [currentLocation, setCurrentLocation] = useState({
    lat: 10.8231,
    lng: 106.6297,
  });
  const [busStops, setBusStops] = useState([]);
  const [staticRouteCoords, setStaticRouteCoords] = useState([]);
  const [driverToFirstStopCoords, setDriverToFirstStopCoords] = useState([]);
  const [routeStatus, setRouteStatus] = useState("idle");
  const [locationError, setLocationError] = useState("");

  const isFetchingStatic = useRef(false);
  const isFetchingDynamic = useRef(false);

  // ---- SOCKET.IO ----
  const socket = useMemo(() => io("http://26.58.101.232:5000"), []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
    });

    const handleUpdate = (data) => {
      console.log(data);
      setCurrentLocation({
        lat: data.latitude,
        lng: data.longitude,
      });
    };
    socket.on("bus-location-update", handleUpdate);

    return () => {
      socket.off("bus-location-update", handleUpdate);
    };
  }, [socket]);

  // ---- FETCH BUS STOPS ----
  useEffect(() => {
    if (!routeIds || routeIds.length === 0) return;
    const fetchStops = async () => {
      try {
        const res = await getBusStopsByRouteId(routeIds);
        if (res?.data?.EC === 0) setBusStops(res.data.DT || []);
      } catch (e) {
        console.error("Error loading bus stops", e);
      }
    };
    fetchStops();
  }, [routeIds]);

  // ---- GEOAPIFY ROUTE HELPER ----
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

  // ---- STATIC ROUTE ----
  useEffect(() => {
    const build = async () => {
      if (busStops.length < 2 || isFetchingStatic.current) return;
      if (staticRouteCoords.length > 0) return;

      isFetchingStatic.current = true;
      setRouteStatus("Đang vẽ tuyến cố định...");

      const stops = busStops.map((s) => ({
        lat: Number(s.latitude),
        lng: Number(s.longitude),
      }));

      let all = [];
      for (let i = 0; i < stops.length - 1; i++) {
        await sleep(200);
        const seg = await fetchSegment(stops[i], stops[i + 1]);
        if (seg.length > 0)
          all = all.length > 0 ? [...all, ...seg.slice(1)] : [...seg];
        else all.push(stops[i], stops[i + 1]);
      }

      setStaticRouteCoords(all);
      setRouteStatus("Đã tải xong.");
      isFetchingStatic.current = false;
    };
    build();
  }, [busStops]);

  // ---- DYNAMIC ROUTE ----
  useEffect(() => {
    const build = async () => {
      if (
        !currentLocation ||
        busStops.length === 0 ||
        isFetchingDynamic.current
      )
        return;

      isFetchingDynamic.current = true;
      const firstStop = {
        lat: Number(busStops[0].latitude),
        lng: Number(busStops[0].longitude),
      };
      const seg = await fetchSegment(currentLocation, firstStop);
      setDriverToFirstStopCoords(
        seg.length > 0 ? seg : [currentLocation, firstStop]
      );
      isFetchingDynamic.current = false;
    };
    build();
  }, [currentLocation, busStops]);

  // ---- POLYLINES ----
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
    if (staticRouteCoords.length > 0)
      lines.push({
        id: "static-route",
        positions: staticRouteCoords,
        color: "#28a745",
        weight: 4,
        opacity: 0.6,
      });
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
      },
      ...busStops.map((stop, idx) => ({
        id: `stop-${stop.id || idx}`,
        position: { lat: stop.latitude, lng: stop.longitude },
        title: `${idx + 1}. ${stop.name}`,
        type: "stop",
      })),
    ];
  }, [currentLocation, busStops]);

  // ---- RENDER ----
  return (
    <div className="space-y-6">
      <div
        className={`grid ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"} gap-6`}
      >
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm text-gray-600 flex justify-between">
            <span>
              <strong>Trạng thái:</strong> {routeStatus}
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              GPS OK
            </span>
          </div>
          {locationError && (
            <p className="text-red-500 text-sm">{locationError}</p>
          )}
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
              {students.length === 0 && (
                <p className="text-sm text-center text-gray-500 py-4">
                  Chưa có dữ liệu học sinh
                </p>
              )}
              {students.map((student, index) => (
                <div
                  key={student.id || index}
                  className="border-l-2 border-gray-200 pl-4 pb-4"
                >
                  <div className="bg-white p-3 rounded-lg shadow-sm border space-y-1">
                    <p className="font-semibold text-sm">
                      Họ và tên: {student.name}
                    </p>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>
                        Điểm đón:{" "}
                        {student.pickup_point?.name || "Đang cập nhật"}
                      </span>
                      <span>
                        Điểm trả:{" "}
                        {student.dropoff_point?.name || "Đang cập nhật"}
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
