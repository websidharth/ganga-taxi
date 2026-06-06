import { z } from 'zod';
import { ExpenseType } from '@prisma/client';

export const passengerSchema = z.object({
  fullName: z.string().min(2, 'Passenger name is required').default('Passenger'),
  phone: z.string().optional(),
  adultCount: z.coerce.number().min(0).default(0),
  childCount: z.coerce.number().min(0).default(0),
  infantCount: z.coerce.number().min(0).default(0),
  seatsRequired: z.coerce.number().min(1).max(8),
  notes: z.string().optional()
});

export const luggageSchema = z.object({
  itemName: z.string().min(1, 'Item name is required').default('Luggage'),
  luggageCount: z.coerce.number().min(0).default(0),
  smallLuggageCount: z.coerce.number().min(0).default(0),
  largeLuggageCount: z.coerce.number().min(0).default(0),
  notes: z.string().optional()
});

export const rideSchema = z.object({
  driverId: z.string().optional(),
  rideDate: z.string().min(1, 'Ride date is required'),
  estimatedKm: z.coerce.number().min(0.1, 'KM must be greater than 0'),
  pickupAddress: z.string().min(3, 'Pickup location is required'),
  pickupLatitude: z.string().optional(),
  pickupLongitude: z.string().optional(),
  dropAddress: z.string().min(3, 'Drop location is required'),
  dropLatitude: z.string().optional(),
  dropLongitude: z.string().optional(),
  routeNotes: z.string().optional(),
  specialInstructions: z.string().optional(),
  passengers: z.array(passengerSchema).min(1, 'At least one passenger is required'),
  luggageItems: z.array(luggageSchema).optional().default([])
});

export const driverSchema = z.object({
  name: z.string().min(2, 'Driver name is required'),
  phone: z.string().min(7, 'Phone is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  licenseNo: z.string().min(3, 'License number is required'),
  vehicleNo: z.string().min(3, 'Vehicle number is required')
});

export const driverExpenseSchema = z.object({
  driverId: z.string().min(1, 'Driver is required'),
  expenseDate: z.string().min(1, 'Expense date is required'),
  expenseType: z.nativeEnum(ExpenseType).default(ExpenseType.OTHER),
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  receiptUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export type RideFormValues = z.infer<typeof rideSchema>;
export type DriverFormValues = z.infer<typeof driverSchema>;
export type DriverExpenseFormValues = z.infer<typeof driverExpenseSchema>;
