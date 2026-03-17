"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import { Search, MapPin, Loader2, AlertTriangle } from "lucide-react";

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "1rem",
};

const defaultCenter = {
  lat: 47.9188, // Ulaanbaatar center
  lng: 106.9176,
};

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export function MapPicker({ latitude, longitude, address, onLocationChange }: MapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Update marker position when props change
  useEffect(() => {
    if (latitude && longitude) {
      setMarkerPos({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });
      
      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          onLocationChange(lat, lng, results[0].formatted_address);
        } else {
          onLocationChange(lat, lng, address); // Keep old address if geocoding fails
        }
      });
    }
  }, [address, onLocationChange]);

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newAddress = place.formatted_address || address;
        
        setMarkerPos({ lat, lng });
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(17);
        }
        onLocationChange(lat, lng, newAddress);
      }
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
        <AlertTriangle className="mb-2 text-red-400" size={32} />
        <p className="text-sm font-medium text-red-400">Map loading failed</p>
        <p className="mt-1 text-xs text-red-400/60">Please check your Google Maps API key</p>
      </div>
    );
  }

  if (!isLoaded || !apiKey) {
    return (
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-400">Location Search</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            disabled
            placeholder={!apiKey ? "API Key missing" : "Loading Map..."}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white opacity-50 outline-none"
          />
        </div>
        <div className="flex h-[300px] items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {!apiKey ? (
            <div className="text-center">
              <MapPin className="mx-auto mb-2 text-gray-600" size={32} />
              <p className="text-sm text-gray-500">Google Maps API key is required</p>
            </div>
          ) : (
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-400">Address Search</label>
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search for an address..."
              defaultValue={address}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 shadow-xl"
            />
          </div>
        </Autocomplete>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] shadow-2xl">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPos || defaultCenter}
          zoom={14}
          onClick={onMapClick}
          onLoad={(map) => setMap(map)}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              { elementType: "geometry", stylers: [{ color: "#1e1e2d" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#1e1e2d" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
              },
              {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
              },
              {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
              },
              {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
              },
              {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
              },
            ],
          }}
        >
          {markerPos && <Marker position={markerPos} />}
        </GoogleMap>
      </div>
      <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
        Click on map to drop a pin or search by address
      </p>
    </div>
  );
}
