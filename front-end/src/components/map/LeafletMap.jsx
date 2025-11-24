import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const apiKey = "2b833a5c3c1649d89c2e52d7976c7534";

export function LeafletMap({
  height,
  center,
  zoom = 13,
  markers = [],
  className,
  polylines = [],
}) {
  const mapRef = useRef(null);
  const markerGroupRef = useRef(null);
  const polylineGroupRef = useRef(null);
  const [isFollowing, setIsFollowing] = useState(true);

  const fallback = { lat: 10.8231, lng: 106.6297 };

  useEffect(() => {
    const initCenter =
      center && center.lat !== undefined && center.lng !== undefined
        ? [center.lat, center.lng]
        : [fallback.lat, fallback.lng];

    if (!mapRef.current) {
      const el = document.getElementById("geoapify-map");
      if (!el) return;

      mapRef.current = L.map("geoapify-map", {
        center: initCenter,
        zoom,
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: true,
      });

      L.tileLayer(
        `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        {
          maxZoom: 20,
          attribution: '© <a href="https://www.geoapify.com/">Geoapify</a>',
        }
      ).addTo(mapRef.current);

      markerGroupRef.current = L.layerGroup().addTo(mapRef.current);
      polylineGroupRef.current = L.layerGroup().addTo(mapRef.current);

      mapRef.current.on("dragstart", () => setIsFollowing(false));
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // --- Cập nhật markers ---
    if (!markerGroupRef.current)
      markerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    markerGroupRef.current.clearLayers();
    (markers || []).forEach((marker) => {
      if (!marker || !marker.position) return;

      let leafletMarker = L.marker([marker.position.lat, marker.position.lng], {
        draggable: marker.draggable || false, // <-- thêm draggable
      })
        .addTo(markerGroupRef.current)
        .bindPopup(marker.title || "");

      // Nếu có callback onDrag, dùng event
      if (marker.draggable && marker.onDrag) {
        leafletMarker.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          marker.onDrag({ lat: pos.lat, lng: pos.lng });
        });
      }
    });

    // --- Cập nhật polylines ---
    if (!polylineGroupRef.current)
      polylineGroupRef.current = L.layerGroup().addTo(mapRef.current);
    polylineGroupRef.current.clearLayers();
    (polylines || []).forEach((pline) => {
      const latlngs = (pline.positions || []).map((p) => [p.lat, p.lng]);
      if (latlngs.length === 0) return;

      L.polyline(latlngs, {
        color: pline.color || "#1976d2",
        weight: pline.weight || 4,
        opacity: pline.opacity || 0.85,
        dashArray: pline.dashArray || null, // hỗ trợ nét đứt cho tuyến động
      }).addTo(polylineGroupRef.current);
    });

    // --- Pan theo xe nếu isFollowing ---
    if (
      isFollowing &&
      center &&
      center.lat !== undefined &&
      center.lng !== undefined
    ) {
      const currentCenter = mapRef.current.getCenter();
      const distance = mapRef.current.distance(
        currentCenter,
        L.latLng(center.lat, center.lng)
      );
      if (distance > 50) mapRef.current.panTo([center.lat, center.lng]);
    }
  }, [center, markers, polylines, isFollowing]);
  return (
    <div
      id="geoapify-map"
      className={className}
      style={{ width: "100%", height }}
    />
  );
}
