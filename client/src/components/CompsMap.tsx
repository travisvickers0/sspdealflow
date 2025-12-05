import { useState, useEffect, useCallback, memo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

interface Comp {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  soldDate?: string;
}

interface CompsMapProps {
  subjectAddress: string;
  subjectCity: string;
  subjectState: string;
  subjectZip: string;
  comps: Comp[];
}

interface MapWrapperProps extends CompsMapProps {
  apiKey: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const MapContent = memo(function MapContent({ 
  subjectAddress, 
  subjectCity, 
  subjectState, 
  subjectZip, 
  comps,
  apiKey 
}: MapWrapperProps) {
  const [subjectCoords, setSubjectCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedComp, setSelectedComp] = useState<Comp | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    if (isLoaded) {
      const geocoder = new google.maps.Geocoder();
      const fullAddress = `${subjectAddress}, ${subjectCity}, ${subjectState} ${subjectZip}`;
      
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const coords = { lat: location.lat(), lng: location.lng() };
          setSubjectCoords(coords);
          setMapCenter(coords);
        }
      });
    }
  }, [isLoaded, subjectAddress, subjectCity, subjectState, subjectZip]);

  useEffect(() => {
    if (map && subjectCoords && comps.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(subjectCoords);
      comps.forEach((comp) => {
        if (comp.lat && comp.lng) {
          bounds.extend({ lat: comp.lat, lng: comp.lng });
        }
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, subjectCoords, comps]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <span className="text-gray-500 text-sm">Failed to load map</span>
      </div>
    );
  }

  if (!isLoaded || !mapCenter) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {subjectCoords && (
          <Marker
            position={subjectCoords}
            label={{
              text: "S",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: "#ef4444",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            }}
            title={`${subjectAddress}, ${subjectCity}, ${subjectState}`}
          />
        )}

        {comps.map((comp, idx) => {
          if (!comp.lat || !comp.lng) return null;
          return (
            <Marker
              key={comp.id || idx}
              position={{ lat: comp.lat, lng: comp.lng }}
              label={{
                text: String(idx + 1),
                color: "white",
                fontWeight: "bold",
                fontSize: "12px",
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: "#475569",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
              onClick={() => setSelectedComp(comp)}
              title={comp.address}
            />
          );
        })}

        {selectedComp && selectedComp.lat && selectedComp.lng && (
          <InfoWindow
            position={{ lat: selectedComp.lat, lng: selectedComp.lng }}
            onCloseClick={() => setSelectedComp(null)}
          >
            <div className="p-2 min-w-[180px]">
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {selectedComp.address?.split(",")[0]}
              </p>
              <p className="text-xs text-gray-600 mb-2">
                {selectedComp.beds} beds · {selectedComp.baths} baths · {selectedComp.sqft?.toLocaleString()} sqft
              </p>
              <p className="font-bold text-gray-900">${selectedComp.price?.toLocaleString()}</p>
              {selectedComp.soldDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Sold {new Date(selectedComp.soldDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow">
              S
            </div>
            <span className="text-xs font-medium text-gray-700">Subject Property</span>
          </div>
          {comps.slice(0, 3).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold border border-white shadow">
                {idx + 1}
              </div>
              <span className="text-xs text-gray-600">Comp</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export function CompsMap(props: CompsMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config/maps-key")
      .then((res) => res.json())
      .then((data) => {
        if (data.apiKey) {
          setApiKey(data.apiKey);
        }
      })
      .catch((err) => console.error("Failed to load maps API key:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <span className="text-gray-500 text-sm">Map unavailable</span>
      </div>
    );
  }

  return <MapContent {...props} apiKey={apiKey} />;
}
