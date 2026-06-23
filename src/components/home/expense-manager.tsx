'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, IndianRupee, ReceiptText, UserRound, Plus, Trash2, Edit3, Sparkles, Filter, X, BarChart3, ListCollapse, Coffee, Wrench, Compass, Coins, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import StatCard from '@/components/common/stat-card';

const EXPENSE_TYPES = ['FUEL', 'TOLL', 'PARKING', 'FOOD', 'MAINTENANCE', 'OTHER'] as const;

type ExpenseType = (typeof EXPENSE_TYPES)[number];

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string;
};

type Expense = {
  id: string;
  driverId: string;
  expenseDate: string;
  expenseType: ExpenseType;
  title: string;
  description: string | null;
  amount: string | number;
  receiptUrl: string | null;
  createdAt: string;
  driver: Driver;
};

type ExpenseFormState = {
  driverId: string;
  expenseDate: string;
  expenseType: ExpenseType;
  description: string;
  amount: string;
  receiptUrl: string;
  title?: string;
};

const getDefaultExpenseTitle = (expenseType: ExpenseType) => {
  switch (expenseType) {
    case 'FUEL':
      return 'Fuel expense';
    case 'TOLL':
      return 'Toll expense';
    case 'PARKING':
      return 'Parking expense';
    case 'FOOD':
      return 'Food expense';
    case 'MAINTENANCE':
      return 'Maintenance expense';
    default:
      return 'Driver expense';
  }
};

const initialForm: ExpenseFormState = {
  driverId: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  expenseType: 'OTHER',
  description: '',
  amount: '',
  receiptUrl: '',
};

