'use client';

import { useEffect, useRef, useState } from 'react';
import { Car, MapPin, Route as RouteIcon, Clock3 } from 'lucide-react';
import Script from 'next/script';
import type { RouteApiResponse, SelectedPlace } from '@/types/mappls';
import { BookingDto } from '@/dto/booking-dto';
import LocationSearchInput from './location-search-input';
import RideBookingPage from './book-rides';
 

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

  const drawRoutes = async () => {
    if (!pickup?.eLoc || !drop?.eLoc) return;

    try {
      setLoadingRoute(true);
      clearRoute();

      const response = await fetch(
        `/api/mappls/route?from=${encodeURIComponent(pickup.eLoc)}&to=${encodeURIComponent(drop.eLoc)}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        console.error('Route API failed:', response.status);
        return;
      }

      const data: RouteApiResponse = await response.json();
      const route = data?.routes?.[0];

      if (!route) {
        console.error('No route found:', data);
        return;
      }

      setDistanceKm((route.distance / 1000).toFixed(2));
      setDurationMin(Math.ceil(route.duration / 60).toString());

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
        } else {
          console.error('mappls.addGeoJson is not available on this SDK');
        }
      }
    } catch (error) {
      console.error('Failed to draw route:', error);
    } finally {
      setLoadingRoute(false);
    }
  };


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

    } catch (error) {
      console.error(error);
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
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              {/* <Car className="h-5 w-5" /> */}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Healthcare Appointment Booking
              </h2>
              <p className="text-sm text-slate-500">
                Search two locations and view distance on map
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <LocationSearchInput
              label="Location 1"
              placeholder="Enter first location"
              value={pickup}
              onSelect={setPickup}
            />

            <LocationSearchInput
              label="Location 2"
              placeholder="Enter second location"
              value={drop}
              onSelect={setDrop}
            />

            <button
              type="button"
              onClick={drawRoute}
              disabled={!pickup || !drop || loadingRoute}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingRoute ? 'Finding route...' : 'Show route'}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <RouteIcon className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Distance</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {distanceKm ? `${distanceKm} km` : '--'}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Clock3 className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">ETA</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {durationMin ? `${durationMin} min` : '--'}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4" />
              <div>
                <div>
                  <span className="font-medium text-slate-900">Pickup Location:</span>{' '}
                  {pickup?.placeAddress || 'Not selected'}
                </div>
                <div className="mt-2">
                  <span className="font-medium text-slate-900">Drop Location:</span>{' '}
                  {drop?.placeAddress || 'Not selected'}
                </div>
              </div>
            </div>
          </div> 
          
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div id="taxi-map" className="h-[500px] w-full" />
        </div>

        {bookingData && <RideBookingPage bookingData={bookingData} />}

      </div>
    </>
  );
}