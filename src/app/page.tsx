'use client';

import StatCard from '@/components/common/stat-card';
import TaxiBookingMap from "@/components/mapples/taxi-booking-map";
import { Calendar, CheckCircle2, ClipboardList, Coins, IndianRupee, Receipt, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

type Stats = {
  totalRides: number;
  totalDrivers: number;
  todayRides: number;
  completedRidesCount: number;
  totalExpenses: number;
  monthlyExpenses: number;
  dailyExpenses: number;
  totalIncome: number;
  monthlyIncome: number;
  dailyIncome: number;
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

      <div className="pt-2">
        <TaxiBookingMap />
      </div>
      {/* KPI Cards Grid */}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          title="Daily Income"
          value={formatCurrency(stats?.dailyIncome ?? 0)}
          icon={IndianRupee}
          iconBgClass="bg-green-50"
          iconTextClass="text-green-600"
          iconBorderClass="border-green-100/50"
          valueColorClass="text-green-600"
          loading={loading}
        />
        <StatCard
          title="Daily Expenses"
          value={formatCurrency(stats?.dailyExpenses ?? 0)}
          icon={IndianRupee}
          iconBgClass="bg-red-50"
          iconTextClass="text-red-600"
          iconBorderClass="border-red-100/50"
          valueColorClass="text-red-600"
          loading={loading}
        />
        <StatCard
          title="Today's Rides"
          value={stats?.todayRides ?? 0}
          subtext="rides"
          icon={Calendar}
          iconBgClass="bg-orange-50"
          iconTextClass="text-orange-600"
          iconBorderClass="border-orange-100/50"
          valueColorClass="text-orange-600"
          loading={loading}
        />

        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(stats?.monthlyExpenses ?? 0)}
          icon={IndianRupee}
          iconBgClass="bg-pink-50"
          iconTextClass="text-pink-600"
          iconBorderClass="border-pink-100/50"
          valueColorClass="text-pink-600"
          loading={loading}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(stats?.monthlyIncome ?? 0)}
          icon={TrendingUp}
          iconBgClass="bg-teal-50"
          iconTextClass="text-teal-600"
          iconBorderClass="border-teal-100/50"
          valueColorClass="text-teal-600"
          loading={loading}
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(stats?.totalIncome ?? 0)}
          icon={Coins}
          iconBgClass="bg-emerald-50"
          iconTextClass="text-emerald-600"
          iconBorderClass="border-emerald-100/50"
          valueColorClass="text-emerald-600"
          loading={loading}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats?.totalExpenses ?? 0)}
          icon={Receipt}
          iconBgClass="bg-rose-50"
          iconTextClass="text-rose-600"
          iconBorderClass="border-rose-100/50"
          valueColorClass="text-rose-600"
          loading={loading}
        />


        {/* Bookings Count */}
        <StatCard
          title="Bookings Count"
          value={stats?.totalRides ?? 0}
          subtext="rides"
          icon={ClipboardList}
          iconBgClass="bg-indigo-50"
          iconTextClass="text-indigo-600"
          iconBorderClass="border-indigo-100/50"
          loading={loading}
        />

        {/* Completed Rides */}
        <StatCard
          title="Completed Rides"
          value={stats?.completedRidesCount ?? 0}
          subtext="rides"
          icon={CheckCircle2}
          iconBgClass="bg-blue-50"
          iconTextClass="text-blue-600"
          iconBorderClass="border-blue-100/50"
          valueColorClass="text-blue-600"
          loading={loading}
        />

        {/* Today's Rides */}


        {/* Active Drivers */}
        <StatCard
          title="Active Drivers"
          value={stats?.totalDrivers ?? 0}
          subtext="active"
          icon={Users}
          iconBgClass="bg-cyan-50"
          iconTextClass="text-cyan-600"
          iconBorderClass="border-cyan-100/50"
          loading={loading}
        />

        {/* Total Income */}

        {/* Monthly Income */}


        {/* Daily Income */}


        {/* Total Expenses */}


        {/* Monthly Expenses */}


        {/* Daily Expenses */}

      </div>
    </div>
  );
}
