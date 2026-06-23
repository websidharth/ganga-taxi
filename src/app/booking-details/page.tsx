'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  MapPin, 
  Search, 
  CalendarDays, 
  User, 
  Luggage, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { toast } from 'sonner';

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
  seatsRequired?: number | null;
};

type LuggageItem = {
  id: string;
  itemName: string;
  luggageCount: number;
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
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchBookings = () => {
    setLoading(true);
    setError('');
    fetch('/api/get-booking?limit=100')
      .then(async (res) => {
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        if (!res.ok) {
          throw new Error(json?.message || `Request failed: ${res.status}`);
        }
        return json;
      })
      .then((json) => setRides(json?.data || []))
      .catch((e) => {
        setError(e.message);
        toast.error('Failed to reload bookings');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusBadge = (status: Ride['status']) => {
    const styles: Record<Ride['status'], string> = {
      DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
      BOOKED: 'bg-blue-50 text-blue-700 border-blue-200',
      STARTED: 'bg-amber-50 text-amber-700 border-amber-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return <Badge className={`${styles[status] || ''} capitalize font-bold`}>{status.toLowerCase()}</Badge>;
  };

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const matchesSearch = 
        ride.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.dropAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.passengers.some(p => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || ride.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rides, searchQuery, statusFilter]);

  const totalFareSum = useMemo(() => {
    return filteredRides.reduce((sum, r) => sum + Number(r.fareAmount || 0), 0);
  }, [filteredRides]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Ride Bookings
          </h1>
          <p className="text-slate-500 mt-1">
            Browse and dispatch active bookings, update ride statuses, or look up customer notes.
          </p>
        </div>

        <Button onClick={fetchBookings} variant="outline" className="rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <RefreshCw className="h-4 w-4" />
          Reload List
        </Button>
      </div>

      {/* Analytics Mini Dashboard */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <CardContent className="pt-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bookings count</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{filteredRides.length} rides</div>
          </CardContent>
        </Card>
        <Card className="border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <CardContent className="pt-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accumulated Fare</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalFareSum)}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <CardContent className="pt-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed rides</span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {filteredRides.filter(r => r.status === 'COMPLETED').length} rides
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search bookings by reference, passenger, locations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-xl bg-white border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="BOOKED">Booked</SelectItem>
              <SelectItem value="STARTED">Started</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List Layout */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse border-slate-100">
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5 text-center py-6 text-destructive">
          <p>{error}</p>
        </Card>
      ) : filteredRides.length === 0 ? (
        <Card className="border-dashed border-slate-200 py-12 text-center text-slate-400">
          <Car className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          No bookings found matching filters.
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRides.map((ride) => (
            <Card key={ride.id} className="border-slate-100 shadow-[0_3px_15px_rgba(0,0,0,0.015)] hover:shadow-md transition duration-200 overflow-hidden">
              {/* Header block with details */}
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-slate-900">Ref: {ride.bookingReference}</CardTitle>
                    {getStatusBadge(ride.status)}
                  </div>
                  <CardDescription className="text-xs mt-1 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
                    {new Date(ride.rideDate).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Price</span>
                  <span className="text-base font-extrabold text-slate-900">{ride.fareAmount ? formatCurrency(Number(ride.fareAmount)) : 'N/A'}</span>
                </div>
              </CardHeader>

              {/* Body block with locations and driver */}
              <CardContent className="p-5 text-sm space-y-4">
                {/* Route detail */}
                <div className="relative pl-6 space-y-3.5">
                  <div className="absolute left-1.5 top-1.5 bottom-1.5 w-0.5 border-l-2 border-dashed border-slate-200" />
                  
                  {/* Pickup */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-0.5 h-3 w-3 rounded-full bg-orange-500 border border-white" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Pickup location</span>
                    <span className="text-slate-800 font-medium block mt-0.5">{ride.pickupAddress}</span>
                  </div>

                  {/* Drop */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-0.5 h-3 w-3 rounded-full bg-slate-900 border border-white" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Drop location</span>
                    <span className="text-slate-800 font-medium block mt-0.5">{ride.dropAddress}</span>
                  </div>
                </div>

                {/* Additional stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-50 pt-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Distance</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{ride.estimatedKm} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Passengers</span>
                    <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-orange-500" />
                      {ride.passengers.map(p => p.fullName).join(', ') || 'No info'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Luggage Items</span>
                    <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1">
                      <Luggage className="h-3.5 w-3.5 text-orange-500" />
                      {ride.luggageItems.length} items
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Assigned Driver</span>
                    {ride.driver ? (
                      <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5 text-orange-500" />
                        {ride.driver.name} ({ride.driver.vehicleNo})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic mt-0.5 block">Not Assigned</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}