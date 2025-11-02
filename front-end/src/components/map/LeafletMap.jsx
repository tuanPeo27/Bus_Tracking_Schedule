import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import {
  MapPin,
  Navigation,
  Maximize,
  Minimize,
  RotateCcw,
  Layers,
} from "lucide-react";

export function LeafletMap({
  height = "400px",
  center = { lat: 10.8231, lng: 106.6297 }, // TP.HCM
  zoom = 13,
  markers = [],
  routes = [],
  showTraffic = false,
  showControls = true,
  className = "",
  onMapReady,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routesRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapError, setMapError] = useState(false);
  const isMobile = useIsMobile();
  const initAttemptedRef = useRef(false);

  // Load Leaflet
  useEffect(() => {
    // Check if Leaflet is already loaded
    if (window.L) {
      setIsLoaded(true);
      return;
    }

    // Check if already loading
    const existingScript = document.querySelector('script[src*="leaflet.js"]');
    const existingLink = document.querySelector('link[href*="leaflet.css"]');

    if (existingScript && existingLink) {
      // Already loading, wait for it
      const checkInterval = setInterval(() => {
        if (window.L) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);

      setTimeout(() => clearInterval(checkInterval), 5000); // Timeout after 5s
      return;
    }

    // Load Leaflet CSS
    if (!existingLink) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.async = true;

      script.onload = () => {
        // Double check that Leaflet is actually loaded
        setTimeout(() => {
          if (window.L) {
            setIsLoaded(true);
          } else {
            console.error("Leaflet script loaded but L is not available");
            setMapError(true);
          }
        }, 100);
      };

      script.onerror = () => {
        console.error("Failed to load Leaflet");
        setMapError(true);
      };

      document.head.appendChild(script);
    }

    // Don't cleanup - keep Leaflet loaded globally
  }, []);

  // Initialize map
  useEffect(() => {
    // Skip if already attempted or conditions not met
    if (
      initAttemptedRef.current ||
      !isLoaded ||
      !mapRef.current ||
      mapInstanceRef.current
    ) {
      return;
    }

    const L = window.L;
    if (!L) {
      console.error("Leaflet not loaded");
      return;
    }

    initAttemptedRef.current = true;

    try {
      // Make sure the container is empty
      if (mapRef.current) {
        mapRef.current.innerHTML = "";
      }

      // Create map
      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      if (onMapReady) {
        onMapReady(map);
      }

      // Listen to zoom changes
      map.on("zoomend", () => {
        setCurrentZoom(map.getZoom());
      });

      console.log("Leaflet map initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Leaflet map:", error);
      setMapError(true);
      initAttemptedRef.current = false; // Allow retry
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          initAttemptedRef.current = false;
        } catch (error) {
          console.error("Failed to cleanup map:", error);
        }
      }
    };
  }, [isLoaded]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    try {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    } catch (error) {
      console.error("Failed to update map view:", error);
    }
  }, [isLoaded, center.lat, center.lng, zoom]);

  // Update markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => {
        marker.remove();
      });
      markersRef.current = [];

      // Add new markers
      markers.forEach((markerData) => {
        const iconHtml = getMarkerIcon(markerData.type, markerData.status);

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const marker = L.marker(
          [markerData.position.lat, markerData.position.lng],
          {
            icon: customIcon,
            title: markerData.title,
          }
        ).addTo(mapInstanceRef.current);

        if (markerData.info) {
          marker.bindPopup(`
            <div class="p-2">
              <h4 class="font-medium text-sm">${markerData.title}</h4>
              <p class="text-xs text-gray-600 mt-1">${markerData.info}</p>
            </div>
          `);
        }

        markersRef.current.push(marker);
      });
    } catch (error) {
      console.error("Failed to update markers:", error);
    }
  }, [isLoaded, markers]);

  // Update routes
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    try {
      // Clear existing routes
      routesRef.current.forEach((route) => {
        route.remove();
      });
      routesRef.current = [];

      // Add new routes
      routes.forEach((routeData) => {
        const latlngs = routeData.path.map((p) => [p.lat, p.lng]);

        const polyline = L.polyline(latlngs, {
          color: routeData.color,
          weight: routeData.strokeWeight || 3,
          opacity: 1.0,
        }).addTo(mapInstanceRef.current);

        polyline.bindPopup(`
          <div class="p-2">
            <h4 class="font-medium text-sm">${routeData.title}</h4>
          </div>
        `);

        routesRef.current.push(polyline);
      });
    } catch (error) {
      console.error("Failed to update routes:", error);
    }
  }, [isLoaded, routes]);

  const getMarkerIcon = (type, status) => {
    let color = "#3b82f6"; // default blue
    let symbol = "📍";

    switch (type) {
      case "bus":
        symbol = "🚌";
        color =
          status === "danger"
            ? "#ef4444"
            : status === "warning"
            ? "#f59e0b"
            : "#10b981";
        break;
      case "stop":
        symbol = "🚏";
        color = "#3b82f6";
        break;
      case "school":
        symbol = "🏫";
        color = "#8b5cf6";
        break;
      case "home":
        symbol = "🏠";
        color = "#ec4899";
        break;
      case "incident":
        symbol = "⚠️";
        color = "#ef4444";
        break;
    }

    return `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
        ">${symbol}</span>
      </div>
    `;
  };

  const handleCenterMap = () => {
    if (isLoaded && mapInstanceRef.current) {
      const L = window.L;
      if (!L) return;

      try {
        mapInstanceRef.current.setView([center.lat, center.lng], zoom);
      } catch (error) {
        console.error("Failed to center map:", error);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getMapHeight = () => {
    if (isFullscreen) return "100vh";
    return isMobile ? "300px" : height;
  };

  // Show error state
  if (mapError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Bản đồ theo dõi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center"
            style={{ height: getMapHeight() }}
          >
            <div className="text-center p-6">
              <p className="text-red-800 font-medium mb-2">
                Không thể tải bản đồ
              </p>
              <p className="text-sm text-red-600">Vui lòng thử lại sau</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${className} ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      <CardHeader
        className={`${isMobile ? "p-3" : "p-4"} ${isFullscreen ? "pb-2" : ""}`}
      >
        <div className="flex items-center justify-between">
          <CardTitle
            className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}
          >
            <MapPin className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
            Bản đồ theo dõi
            {!isLoaded && (
              <Badge variant="outline" className="text-xs">
                Đang tải...
              </Badge>
            )}
          </CardTitle>

          {showControls && (
            <div className="flex items-center gap-2">
              {showTraffic && (
                <Badge variant="outline" className="gap-1">
                  <Layers className="w-3 h-3" />
                  {!isMobile && "Giao thông"}
                </Badge>
              )}

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCenterMap}
                  className={isMobile ? "px-2" : ""}
                  disabled={!isLoaded}
                >
                  <RotateCcw className="w-4 h-4" />
                  {!isMobile && <span className="ml-1">Reset</span>}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className={isMobile ? "px-2" : ""}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                  {!isMobile && (
                    <span className="ml-1">
                      {isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent
        className={`${isMobile ? "p-2" : "p-4"} ${isFullscreen ? "pt-0" : ""}`}
      >
        <div
          ref={mapRef}
          className="w-full rounded-lg border bg-gray-100"
          style={{
            height: getMapHeight(),
            minHeight: getMapHeight(),
            position: "relative",
          }}
        >
          {!isLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Đang tải bản đồ...</p>
              </div>
            </div>
          )}
        </div>

        {markers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Xe buýt hoạt động
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Trạm dừng
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              Trường học
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Sự cố
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
