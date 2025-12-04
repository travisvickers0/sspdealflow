interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyCSt8VJl2vozHkHQHnYDa4C6WjNVi2f98E";
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error geocoding address "${address}":`, error);
    return null;
  }
}

export async function geocodeComps(comps: Array<{ address: string; [key: string]: any }>): Promise<Array<{ address: string; lat?: number; lng?: number; [key: string]: any }>> {
  const geocodedComps = await Promise.all(
    comps.map(async (comp) => {
      const geocodeResult = await geocodeAddress(comp.address);
      if (geocodeResult) {
        return {
          ...comp,
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
        };
      }
      return comp;
    })
  );

  return geocodedComps;
}

