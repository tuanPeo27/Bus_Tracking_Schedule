import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

//api key geoapify
const apiKey = "2b833a5c3c1649d89c2e52d7976c7534";
//component ban do su dung leaflet
export function LeafletMap({
  height,
  center,
  zoom = 13,
  markers = [],
  className,
  polylines = [],
  onMapClick = null,
}) {

  //refs cho map va cac layer
  const mapRef = useRef(null);
  const markerGroupRef = useRef(null);
  const polylineGroupRef = useRef(null);

  //state theo doi co dang di theo trung tam khong
  const [isFollowing, setIsFollowing] = useState(true);
  //toa do mac dinh neu khong co center truyen vao
  const fallback = { lat: 10.8231, lng: 106.6297 };
  //khoi tao map lan dau tien
  useEffect(() => {
    const initCenter =
      center && center.lat !== undefined && center.lng !== undefined
        ? [center.lat, center.lng]
        : [fallback.lat, fallback.lng];
    //tao map neu chua co
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

      //them tile layer tu geoapify
      L.tileLayer(
        `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        {
          maxZoom: 20,
          attribution: '© <a href="https://www.geoapify.com/">Geoapify</a>',
        }
      ).addTo(mapRef.current);

      //tao layer group cho markers va polylines
      markerGroupRef.current = L.layerGroup().addTo(mapRef.current);
      polylineGroupRef.current = L.layerGroup().addTo(mapRef.current);

      //su kien nguoi dung tu thao tac tren ban do
      mapRef.current.on("dragstart", () => setIsFollowing(false));
      mapRef.current.on("click", (e) => {
        try {
          if (typeof onMapClick === "function")
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        } catch (err) {
          /* ignore */
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // --- Cập nhật markers ---
    if (!markerGroupRef.current)
      markerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    
    //xoa het marker cua lan truoc
    markerGroupRef.current.clearLayers();

    (markers || []).forEach((marker) => {
      if (!marker || !marker.position) return;

      const markerOptions = {
        draggable: marker.draggable || false, //cho phep keo tha
      };

      if (marker.icon) {
        markerOptions.icon = marker.icon;
      }
      
      //xe hien tai luon o tren cung
      if (marker.type === 'bus-current') {
         markerOptions.zIndexOffset = 1000;
      }

      let leafletMarker = L.marker(
        [marker.position.lat, marker.position.lng],
        markerOptions
      )
        .addTo(markerGroupRef.current)
        .bindPopup(marker.title || "");
      //neu co callback onClick, dung event
      if (marker.onClick && typeof marker.onClick === "function") {
        leafletMarker.on("click", (e) => {
          try {
            marker.onClick(marker);
          } catch (err) {
            /* ignore */
          }
        });
      }

      //neu co onDrag, them su kien dragend
      if (marker.draggable && marker.onDrag) {
        leafletMarker.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          marker.onDrag({ lat: pos.lat, lng: pos.lng });
        });
      }
    });

    //cap nhat polylines
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
        dashArray: pline.dashArray || null,
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