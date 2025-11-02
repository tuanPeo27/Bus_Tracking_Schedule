import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import { MapPin, Maximize, Minimize, RotateCcw, Layers } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyAxjLwYEOqWQjQylHrV4si2QgbOTvPiUDs";

export function GoogleMap({
  height = "400px",
  center = { lat: 10.8231, lng: 106.6297 },
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
  const trafficLayerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapError, setMapError] = useState(false);
  const isMobile = useIsMobile();
  const initAttemptedRef = useRef(false);

  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );

    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);

      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    window.initGoogleMaps = () => {
      if (window.google?.maps) setIsLoaded(true);
      else setMapError(true);
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (
      initAttemptedRef.current ||
      !isLoaded ||
      !mapRef.current ||
      mapInstanceRef.current
    )
      return;
    if (!window.google?.maps) return;

    initAttemptedRef.current = true;

    try {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow();

      map.addListener("zoom_changed", () => {
        setCurrentZoom(map.getZoom() || zoom);
      });

      if (onMapReady) onMapReady(map);
    } catch (e) {
      setMapError(true);
      initAttemptedRef.current = false;
    }

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      routesRef.current.forEach((r) => r.setMap(null));
      if (trafficLayerRef.current) trafficLayerRef.current.setMap(null);
      if (infoWindowRef.current) infoWindowRef.current.close();
      mapInstanceRef.current = null;
    };
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    mapInstanceRef.current.setCenter(center);
    mapInstanceRef.current.setZoom(zoom);
  }, [center.lat, center.lng, zoom, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    markers.forEach((m) => {
      const marker = new google.maps.Marker({
        position: m.position,
        map: mapInstanceRef.current,
        title: m.title,
      });

      if (m.info && infoWindowRef.current) {
        marker.addListener("click", () => {
          infoWindowRef.current.setContent(m.info);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    routesRef.current.forEach((r) => r.setMap(null));
    routesRef.current = [];

    routes.forEach((r) => {
      const polyline = new google.maps.Polyline({
        path: r.path,
        strokeColor: r.color,
        strokeWeight: r.strokeWeight || 3,
        map: mapInstanceRef.current,
      });

      routesRef.current.push(polyline);
    });
  }, [routes, isLoaded]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const getHeight = () =>
    isFullscreen ? "100vh" : isMobile ? "300px" : height;

  if (mapError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Bản đồ theo dõi
          </CardTitle>
        </CardHeader>
        <CardContent>Không thể tải Google Maps</CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${className} ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Bản đồ theo dõi
          </CardTitle>

          {showControls && (
            <Button size="sm" variant="outline" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize /> : <Maximize />}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div
          ref={mapRef}
          className="w-full rounded-lg border bg-gray-100"
          style={{ height: getHeight() }}
        >
          {!isLoaded && (
            <div className="flex items-center justify-center w-full h-full">
              Đang tải Google Maps...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
