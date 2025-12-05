import { useState, useEffect, useCallback, memo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import type { Property } from "@shared/schema";

interface MarketplaceMapProps {
  properties: Property[];
}

interface MapWrapperProps extends MarketplaceMapProps {
  apiKey: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: 35.5, lng: -79.5 };

const MapContent = memo(function MapContent({ properties, apiKey }: MapWrapperProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [, setLocation] = useLocation();

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  const propertiesWithCoords = properties.filter(p => p.lat && p.lng);

  useEffect(() => {
    if (map && propertiesWithCoords.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      propertiesWithCoords.forEach((prop) => {
        if (prop.lat && prop.lng) {
          bounds.extend({ lat: prop.lat, lng: prop.lng });
        }
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, propertiesWithCoords]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "funded":
      case "committed":
        return "#10b981";
      case "needs_funding":
      default:
        return "#3b82f6";
    }
  };

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handlePropertyClick = (property: Property) => {
    const slug = property.address
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
    setLocation(`/properties/${slug}`);
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <span className="text-gray-500 text-sm">Failed to load map</span>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (propertiesWithCoords.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <span className="text-gray-500 text-sm">Loading property locations...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={propertiesWithCoords[0] ? { lat: propertiesWithCoords[0].lat!, lng: propertiesWithCoords[0].lng! } : defaultCenter}
        zoom={8}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {propertiesWithCoords.map((prop) => (
          <Marker
            key={prop.id}
            position={{ lat: prop.lat!, lng: prop.lng! }}
            onClick={() => handleMarkerClick(prop)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: getMarkerColor(prop.status),
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
            title={prop.address}
          />
        ))}

        {selectedProperty && selectedProperty.lat && selectedProperty.lng && (
          <InfoWindow
            position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div 
              className="p-2 min-w-[200px] cursor-pointer hover:bg-gray-50 transition-colors rounded"
              onClick={() => handlePropertyClick(selectedProperty)}
            >
              {selectedProperty.mainPhotoUrl && (
                <img 
                  src={selectedProperty.mainPhotoUrl} 
                  alt={selectedProperty.address}
                  className="w-full h-24 object-cover rounded mb-2"
                />
              )}
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {selectedProperty.address}
              </p>
              <p className="text-xs text-gray-600 mb-1">
                {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}
              </p>
              <p className="text-xs text-gray-600 mb-2">
                {selectedProperty.beds} beds · {selectedProperty.baths} baths · {selectedProperty.squareFeet?.toLocaleString()} sqft
              </p>
              <div className="flex justify-between items-center">
                <p className="font-bold text-gray-900">${selectedProperty.purchasePrice?.toLocaleString()}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedProperty.status === "needs_funding" 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-green-100 text-green-700"
                }`}>
                  {selectedProperty.status === "needs_funding" ? "Open" : "Funded"}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-2 font-medium">Click to view details →</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-xs font-medium text-gray-700">Needs Funding</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-xs font-medium text-gray-700">Funded</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-10">
        <span className="text-xs font-medium text-gray-700">
          {propertiesWithCoords.length} {propertiesWithCoords.length === 1 ? 'property' : 'properties'} on map
        </span>
      </div>
    </div>
  );
});

export function MarketplaceMap(props: MarketplaceMapProps) {
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
