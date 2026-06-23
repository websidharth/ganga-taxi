'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { BookingDto, CreateRideModalDto } from '@/dto/booking-dto';
import { CreateRideSchema } from '@/models/booking-schema';
import { yupResolver } from '@hookform/resolvers/yup';
import { CalendarDays, Phone, Route, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Props = {
  bookingData: BookingDto;
};
type DriverOption = { id: string; name: string; phone: string; vehicleNo: string };

export default function RideBookingPage({ bookingData }: Props) {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');


  const [drivers, setDrivers] = useState<DriverOption[]>([]);

  useEffect(() => {
    fetch('/api/getdrivers')
      .then((r) => r.json())
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          setDrivers(res.data);
        }
      })
      .catch(console.error);
  }, []);


  const form = useForm<CreateRideModalDto>({
    resolver: yupResolver(CreateRideSchema), // ✅ correct
    defaultValues: {
      rideDate: new Date().toISOString().slice(0, 16),
      estimatedKm: bookingData.estimatedKm || '',
      pickupAddress: bookingData.pickupAddress || '',
      pickupLatitude: bookingData.pickupLatitude || '',
      pickupLongitude: bookingData.pickupLongitude || '',
      dropAddress: bookingData.dropAddress || '',
      dropLatitude: bookingData.dropLatitude || '',
      dropLongitude: bookingData.dropLongitude || '',
      passengerName: '',
      passengerPhone: '',
      adultCount: '1',
      childCount: '0',
      infantCount: '0',
      passengerNotes: 'none',
      luggageCount: '0',
      smallLuggageCount: '0',
      largeLuggageCount: '0',
      luggageNotes: 'none',
      routeNotes: bookingData.routeNotes || '',
      specialInstructions: 'none',
      driverId: '',
    },
  });



  const { handleSubmit, formState, reset, setError, clearErrors, watch } = form;

  const onSubmit = async (values: CreateRideModalDto) => {
    setSubmitError('');
    setSubmitSuccess('');
    clearErrors();
    try {
      const payload = values;

      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmitError(data?.message || 'Failed to save ride booking');
        return;
      }

      setSubmitSuccess(
        data?.bookingReference
          ? `Ride booked successfully. Ref: ${data.bookingReference}`
          : 'Ride booked successfully.'
      );


      reset({
        estimatedKm: '',
        pickupAddress: '',
        pickupLatitude: '',
        pickupLongitude: '',
        dropAddress: '',
        dropLatitude: '',
        dropLongitude: '',
        passengerName: '',
        passengerPhone: '',
        adultCount: '1',
        childCount: '0',
        infantCount: '0',
        passengerNotes: 'none',
        luggageCount: '0',
        smallLuggageCount: '0',
        largeLuggageCount: '0',
        luggageNotes: 'none',
        routeNotes: '',
        specialInstructions: 'none',
        driverId: '',
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process booking';
      setSubmitError(errorMessage);
      console.error('Submit error:', error);
    }
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="mt-6 overflow-hidden rounded-2xl border-slate-200">

      <CardContent className="pt-6">
        <Form {...form}>
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            {/* Primary Passenger & Ride Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="passengerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Passenger name *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input className="pl-9 rounded-xl border-slate-200" placeholder="Passenger Full name" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passengerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Phone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input className="pl-9 rounded-xl border-slate-200" placeholder="Contact number" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rideDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Ride date & time *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                        <Input className="pl-9 rounded-xl border-slate-200" type="datetime-local" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Driver (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-xl border-slate-200">
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drivers.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} — {d.vehicleNo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            {/* Toggle Advanced Button */}
            <div className="flex justify-center border-t border-slate-100 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <span className="underline decoration-dotted decoration-slate-400 underline-offset-4">
                  {showAdvanced ? "Hide booking details" : "Edit booking details (Route, Passengers, Notes)"}
                </span>
              </Button>
            </div>

            {/* Collapsible Advanced Form Fields */}
            <div className={showAdvanced ? "space-y-6 border-t border-slate-100 pt-4" : "hidden"}>


              {/* Passengers and Luggage count */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Users className="h-4 w-4" />
                  <span>Passengers & Luggage</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="adultCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adults</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="childCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Children</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="luggageCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Luggage</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Route Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Route className="h-4 w-4" />
                  <span>Route Details</span>
                </div>
                <FormField
                  control={form.control}
                  name="routeNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Preferred route, avoid tolls, etc."
                          className="resize-none text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-5 shadow-sm" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? 'Booking...' : 'Confirm & Book Ride'}
              </Button>
              <CardDescription className="text-center text-xs text-muted-foreground mt-3">
                256-bit SSL · Payments are 100% secure
              </CardDescription>
            </div>

            {submitError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200 font-medium">
                {submitSuccess}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
