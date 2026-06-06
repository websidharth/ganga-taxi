'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CTASection } from '@/components/shared/cta-section';

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string;
};

type Passenger = {
  id: string;
  fullName: string;
  phone?: string | null;
  adultCount?: number | null;
  childCount?: number | null;
  infantCount?: number | null;
  seatsRequired?: number | null;
};

type LuggageItem = {
  id: string;
  itemName: string;
  luggageCount: number;
  smallLuggageCount: number;
  largeLuggageCount: number;
};

type Ride = {
  id: string;
  bookingReference: string;
  status: 'DRAFT' | 'BOOKED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';
  rideDate: string;
  pickupAddress: string;
  dropAddress: string;
  estimatedKm: string | number;
  fareAmount?: string | number | null;
  driver?: Driver | null;
  passengers: Passenger[];
  luggageItems: LuggageItem[];
  createdAt: string;
};

export default function BookingDetailsPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
fetch('/api/get-booking')
  .then(async (res) => {
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};

    if (!res.ok) {
      throw new Error(json?.message || `Request failed: ${res.status}`);
    }
    return json;
  })
  .then((json) => setRides(json?.data || []))
  .catch((e) => setError(e.message))
  .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-6xl container-px py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Booking Details</h1>
        <p className="text-sm text-muted-foreground">All ride bookings</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading bookings...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && rides.length === 0 && (
        <p className="text-sm text-muted-foreground">No bookings found.</p>
      )}

      <div className="grid gap-4">
        {rides.map((ride) => (
          <Card key={ride.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Ref: {ride.bookingReference}</CardTitle>
                <Badge variant="secondary">{ride.status}</Badge>
              </div>
              <CardDescription>
                {new Date(ride.rideDate).toLocaleString()}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <p><strong>From:</strong> {ride.pickupAddress}</p>
              <p><strong>To:</strong> {ride.dropAddress}</p>
              <p><strong>Estimated KM:</strong> {String(ride.estimatedKm)}</p>
              <p><strong>Fare:</strong> {ride.fareAmount != null ? String(ride.fareAmount) : 'N/A'}</p>
              <p>
                <strong>Driver:</strong>{' '}
                {ride.driver ? `${ride.driver.name} (${ride.driver.vehicleNo})` : 'Not assigned'}
              </p>
              <p><strong>Passengers:</strong> {ride.passengers.length}</p>
              <p><strong>Luggage Items:</strong> {ride.luggageItems.length}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <CTASection />
    </main>
  );
}