export default function ExpenseManager() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [formData, setFormData] = useState<ExpenseFormState>(initialForm);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState<ExpenseFormState>(initialForm);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  // Filters
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL'); // format: YYYY-MM

  const fetchDrivers = async () => {
    const res = await fetch('/api/getdrivers', { cache: 'no-store' });
    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload?.message || 'Failed to fetch drivers');
    }
    setDrivers(Array.isArray(payload?.data) ? payload.data : []);
  };

  const fetchExpenses = async () => {
    const res = await fetch('/api/expenses?limit=100', { cache: 'no-store' });
    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload?.message || 'Failed to fetch expenses');
    }
    setExpenses(Array.isArray(payload?.data) ? payload.data : []);
  };

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchDrivers(), fetchExpenses()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.driverId) {
      toast.error('Please select a driver');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody = {
        ...formData,
        amount: Number(formData.amount),
        title: getDefaultExpenseTitle(formData.expenseType),
      };

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to create expense');
      }

      toast.success('Expense recorded successfully!');
      setFormData({ ...initialForm, expenseDate: new Date().toISOString().slice(0, 10) });
      await fetchExpenses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingExpense) return;

    try {
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          amount: Number(editFormData.amount),
          title: getDefaultExpenseTitle(editFormData.expenseType),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to update expense');
      }

      toast.success('Expense updated successfully!');
      setEditingExpense(null);
      await fetchExpenses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }
      toast.success('Expense record deleted successfully!');
      await fetchExpenses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setEditFormData({
      driverId: expense.driverId,
      expenseDate: new Date(expense.expenseDate).toISOString().slice(0, 10),
      expenseType: expense.expenseType,
      description: expense.description || '',
      amount: String(expense.amount),
      receiptUrl: expense.receiptUrl || '',
    });
  };

  // Filter computation
  const months = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach(e => {
      const date = new Date(e.expenseDate);
      if (!isNaN(date.getTime())) {
        const yyyymm = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        set.add(yyyymm);
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesDriver = selectedDriverFilter === 'ALL' || item.driverId === selectedDriverFilter;
      const matchesType = selectedTypeFilter === 'ALL' || item.expenseType === selectedTypeFilter;
      
      let matchesMonth = true;
      if (selectedMonthFilter !== 'ALL') {
        const date = new Date(item.expenseDate);
        const yyyymm = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        matchesMonth = yyyymm === selectedMonthFilter;
      }

      return matchesDriver && matchesType && matchesMonth;
    });
  }, [expenses, selectedDriverFilter, selectedTypeFilter, selectedMonthFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    let total = 0;
    let fuel = 0;
    let toll = 0;
    let parking = 0;
    let maintenance = 0;
    let food = 0;
    let other = 0;

    filteredExpenses.forEach(e => {
      const amt = Number(e.amount || 0);
      total += amt;
      if (e.expenseType === 'FUEL') fuel += amt;
      else if (e.expenseType === 'TOLL') toll += amt;
      else if (e.expenseType === 'PARKING') parking += amt;
      else if (e.expenseType === 'MAINTENANCE') maintenance += amt;
      else if (e.expenseType === 'FOOD') food += amt;
      else other += amt;
    });

    return { total, fuel, toll, parking, maintenance, food, other };
  }, [filteredExpenses]);

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const categoryStats = useMemo(() => {
    const todayStats = { FUEL: 0, TOLL: 0, PARKING: 0, MAINTENANCE: 0, FOOD: 0, OTHER: 0 };
    const monthStats = { FUEL: 0, TOLL: 0, PARKING: 0, MAINTENANCE: 0, FOOD: 0, OTHER: 0 };

    expenses.forEach(e => {
      const amt = Number(e.amount || 0);
      const type = e.expenseType;
      
      if (isToday(e.expenseDate)) {
        if (type in todayStats) {
          todayStats[type] += amt;
        } else {
          todayStats.OTHER += amt;
        }
      }

      if (isCurrentMonth(e.expenseDate)) {
        if (type in monthStats) {
          monthStats[type] += amt;
        } else {
          monthStats.OTHER += amt;
        }
      }
    });

    return { today: todayStats, month: monthStats };
  }, [expenses]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Expense Tracker
          </h1>
          <p className="text-slate-500 mt-1">
            Track daily fuel, toll, parking, maintenance, and food expenses easily.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Dashboard & Log
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListCollapse className="h-3.5 w-3.5" />
            Expense History ({filteredExpenses.length})
          </button>
        </div>
      </div>

      {/* Edit Expense Modal/Card Overlay */}
      {editingExpense && (
        <Card className="border-orange-200 bg-orange-50/10 shadow-lg animate-in zoom-in-95 duration-200">
          <CardHeader className="bg-orange-50/50 border-b border-orange-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit3 className="h-4.5 w-4.5 text-orange-600" />
                Modify Expense Details
              </CardTitle>
              <CardDescription>Adjust expense amounts, dates, or driver allocation.</CardDescription>
            </div>
            <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setEditingExpense(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Driver</label>
                  <Select
                    value={editFormData.driverId}
                    onValueChange={(val) => setEditFormData(prev => ({ ...prev, driverId: val }))}
                  >
                    <SelectTrigger className="rounded-xl bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name} ({d.vehicleNo})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</label>
                  <Input
                    type="date"
                    value={editFormData.expenseDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                    className="rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
                  <Select
                    value={editFormData.expenseType}
                    onValueChange={(val) => setEditFormData(prev => ({ ...prev, expenseType: val as ExpenseType }))}
                  >
                    <SelectTrigger className="rounded-xl bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount (INR)</label>
                  <Input
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                  <Input
                    placeholder="Short description note"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="rounded-xl bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="rounded-xl bg-white" onClick={() => setEditingExpense(null)}>Cancel</Button>
                <Button type="submit" className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main Grid View */}
      {activeTab === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Record Form */}
          <Card className="border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)] rounded-3xl bg-white overflow-hidden h-fit lg:col-span-1">
            <CardHeader className="bg-slate-50/40 border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-lg flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="h-4.5 w-4.5 text-orange-500" />
                Record Daily Expense
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">File a new fuel charge, toll ticket, parking fee, etc.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Assign Driver *</label>
                  <Select
                    value={formData.driverId}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, driverId: val }))}
                  >
                    <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-200/60 font-semibold text-slate-800 focus:bg-white py-5">
                      <SelectValue placeholder="Choose driver" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {drivers.map(d => (
                        <SelectItem key={d.id} value={d.id} className="font-semibold text-slate-700">{d.name} ({d.vehicleNo})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Expense Date *</label>
                  <Input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                    className="rounded-xl bg-slate-50/50 border-slate-200/60 font-semibold text-slate-800 focus:bg-white py-5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Category *</label>
                  <Select
                    value={formData.expenseType}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, expenseType: val as ExpenseType }))}
                  >
                    <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-200/60 font-semibold text-slate-800 focus:bg-white py-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {EXPENSE_TYPES.map(t => (
                        <SelectItem key={t} value={t} className="font-semibold text-slate-700">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Amount (INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">₹</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-8 rounded-xl bg-slate-50/50 border-slate-200/60 font-semibold text-slate-800 focus:bg-white py-5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Notes / Remarks</label>
                  <Input
                    placeholder="Short description note (e.g. 15L Fuel)"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="rounded-xl bg-slate-50/50 border-slate-200/60 font-semibold text-slate-800 focus:bg-white py-5"
                  />
                </div>

                <Button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all" disabled={isSubmitting}>
                  {isSubmitting ? 'Recording...' : 'Record Expense'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Analytics & Summaries */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter controls inside Dashboard for current view */}
            <Card className="border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)] rounded-3xl bg-white overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Track Analytics Breakdown</CardTitle>
                <CardDescription className="text-xs text-slate-500">Summary of category spends according to current filters.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Aggregate KPI */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white flex flex-row items-center justify-between gap-3 shadow-lg">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block leading-none">Total Spent (Filtered)</span>
                    <h3 className="text-3xl font-black tracking-tight mt-2 text-white">{formatCurrency(stats.total)}</h3>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs py-1 px-3.5 rounded-xl font-bold shrink-0">
                    {filteredExpenses.length} Records
                  </Badge>
                </div>

                {/* Category Grid Progress */}
                <div className="space-y-4 pt-2">
                  {[
                    { label: 'Fuel', amount: stats.fuel, color: 'bg-amber-500' },
                    { label: 'Toll', amount: stats.toll, color: 'bg-blue-500' },
                    { label: 'Parking', amount: stats.parking, color: 'bg-emerald-500' },
                    { label: 'Maintenance', amount: stats.maintenance, color: 'bg-rose-500' },
                    { label: 'Food', amount: stats.food, color: 'bg-indigo-500' },
                    { label: 'Other', amount: stats.other, color: 'bg-slate-500' },
                  ].map((cat) => {
                    const percent = stats.total > 0 ? (cat.amount / stats.total) * 100 : 0;
                    return (
                      <div key={cat.label} className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="font-semibold text-slate-600">{cat.label}</span>
                          <span className="font-bold text-slate-900">{formatCurrency(cat.amount)} ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Monthly and Daily summaries breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)] rounded-2xl bg-white overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fuel Allocation</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-5">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.fuel)}</div>
                  <p className="text-[10px] text-slate-450 font-semibold mt-1">Refills, CNG, diesel receipts</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)] rounded-2xl bg-white overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tolls & Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-5">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.toll + stats.maintenance)}</div>
                  <p className="text-[10px] text-slate-450 font-semibold mt-1">Highways, wear & tear repairs</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Today & Monthly Category Expenses Breakdowns Section */}
          <div className="lg:col-span-3 space-y-6 pt-6 border-t border-slate-100/80">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Today's Category Expenses</h3>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <StatCard
                  title="Fuel"
                  value={formatCurrency(categoryStats.today.FUEL)}
                  icon={Coins}
                  iconBgClass="bg-amber-50"
                  iconTextClass="text-amber-600"
                  iconBorderClass="border-amber-100/50"
                  valueColorClass="text-amber-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Toll"
                  value={formatCurrency(categoryStats.today.TOLL)}
                  icon={ReceiptText}
                  iconBgClass="bg-blue-50"
                  iconTextClass="text-blue-600"
                  iconBorderClass="border-blue-100/50"
                  valueColorClass="text-blue-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Parking"
                  value={formatCurrency(categoryStats.today.PARKING)}
                  icon={Compass}
                  iconBgClass="bg-emerald-50"
                  iconTextClass="text-emerald-600"
                  iconBorderClass="border-emerald-100/50"
                  valueColorClass="text-emerald-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Food"
                  value={formatCurrency(categoryStats.today.FOOD)}
                  icon={Coffee}
                  iconBgClass="bg-indigo-50"
                  iconTextClass="text-indigo-600"
                  iconBorderClass="border-indigo-100/50"
                  valueColorClass="text-indigo-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Maintenance"
                  value={formatCurrency(categoryStats.today.MAINTENANCE)}
                  icon={Wrench}
                  iconBgClass="bg-rose-50"
                  iconTextClass="text-rose-600"
                  iconBorderClass="border-rose-100/50"
                  valueColorClass="text-rose-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Other"
                  value={formatCurrency(categoryStats.today.OTHER)}
                  icon={HelpCircle}
                  iconBgClass="bg-slate-50"
                  iconTextClass="text-slate-600"
                  iconBorderClass="border-slate-200/50"
                  loading={isLoading}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100/80">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Monthly Category Expenses</h3>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <StatCard
                  title="Fuel"
                  value={formatCurrency(categoryStats.month.FUEL)}
                  icon={Coins}
                  iconBgClass="bg-amber-50"
                  iconTextClass="text-amber-600"
                  iconBorderClass="border-amber-100/50"
                  valueColorClass="text-amber-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Toll"
                  value={formatCurrency(categoryStats.month.TOLL)}
                  icon={ReceiptText}
                  iconBgClass="bg-blue-50"
                  iconTextClass="text-blue-600"
                  iconBorderClass="border-blue-100/50"
                  valueColorClass="text-blue-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Parking"
                  value={formatCurrency(categoryStats.month.PARKING)}
                  icon={Compass}
                  iconBgClass="bg-emerald-50"
                  iconTextClass="text-emerald-600"
                  iconBorderClass="border-emerald-100/50"
                  valueColorClass="text-emerald-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Food"
                  value={formatCurrency(categoryStats.month.FOOD)}
                  icon={Coffee}
                  iconBgClass="bg-indigo-50"
                  iconTextClass="text-indigo-600"
                  iconBorderClass="border-indigo-100/50"
                  valueColorClass="text-indigo-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Maintenance"
                  value={formatCurrency(categoryStats.month.MAINTENANCE)}
                  icon={Wrench}
                  iconBgClass="bg-rose-50"
                  iconTextClass="text-rose-600"
                  iconBorderClass="border-rose-100/50"
                  valueColorClass="text-rose-600"
                  loading={isLoading}
                />
                <StatCard
                  title="Other"
                  value={formatCurrency(categoryStats.month.OTHER)}
                  icon={HelpCircle}
                  iconBgClass="bg-slate-50"
                  iconTextClass="text-slate-600"
                  iconBorderClass="border-slate-200/50"
                  loading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History & CRUD list */
        <Card className="border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>History & Log</CardTitle>
                <CardDescription>View, edit, or delete expenses recorded for drivers.</CardDescription>
              </div>

              {/* Filters Block */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Driver filter */}
                <div className="w-[140px]">
                  <Select value={selectedDriverFilter} onValueChange={setSelectedDriverFilter}>
                    <SelectTrigger className="h-8 rounded-lg text-xs bg-slate-50 border-slate-200">
                      <SelectValue placeholder="All Drivers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Drivers</SelectItem>
                      {drivers.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type filter */}
                <div className="w-[130px]">
                  <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                    <SelectTrigger className="h-8 rounded-lg text-xs bg-slate-50 border-slate-200">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      {EXPENSE_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Month filter */}
                <div className="w-[130px]">
                  <Select value={selectedMonthFilter} onValueChange={setSelectedMonthFilter}>
                    <SelectTrigger className="h-8 rounded-lg text-xs bg-slate-50 border-slate-200">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Months</SelectItem>
                      {months.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Filters button */}
                {(selectedDriverFilter !== 'ALL' || selectedTypeFilter !== 'ALL' || selectedMonthFilter !== 'ALL') && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-lg"
                    onClick={() => {
                      setSelectedDriverFilter('ALL');
                      setSelectedTypeFilter('ALL');
                      setSelectedMonthFilter('ALL');
                    }}
                  >
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {isLoading ? (
              <p className="text-sm text-slate-400">Loading expense logs...</p>
            ) : filteredExpenses.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No expenses match the selected filters.</p>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-md transition duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{expense.title}</p>
                          <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider py-0 px-2">
                            {expense.expenseType}
                          </Badge>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <UserRound className="h-3.5 w-3.5 text-orange-500" />
                            {expense.driver?.name || 'Unknown Driver'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {formatCurrency(Number(expense.amount || 0))}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => startEdit(expense)}>
                            <Edit3 className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-rose-50" onClick={() => handleDelete(expense.id)}>
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {expense.description && (
                      <p className="mt-2 text-xs text-slate-500 border-t border-slate-50 pt-2">{expense.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
