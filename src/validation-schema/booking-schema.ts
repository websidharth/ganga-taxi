// export const passengerSchema: Yup.ObjectSchema<AaertPracticeTestModel> = Yup.object().shape({
//   fullName: z.string().min(1, 'Full name is required'),
//   phone: z.string().optional(),
//   passengerType: z.enum(['ADULT', 'CHILD', 'INFANT']),
//   seatsRequired: z.coerce.number().min(1, 'At least 1 seat is required'),
//   notes: z.string().optional(),
// });

// const luggageSchema = z.object({
//   itemName: z.string().min(1, 'Item name is required'),
//   quantity: z.coerce.number().min(1, 'Quantity is required'),
//   size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']),
//   weightKg: z.coerce.number().min(0).optional(),
//   notes: z.string().optional(),
// });

// const rideBookingSchema = z.object({
//   rideDate: z.string().min(1, 'Ride date is required'),
//   estimatedKm: z.coerce.number().min(0.1, 'Estimated KM is required'),

//   pickupAddress: z.string().min(1, 'Pickup address is required'),
//   pickupLatitude: z.string().min(1, 'Pickup latitude is required'),
//   pickupLongitude: z.string().min(1, 'Pickup longitude is required'),

//   dropAddress: z.string().min(1, 'Drop address is required'),
//   dropLatitude: z.string().min(1, 'Drop latitude is required'),
//   dropLongitude: z.string().min(1, 'Drop longitude is required'),

//   routeNotes: z.string().optional(),
//   specialInstructions: z.string().optional(),

//   passengers: z.array(passengerSchema).min(1, 'Add at least one passenger'),
//   luggageItems: z.array(luggageSchema).min(1, 'Add at least one luggage item'),
// });