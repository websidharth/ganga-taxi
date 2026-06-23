'use client';

import { useEffect, useState } from 'react';
import TaxiBookingMap from "@/components/mapples/taxi-booking-map";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, Calendar, IndianRupee, TrendingUp } from 'lucide-react';

type Stats = {
  totalRides: number;
  totalDrivers: number;
  monthlyExpenses: number;
  todayRides: number;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setStats(payload.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Operations Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time taxi booking management, route pricing, and driver analytics.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Rides
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <Car className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : stats?.totalRides ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              All-time completed & draft rides
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Drivers
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : stats?.totalDrivers ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Registered drivers on duty</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Rides
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : stats?.todayRides ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Booked for today</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Expenses
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <IndianRupee className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : formatCurrency(stats?.monthlyExpenses ?? 0)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Fuel, tolls, parking this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Form & Map Interface */}
      <div className="pt-2">
        <TaxiBookingMap />
      </div>
    </div>
  );
}
