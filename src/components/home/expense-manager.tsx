"use client";

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, IndianRupee, ReceiptText, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalAmount = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );

  const fetchDrivers = async () => {
    const res = await fetch('/api/getdrivers', { cache: 'no-store' });
    const payload = await res.json();

    if (!res.ok) {
      throw new Error(payload?.message || 'Failed to fetch drivers');
    }

    setDrivers(Array.isArray(payload?.data) ? payload.data : []);
  };

  const fetchExpenses = async () => {
    const res = await fetch('/api/expenses', { cache: 'no-store' });
    const payload = await res.json();

    if (!res.ok) {
      throw new Error(payload?.message || 'Failed to fetch expenses');
    }

    setExpenses(Array.isArray(payload?.data) ? payload.data : []);
  };

  const loadPageData = async () => {
    setIsLoading(true);
    setError('');

    try {
      await Promise.all([fetchDrivers(), fetchExpenses()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load expenses';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    setIsSubmitting(true);
    try {
      const requestBody = {
        ...formData,
        title: getDefaultExpenseTitle(formData.expenseType),
      };

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to create expense');
      }

      setSuccess('Expense saved successfully.');
      setFormData({ ...initialForm, expenseDate: new Date().toISOString().slice(0, 10) });
      await fetchExpenses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save expense';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader className="border-b bg-slate-50/80">
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5" />
            Driver Daily Expense
          </CardTitle>
          <CardDescription>Create an expense entry and review all recent driver expenses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Driver</label>
                <Select
                  value={formData.driverId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, driverId: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.vehicleNo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expense date</label>
                <Input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(event) => setFormData((prev) => ({ ...prev, expenseDate: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expense type</label>
                <Select
                  value={formData.expenseType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, expenseType: value as ExpenseType }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Fuel refill"
                  value={formData.title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div> */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                />
              </div>

              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Receipt URL (optional)</label>
                <Input
                  placeholder="https://..."
                  value={formData.receiptUrl}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, receiptUrl: event.target.value }))
                  }
                />
              </div> */}
            </div>

            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                className="resize-none"
                rows={3}
                placeholder="Any additional details about this expense"
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div> */}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Expense'}
              </Button>
              <Button type="button" variant="outline" onClick={loadPageData} disabled={isLoading}>
                Refresh List
              </Button>
            </div>
          </form>

          {error ? <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
          {success ? <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div> : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b bg-slate-50/80">
          <CardTitle>Expense Data</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-3">
            <span>Total records: {expenses.length}</span>
            <Badge variant="secondary" className="gap-1">
              <IndianRupee className="h-3.5 w-3.5" />
              {formatCurrency(totalAmount)}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-sm text-muted-foreground">No expense entries found.</div>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_3px_20px_rgba(0,0,0,0.02)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{expense.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3.5 w-3.5" />
                        {expense.driver?.name || 'Unknown driver'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="secondary">{expense.expenseType}</Badge>
                    <p className="mt-2 text-sm font-semibold text-green-700">
                      {formatCurrency(Number(expense.amount || 0))}
                    </p>
                  </div>
                </div>

                {expense.description ? (
                  <p className="mt-3 text-sm text-muted-foreground">{expense.description}</p>
                ) : null}

                {expense.receiptUrl ? (
                  <a
                    href={expense.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs font-medium text-blue-700 hover:underline"
                  >
                    Open receipt
                  </a>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
