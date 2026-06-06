"use client"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DriverFormValues, driverSchema } from '@/lib/validations';
import { Card } from '../ui/card';

export function AddRiderForm() {
    const router = useRouter();
    const form = useForm<DriverFormValues>({
        resolver: zodResolver(driverSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            licenseNo: '',
            vehicleNo: '',
        },
    });

    const onSubmit = async (values: DriverFormValues) => {
        const response = await fetch('/api/drivers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.message || 'Unable to create driver');
            return;
        }

        router.push('/');
        router.refresh();
    };

    return (
        <div className="">
           <Card>
             
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">

                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Driver name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
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
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="licenseNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>License number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Driver's license number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vehicleNo"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Vehicle number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Vehicle registration number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Save driver'}
                        </Button>
                    </div>
                </form>
            </Form>
            </Card>
        </div>
    );
}