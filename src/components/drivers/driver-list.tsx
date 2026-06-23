'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DriverFormValues, driverSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Car, 
  Trash2, 
  Edit3, 
  Plus, 
  Search,
  X,
  Sparkles
} from 'lucide-react';

type Driver = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  licenseNo: string;
  vehicleNo: string;
  createdAt: string;
};

export function DriverList() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchDrivers = () => {
    setLoading(true);
    setError('');
    fetch('/api/getdrivers')
      .then(async (res) => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Failed to load driver data (Status: ${res.status}). Server returned non-JSON response.`);
        }
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || `Request failed with status ${res.status}`);
        }
        return json.data || [];
      })
      .then((data) => setDrivers(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const addForm = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      licenseNo: '',
      vehicleNo: '',
    },
  });

  const editForm = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      licenseNo: '',
      vehicleNo: '',
    },
  });

  // When clicking edit, populate edit form fields
  useEffect(() => {
    if (editingDriver) {
      editForm.reset({
        name: editingDriver.name,
        phone: editingDriver.phone,
        email: editingDriver.email || '',
        licenseNo: editingDriver.licenseNo,
        vehicleNo: editingDriver.vehicleNo,
      });
    }
  }, [editingDriver, editForm]);

  const onAddSubmit = async (values: DriverFormValues) => {
    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Unable to create driver');
        return;
      }

      toast.success('Driver added successfully');
      addForm.reset();
      setIsAddOpen(false);
      fetchDrivers();
    } catch (e) {
      toast.error('Failed to create driver');
    }
  };

  const onEditSubmit = async (values: DriverFormValues) => {
    if (!editingDriver) return;
    try {
      const response = await fetch(`/api/drivers/${editingDriver.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Unable to update driver');
        return;
      }

      toast.success('Driver updated successfully');
      setEditingDriver(null);
      fetchDrivers();
    } catch (e) {
      toast.error('Failed to update driver');
    }
  };

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Failed to delete driver');
        return;
      }

      toast.success('Driver deleted successfully');
      fetchDrivers();
    } catch (e) {
      toast.error('Failed to delete driver');
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search driver by name, vehicle number, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl border-slate-200"
          />
        </div>
        <Button 
          onClick={() => setIsAddOpen(!isAddOpen)} 
          className="rounded-xl bg-slate-950 text-white flex items-center gap-2 hover:bg-slate-800"
        >
          {isAddOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAddOpen ? 'Close Form' : 'Register Driver'}
        </Button>
      </div>

      {/* Register Driver Section (Responsive Card) */}
      {isAddOpen && (
        <Card className="border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.05)] overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-orange-500" />
              New Driver Registration
            </CardTitle>
            <CardDescription>Enter details to add a new driver to Ganga Taxi fleet.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Rajesh Kumar" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +91 98765 43210" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="e.g. rajesh@gmail.com" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="licenseNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. DL-1420110012345" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="vehicleNo"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Vehicle Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. BR-01PA-9999" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white" disabled={addForm.formState.isSubmitting} loading={addForm.formState.isSubmitting}>
                    Register Driver
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Edit Driver Section */}
      {editingDriver && (
        <Card className="border-orange-200 bg-orange-50/10 shadow-[0_4px_25px_rgba(0,0,0,0.05)] overflow-hidden">
          <CardHeader className="bg-orange-50/50 border-b border-orange-100">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Edit3 className="h-4.5 w-4.5 text-orange-600" />
                Edit Driver: {editingDriver.name}
              </span>
              <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setEditingDriver(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver Full Name *</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" className="rounded-xl bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="licenseNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number *</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="vehicleNo"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Vehicle Number *</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingDriver(null)} className="rounded-xl bg-white">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white" disabled={editForm.formState.isSubmitting} loading={editForm.formState.isSubmitting}>
                    Update Details
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Grid of Drivers */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive font-medium text-center">{error}</p>
          </CardContent>
        </Card>
      ) : filteredDrivers.length === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardContent className="py-12 text-center text-slate-400 text-sm">
            <User className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            No drivers found matching your search.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className="transition-all hover:shadow-md border-slate-100 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-slate-900">{driver.name}</CardTitle>
                    <Badge variant="outline" className="font-semibold text-slate-700 bg-slate-50 flex items-center gap-1.5 w-fit">
                      <Car className="h-3 w-3 text-orange-500" />
                      {driver.vehicleNo}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-2.5 flex-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <a href={`tel:${driver.phone}`} className="hover:underline">{driver.phone}</a>
                </div>
                {driver.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{driver.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  <span>License: <strong className="font-semibold text-slate-800">{driver.licenseNo}</strong></span>
                </div>
              </CardContent>
              <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50 flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setEditingDriver(driver)}
                  className="rounded-lg h-8 text-xs flex items-center gap-1 hover:bg-white"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => onDelete(driver.id, driver.name)}
                  className="rounded-lg h-8 text-xs flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
