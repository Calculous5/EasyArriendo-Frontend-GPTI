// Traduce las respuestas de la API al formato que usan los componentes.
export function toProperty(p) {
  return {
    id: p.id,
    title: p.title,
    address: p.address,
    location: p.comuna,
    lat: p.lat,
    lng: p.lng,
    rent: p.rent_clp,
    fees: p.common_expenses_clp ?? 0,
    feesMissing: p.fees_missing,
    beds: p.bedrooms,
    baths: p.bathrooms,
    area: p.area_m2,
    floor: p.floor,
    petsAllowed: p.pets_allowed,
    hasParking: p.has_parking,
    listingUrl: p.listing_url,
    imageUrl: p.image_url,
    source: p.source,
    updatedAt: p.updated_at,
    tone: p.id % 4
  };
}

// Combina una propiedad con su estimación de costo y traslado (F-02, F-03).
export function withEstimate(property, estimate) {
  if (!property) return property;
  if (!estimate) return { ...property, available: false, pending: true };
  return {
    ...property,
    pending: false,
    available: estimate.route_available,
    distance: estimate.distance_km,
    minutes: estimate.minutes,
    transport: estimate.transport_clp,
    timeCost: estimate.time_value_clp,
    total: estimate.total_clp,
    estimated: estimate.estimated,
    score: estimate.score,
    position: estimate.position
  };
}

export const sameOrigin = (a, b) => a?.lat === b?.lat && a?.lng === b?.lng;
