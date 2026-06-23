'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowRight,
  Car,
  Luggage,
  Navigation,
  Pencil,
  RefreshCw,
  Search,
  User,
  ClipboardList,
  CheckCircle2,
  IndianRupee
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import StatCard from '@/components/common/stat-card';

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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [newStatus, setNewStatus] = useState<Ride['status']>('DRAFT');
  const [fareAmountInput, setFareAmountInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const openStatusModal = (ride: Ride) => {
    setSelectedRide(ride);
    setNewStatus(ride.status);
    setFareAmountInput(ride.fareAmount?.toString() || '');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRide) return;
    setIsUpdating(true);
    try {
      const response = await fetch('/api/rides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRide.id,
          status: newStatus,
          fareAmount: newStatus === 'COMPLETED' || fareAmountInput ? fareAmountInput : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      toast.success(`Booking status updated to ${newStatus}`);
      setRides(prev =>
        prev.map(r =>
          r.id === selectedRide.id
            ? {
                ...r,
                status: newStatus,
                fareAmount: newStatus === 'COMPLETED' || fareAmountInput ? Number(fareAmountInput) : r.fareAmount,
              }
            : r
        )
      );
      setIsModalOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

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
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
        <StatCard
          title="Bookings count"
          value={filteredRides.length}
          subtext="rides"
          icon={ClipboardList}
          iconBgClass="bg-indigo-50"
          iconTextClass="text-indigo-600"
          iconBorderClass="border-indigo-100/50"
          loading={loading}
        />
        <StatCard
          title="Accumulated Fare"
          value={formatCurrency(totalFareSum)}
          icon={IndianRupee}
          iconBgClass="bg-emerald-50"
          iconTextClass="text-emerald-600"
          iconBorderClass="border-emerald-100/50"
          valueColorClass="text-emerald-600"
          loading={loading}
        />
        <StatCard
          title="Completed rides"
          value={filteredRides.filter(r => r.status === 'COMPLETED').length}
          subtext="rides"
          icon={CheckCircle2}
          iconBgClass="bg-blue-50"
          iconTextClass="text-blue-600"
          iconBorderClass="border-blue-100/50"
          valueColorClass="text-blue-600"
          loading={loading}
        />
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
            <Card key={ride.id} className="border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden bg-white">
              {/* Header block with details */}
              <CardHeader className="bg-slate-50/40 border-b border-slate-100/80 py-4 px-6 relative flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-4 flex-1 pr-[220px]">
                  <div className="flex items-center gap-2.5">
                    <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">Ref: {ride.bookingReference}</CardTitle>
                    {getStatusBadge(ride.status)}
                  </div>
                  
                  {/* Stats info inline right side of booking ID */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <div className="bg-slate-100/50 border border-slate-200/50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 hover:bg-slate-100 transition-colors" title="Distance">
                      <Navigation className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">{ride.estimatedKm} km</span>
                    </div>
                    <div className="bg-slate-100/50 border border-slate-200/50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 hover:bg-slate-100 transition-colors min-w-0" title="Passenger">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate max-w-[100px]" title={ride.passengers.map(p => p.fullName).join(', ')}>
                        {ride.passengers.map(p => p.fullName).join(', ') || 'No info'}
                      </span>
                    </div>
                    <div className="bg-slate-100/50 border border-slate-200/50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 hover:bg-slate-100 transition-colors" title="Luggage">
                      <Luggage className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">{ride.luggageItems.length} items</span>
                    </div>
                    <div className="bg-slate-100/50 border border-slate-200/50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 hover:bg-slate-100 transition-colors min-w-0" title="Assigned Driver">
                      <Car className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate max-w-[100px]" title={ride.driver?.name || 'Not Assigned'}>
                        {ride.driver?.name || 'Not Assigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Absolute price & edit CTA on the right */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none mb-1">Est. Price</span>
                    <span className="text-base font-black text-slate-900 leading-none">{ride.fareAmount ? formatCurrency(Number(ride.fareAmount)) : 'N/A'}</span>
                  </div>
                  <Button
                    onClick={() => openStatusModal(ride)}
                    size="sm"
                    className="h-9 rounded-xl text-xs font-bold px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Update Status
                  </Button>
                </div>
              </CardHeader>

              {/* Body block with locations and driver */}
              <CardContent className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 p-3 rounded-2xl border border-slate-100 transition-colors">
                    <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">Pickup Location</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block" title={ride.pickupAddress}>{ride.pickupAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 p-3 rounded-2xl border border-slate-100 transition-colors">
                    <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">Drop Location</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block" title={ride.dropAddress}>{ride.dropAddress}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modern Status Update Modal */}
      {isModalOpen && selectedRide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Update Ride Status</h3>
              <p className="text-sm text-slate-500 mt-1">
                Modify status for booking <span className="font-semibold text-slate-700">{selectedRide.bookingReference}</span>.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Select New Status</label>
              <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val)}>
                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 py-5 font-semibold text-slate-800">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem className="font-semibold text-slate-700" value="DRAFT">Draft</SelectItem>
                  <SelectItem className="font-semibold text-blue-700 bg-blue-50/40" value="BOOKED">Booked</SelectItem>
                  <SelectItem className="font-semibold text-amber-700 bg-amber-50/40" value="STARTED">Started</SelectItem>
                  <SelectItem className="font-semibold text-emerald-700 bg-emerald-50/40" value="COMPLETED">Completed</SelectItem>
                  <SelectItem className="font-semibold text-rose-700 bg-rose-50/40" value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'COMPLETED' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ride Fare Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">₹</span>
                  <Input
                    type="number"
                    placeholder="Enter final fare amount"
                    value={fareAmountInput}
                    onChange={(e) => setFareAmountInput(e.target.value)}
                    className="rounded-xl border-slate-200 bg-slate-50/50 pl-8 py-5 font-semibold text-slate-800 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl py-5 border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdateStatus}
                className="flex-1 rounded-xl py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-100"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
