'use client';

import { BookingDto } from '@/dto/booking-dto';
import type { RouteApiResponse, SelectedPlace } from '@/types/mappls';
import { ArrowUpDown, Car } from 'lucide-react';
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
  const routeLayersRef = useRef<any[]>([]);
  const isMapInitializedRef = useRef(false);
  const didTryCurrentLocationRef = useRef(false);

  const [pickup, setPickup] = useState<SelectedPlace | null>(null);
  const [drop, setDrop] = useState<SelectedPlace | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const handleSwap = () => {
    const temp = pickup;
    setPickup(drop);
    setDrop(temp);
  };
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
    if (routeLayersRef.current.length > 0) {
      routeLayersRef.current.forEach((layer) => {
        try {
          if (typeof layer.remove === 'function') {
            layer.remove();
          } else if (window.mappls && typeof window.mappls.remove === 'function') {
            window.mappls.remove({
              map: mapRef.current,
              layer: layer,
            });
          }
        } catch (e) {
          console.error('Failed to remove layer:', e);
        }
      });
      routeLayersRef.current = [];
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

    try {
      if (type === 'pickup') {
        removeMarker(pickupMarkerRef);
      } else {
        removeMarker(dropMarkerRef);
      }

      const coords = getPlaceCoordinates(place);
      const position = coords ? { lat: coords.lat, lng: coords.lng } : place.eLoc;

      if (!position) return;

      const marker = new window.mappls.Marker({
        map: mapRef.current,
        position: position,
      });

      if (type === 'pickup') {
        pickupMarkerRef.current = marker;
      } else {
        dropMarkerRef.current = marker;
      }

      if (coords && typeof mapRef.current.setCenter === 'function') {
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
      setRoutes([]);
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
      const fetchedRoutes = data?.routes || [];

      setSelectedRouteIndex(0);
      setRoutes(fetchedRoutes);

      const allCoordinates: { lat: number; lng: number }[] = [];
      fetchedRoutes.forEach((r) => {
        if (typeof r.geometry !== 'string' && r.geometry?.coordinates?.length) {
          r.geometry.coordinates.forEach((coord: [number, number]) => {
            allCoordinates.push({ lat: coord[1], lng: coord[0] });
          });
        }
      });

      if (typeof mapRef.current.fitBounds === 'function' && allCoordinates.length > 0) {
        const lats = allCoordinates.map((p) => p.lat);
        const lngs = allCoordinates.map((p) => p.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        mapRef.current.fitBounds([
          [minLng, minLat],
          [maxLng, maxLat]
        ], {
          padding: 60
        });
      }

    } catch (error) {
      console.error('Failed to draw route:', error);
    } finally {
      setLoadingRoute(false);
    }
  };

  useEffect(() => {
    if (routes.length === 0) return;

    const selectedRoute = routes[selectedRouteIndex];
    if (!selectedRoute) return;

    const distance = (selectedRoute.distance / 1000).toFixed(2);
    setDistanceKm(distance);
    setDurationMin(Math.ceil(selectedRoute.duration / 60).toString());

    const pickupCoords = getPlaceCoordinates(pickup!);
    const dropCoords = getPlaceCoordinates(drop!);

    const formatFullAddress = (place: SelectedPlace) => {
      if (!place) return '';
      const name = place.placeName || '';
      const address = place.placeAddress || '';
      if (!name) return address;
      if (!address) return name;
      if (address.toLowerCase().includes(name.toLowerCase())) {
        return address;
      }
      return `${name}, ${address}`;
    };

    setBookingData({
      estimatedKm: distance,
      pickupAddress: formatFullAddress(pickup!),
      pickupLatitude: pickupCoords?.lat?.toString() || '',
      pickupLongitude: pickupCoords?.lng?.toString() || '',
      dropAddress: formatFullAddress(drop!),
      dropLatitude: dropCoords?.lat?.toString() || '',
      dropLongitude: dropCoords?.lng?.toString() || '',
      routeNotes: 'Route calculated via Mappls',
    });

    clearRoute();

    const createPolyline = (options: any) => {
      if (typeof window.mappls.Polyline === 'function') {
        return new window.mappls.Polyline(options);
      } else if (typeof window.mappls.polyline === 'function') {
        return new window.mappls.polyline(options);
      }
      return null;
    };

    if (typeof window.mappls.Polyline === 'function' || typeof window.mappls.polyline === 'function') {
      // Draw non-selected routes first so they sit in the background
      routes.forEach((r, idx) => {
        if (idx === selectedRouteIndex) return;

        if (typeof r.geometry !== 'string' && r.geometry?.coordinates?.length) {
          const paths = r.geometry.coordinates.map((coord: [number, number]) => ({
            lat: coord[1],
            lng: coord[0],
          }));

          const altPolyline = createPolyline({
            map: mapRef.current,
            path: paths,
            strokeColor: '#94a3b8',
            strokeWeight: 6,
            strokeWidth: 6,
            strokeOpacity: 0.75,
            opacity: 0.75,
          });

          if (altPolyline) {
            routeLayersRef.current.push(altPolyline);
            // Click to select this route
            altPolyline.addListener('click', () => {
              setSelectedRouteIndex(idx);
            });
          }
        }
      });

      // Draw the selected route on top with blue glow highlight
      const r = routes[selectedRouteIndex];
      if (typeof r.geometry !== 'string' && r.geometry?.coordinates?.length) {
        const paths = r.geometry.coordinates.map((coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        }));

        const outerPolyline = createPolyline({
          map: mapRef.current,
          path: paths,
          strokeColor: '#3b82f6',
          strokeWeight: 10,
          strokeWidth: 10,
          strokeOpacity: 0.4,
          opacity: 0.4,
        });
        if (outerPolyline) {
          routeLayersRef.current.push(outerPolyline);
          outerPolyline.addListener('click', () => {
            setSelectedRouteIndex(selectedRouteIndex);
          });
        }

        const innerPolyline = createPolyline({
          map: mapRef.current,
          path: paths,
          strokeColor: '#1d4ed8',
          strokeWeight: 6,
          strokeWidth: 6,
          strokeOpacity: 0.95,
          opacity: 0.95,
        });
        if (innerPolyline) {
          routeLayersRef.current.push(innerPolyline);
          innerPolyline.addListener('click', () => {
            setSelectedRouteIndex(selectedRouteIndex);
          });
        }
      }
    }
  }, [routes, selectedRouteIndex]);


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
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
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

          <div className="relative flex flex-col gap-3">
            <LocationSearchInput
              label=""
              placeholder="Enter pickup address"
              value={pickup}
              onSelect={setPickup}
            />

            <LocationSearchInput
              label=""
              placeholder="Enter destination address"
              value={drop}
              onSelect={setDrop}
            />

            <button
              type="button"
              onClick={handleSwap}
              className="absolute right-4 top-[50%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-md transition-all focus:outline-none active:scale-95 z-10"
              title="Swap Locations"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {loadingRoute && (
            <div className="text-center py-2 text-xs font-medium text-slate-500 animate-pulse">
              Calculating route and distance...
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm min-h-[350px]">
            <div id="taxi-map" className="h-[300px] w-full" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold tracking-wider pb-2 border-b border-slate-100">
              <span className="text-slate-400 font-bold uppercase">TRIP PREVIEW</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100/80">
                Estimated: {distanceKm ? `${distanceKm} km` : '--'} / {durationMin ? `${durationMin} min` : '--'}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse" />
                <div className="grid gap-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pickup Location</span>
                  <span className="font-semibold text-slate-900 line-clamp-1">
                    {pickup?.placeName || 'Not selected'}
                  </span>
                  {pickup?.placeAddress && pickup.placeAddress !== pickup.placeName && (
                    <span className="text-xs text-slate-500 line-clamp-2 leading-tight">
                      {pickup.placeAddress}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm border-t border-slate-100/80 pt-3">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div className="grid gap-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Drop Location</span>
                  <span className="font-semibold text-slate-900 line-clamp-1">
                    {drop?.placeName || 'Not selected'}
                  </span>
                  {drop?.placeAddress && drop.placeAddress !== drop.placeName && (
                    <span className="text-xs text-slate-500 line-clamp-2 leading-tight">
                      {drop.placeAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {bookingData && (
            <div className="border-t border-slate-100 pt-4">
              <RideBookingPage bookingData={bookingData} />
            </div>
          )}
        </div>





      </div >
    </>
  );
}
