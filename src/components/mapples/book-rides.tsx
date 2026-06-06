'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CalendarDays, CarTaxiFront, MapPin, Route, Users, BriefcaseBusiness } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BookingDto, CreateRideModalDto } from '@/dto/booking-dto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Separator } from '@/components/ui/separator';
import { CreateRideSchema } from '@/models/booking-schema';
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
            .then((data) => Array.isArray(data) && setDrivers(data))
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
            adultCount: '',
            childCount: '',
            infantCount: '0',
            passengerNotes: 'none',
            luggageCount: '',
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
                adultCount: '',
                childCount: '',
                infantCount: '',
                passengerNotes: '',
                luggageCount: '',
                smallLuggageCount: '',
                largeLuggageCount: '',
                luggageNotes: '',
                routeNotes: '',
                specialInstructions: '',
                driverId: '',
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to process booking';
            setSubmitError(errorMessage);
            console.error('Submit error:', error);
        }
    };

    return (
        <Card className="mt-6 overflow-hidden rounded-2xl border-slate-200">
            <CardHeader className="border-b bg-slate-50/70">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CarTaxiFront className="h-5 w-5" />
                    Taxi booking form
                </CardTitle>
                {/* <CardDescription>
                    Form rebuilt from your Prisma Ride, Passenger and LuggageItem models.
                </CardDescription> */}
                <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary">Ride</Badge>
                    <Badge variant="secondary">Passenger</Badge>
                    <Badge variant="secondary">Luggage</Badge>
                </div>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                        {/* Ride Details Section */}
                        <div className="space-y-4">
                            {/* <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                <span>Ride details</span>
                            </div> */}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="rideDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ride date & time *</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="estimatedKm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated distance *</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 15.5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="passengerName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passenger name*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Passenger Full name" {...field} />
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
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contact number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>



                        </div>

                        {/* <Separator /> */}

                        {/* Pickup Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>Pickup location</span>
                            </div>
                            <FormField
                                control={form.control}
                                name="pickupAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Street, city, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <Separator />

                        {/* Drop Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>Drop location</span>
                            </div>
                            <FormField
                                control={form.control}
                                name="dropAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Street, city, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>Passengers</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="adultCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Adults</FormLabel>
                                            <FormControl>
                                                <Input type="text"    {...field} />
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
                                                <Input type="text"  {...field} />
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
                                                <Input type="text"   {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>

                            {/* <FormField
                                control={form.control}
                                name="passengerNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Special needs, accessibility requirements, etc."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                        </div>

                        <Separator />




                        {/* <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <BriefcaseBusiness className="h-4 w-4" />
                                <span>Luggage</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                               
                                <FormField
                                    control={form.control}
                                    name="smallLuggageCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Small items</FormLabel>
                                            <FormControl>
                                                <Input type="text"   {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="largeLuggageCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Large items</FormLabel>
                                            <FormControl>
                                                <Input type="text"   {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="luggageNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Fragile items, special handling, etc."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div> */}

                        <Separator />

                        {/* Additional Instructions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <Route className="h-4 w-4" />
                                <span>Additional details</span>
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
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <FormField
                                control={form.control}
                                name="specialInstructions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Special instructions</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="AC requirement, waiting time, pet policy, etc."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                            <FormField
                                control={form.control}
                                name="driverId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Driver (optional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
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

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
                                {formState.isSubmitting ? 'Booking...' : 'Submit Booking'}
                            </Button>
                            <CardDescription className="text-center text-xs text-muted-foreground mt-2">
                                256-bit SSL · Payments are 100% secure
                            </CardDescription>
                        </div>


                        {submitError && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {submitError}
                            </div>
                        )}



                        {submitSuccess && (
                            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                                {submitSuccess}
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}