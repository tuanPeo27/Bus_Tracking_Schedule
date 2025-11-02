import React, { useState, useEffect } from "react";
import { GoogleMap } from "./GoogleMap";
import { LeafletMap } from "./LeafletMap";

export default function SmartMap({
  height = "400px",
  center = { lat: 10.8231, lng: 106.6297 },
  zoom = 13,
  markers = [],
  routes = [],
  showTraffic = false,
  showControls = true,
  className = "",
  onMapReady,
  preferGoogleMaps = true,
}) {
  const [useGoogleMaps, setUseGoogleMaps] = useState(preferGoogleMaps);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  // Check if Google Maps is available and working
  useEffect(() => {
    if (!preferGoogleMaps) {
      setUseGoogleMaps(false);
      return;
    }

    const checkGoogleMapsError = () => {
      const hasError = document.querySelector(
        '[src*="maps.googleapis.com"][src*="error"]'
      );
      if (hasError || googleMapsError) {
        console.log("Google Maps error detected, falling back to Leaflet Maps");
        setUseGoogleMaps(false);
      }
    };

    const timer = setTimeout(checkGoogleMapsError, 3000);
    return () => clearTimeout(timer);
  }, [preferGoogleMaps, googleMapsError]);

  // Default fallback to Leaflet for now
  return (
    <LeafletMap
      height={height}
      center={center}
      zoom={zoom}
      markers={markers}
      routes={routes}
      showTraffic={showTraffic}
      showControls={showControls}
      className={className}
      onMapReady={onMapReady}
    />
  );
}
