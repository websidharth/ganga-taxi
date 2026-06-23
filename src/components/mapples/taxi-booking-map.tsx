'use client';

import { BookingDto } from '@/dto/booking-dto';
import type { RouteApiResponse, SelectedPlace } from '@/types/mappls';
import { Car } from 'lucide-react';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import RideBookingPage from './book-rides';
import LocationSearchInput from './location-search-input';


declare global {
  interface Window {
    mappls: any;
  }
}

let hasRequestedCurrentLocation = false;

export default function TaxiBookingMap() {
  const tokenKey = 'mstekmzbjlsdxbgfnroepwhgufsvulpazcmb';
  const [bookingData, setBookingData] = useState<BookingDto | null>(null);
  const mapRef = useRef<any>(null);
  const currentLocationMarkerRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const isMapInitializedRef = useRef(false);
  const didTryCurrentLocationRef = useRef(false);

  const [pickup, setPickup] = useState<SelectedPlace | null>(null);
  const [drop, setDrop] = useState<SelectedPlace | null>(null);
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const removeMarker = (markerRef: React.MutableRefObject<any>) => {
    if (!markerRef.current) return;

    try {
      if (typeof markerRef.current.remove === 'function') {
        markerRef.current.remove();
      }
    } catch (error) {
      console.error('Failed to remove marker:', error);
    } finally {
      markerRef.current = null;
    }
  };

  const showCurrentLocation = () => {
    if (
      didTryCurrentLocationRef.current ||
      hasRequestedCurrentLocation ||
      typeof window === 'undefined' ||
      !navigator.geolocation ||
      !mapRef.current ||
      !window.mappls
    ) {
      return;
    }

    didTryCurrentLocationRef.current = true;
    hasRequestedCurrentLocation = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          removeMarker(currentLocationMarkerRef);

          const marker = new window.mappls.Marker({
            map: mapRef.current,
            position: { lat, lng },
          });

          currentLocationMarkerRef.current = marker;

          if (typeof mapRef.current.setCenter === 'function') {
            mapRef.current.setCenter([lng, lat]);
          }

          if (typeof mapRef.current.setZoom === 'function') {
            mapRef.current.setZoom(15);
          }
        } catch (error) {
          console.error('Failed to show current location:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const initMap = () => {
    if (isMapInitializedRef.current) return;
    if (typeof window === 'undefined' || !window.mappls) return;

    const container = document.getElementById('taxi-map');
    if (!container) return;

    try {
      mapRef.current = new window.mappls.Map('taxi-map', {
        center: [85.1376, 25.5941],
        zoom: 12,
      });

      isMapInitializedRef.current = true;
      console.log('Map initialized');

      showCurrentLocation();
    } catch (error) {
      console.error('Map initialization failed:', error);
    }
  };

  useEffect(() => {
    if (!sdkLoaded) return;

    const timer = window.setTimeout(() => {
      initMap();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [sdkLoaded]);

  const clearRoute = () => {
    if (!window.mappls || !mapRef.current || !routeLayerRef.current) return;

    try {
      if (typeof window.mappls.remove === 'function') {
        window.mappls.remove({
          map: mapRef.current,
          layer: routeLayerRef.current,
        });
      } else if (typeof routeLayerRef.current.remove === 'function') {
        routeLayerRef.current.remove();
      }
    } catch (error) {
      console.error('Failed to clear route:', error);
    } finally {
      routeLayerRef.current = null;
    }
  };

  const getPlaceCoordinates = (place: SelectedPlace) => {
    const lat = Number(place.latitude);
    const lng = Number(place.longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    return { lat, lng };
  };

  const addMarker = (type: 'pickup' | 'drop', place: SelectedPlace) => {
    if (!mapRef.current || !window.mappls) return;

    const coords = getPlaceCoordinates(place);
    if (!coords) return;

    const markerPosition = {
      lat: coords.lat,
      lng: coords.lng,
    };

    if (type === 'pickup') {
      removeMarker(pickupMarkerRef);
    } else {
      removeMarker(dropMarkerRef);
    }

    try {
      const marker = new window.mappls.Marker({
        map: mapRef.current,
        position: markerPosition,
      });

      if (type === 'pickup') {
        pickupMarkerRef.current = marker;
      } else {
        dropMarkerRef.current = marker;
      }

      if (typeof mapRef.current.setCenter === 'function') {
        mapRef.current.setCenter([coords.lng, coords.lat]);
      }
    } catch (error) {
      console.error(`Failed to add ${type} marker:`, error);
    }
  };

  useEffect(() => {
    if (pickup && isMapInitializedRef.current) {
      addMarker('pickup', pickup);
    }
  }, [pickup]);

  useEffect(() => {
    if (drop && isMapInitializedRef.current) {
      addMarker('drop', drop);
    }
  }, [drop]);

  useEffect(() => {
    if (pickup && drop) {
      drawRoute();
    } else {
      clearRoute();
      setBookingData(null);
      setDistanceKm('');
      setDurationMin('');
    }
  }, [pickup, drop]);

  const drawRoute = async () => {
    if (!pickup?.eLoc || !drop?.eLoc) return;

    try {
      setLoadingRoute(true);
      clearRoute();

      const response = await fetch(
        `/api/mappls/route?from=${encodeURIComponent(pickup.eLoc)}&to=${encodeURIComponent(drop.eLoc)}`
      );

      const data: RouteApiResponse = await response.json();
      const route = data?.routes?.[0];

      if (!route) return;

      const distance = (route.distance / 1000).toFixed(2);

      setDistanceKm(distance);
      setDurationMin(Math.ceil(route.duration / 60).toString());

      // 👉 GET coordinates
      const pickupCoords = getPlaceCoordinates(pickup);
      const dropCoords = getPlaceCoordinates(drop);

      // 👉 SET BOOKING DATA
      setBookingData({
        estimatedKm: distance,
        pickupAddress: pickup.placeAddress || '',
        pickupLatitude: pickupCoords?.lat?.toString() || '',
        pickupLongitude: pickupCoords?.lng?.toString() || '',
        dropAddress: drop.placeAddress || '',
        dropLatitude: dropCoords?.lat?.toString() || '',
        dropLongitude: dropCoords?.lng?.toString() || '',
        routeNotes: 'Route calculated via Mappls',
      });

      // 👉 DRAW ROUTE ON MAP
      if (
        mapRef.current &&
        window.mappls &&
        typeof route.geometry !== 'string' &&
        route.geometry?.coordinates?.length
      ) {
        const geoJson = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: route.geometry.coordinates,
              },
              properties: {
                stroke: '#2563eb',
                'stroke-width': 5,
                'stroke-opacity': 0.9,
              },
            },
          ],
        };

        if (typeof window.mappls.addGeoJson === 'function') {
          routeLayerRef.current = window.mappls.addGeoJson({
            map: mapRef.current,
            data: geoJson,
            fitbounds: true,
          });
        }
      }

    } catch (error) {
      console.error('Failed to draw route:', error);
    } finally {
      setLoadingRoute(false);
    }
  };


  return (
    <>
      <Script
        src={
          tokenKey
            ? `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${tokenKey}`
            : ''
        }
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Mappls SDK loaded');
          setSdkLoaded(true);
        }}
        onError={(e) => {
          console.error('Mappls SDK failed to load', e);
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-md shadow-orange-500/20">
              <Car className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Ride Planner & Estimator
              </h2>
              <p className="text-sm text-slate-500">
                Search locations to estimate distance & ETA
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <LocationSearchInput
              label="Pickup Location"
              placeholder="Enter pickup address"
              value={pickup}
              onSelect={setPickup}
            />

            <LocationSearchInput
              label="Drop Location"
              placeholder="Enter destination address"
              value={drop}
              onSelect={setDrop}
            />
            
            {loadingRoute && (
              <div className="text-center py-2 text-xs font-medium text-slate-500">
                Calculating route and distance...
              </div>
            )}
          </div>



          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-0 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold tracking-wider">
                <span>TRIP PREVIEW</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  Estimated:   {distanceKm ? `${distanceKm} km` : '--'}/ {durationMin ? `${durationMin} min` : '--'}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="grid gap-0.5">
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase">Pickup Location</span>
                    <span className="font-medium text-slate-800 line-clamp-2">
                      {pickup?.placeAddress || 'Not selected'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-sm border-t border-slate-100 pt-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="grid gap-0.5">
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase">Drop Location</span>
                    <span className="font-medium text-slate-800 line-clamp-2">
                      {drop?.placeAddress || 'Not selected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>


          </div>

        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm min-h-[400px]">
          <div id="taxi-map" className="h-[500px] w-full" />
        </div>

        {bookingData && (
          <div className="lg:col-span-2">
            <RideBookingPage bookingData={bookingData} />
          </div>
        )}

      </div>
    </>
  );
}
