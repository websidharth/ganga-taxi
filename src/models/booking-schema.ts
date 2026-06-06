import { CreateRideModalDto } from '@/dto/booking-dto';
import * as Yup from 'yup';

export const CreateRideSchema: Yup.ObjectSchema<CreateRideModalDto> = Yup.object({
    rideDate: Yup.string().required('Ride date is required').min(1, 'Ride date is required'),
    estimatedKm: Yup.string().required('Estimated KM is required').matches(/^(?:[1-9]\d*(?:\.\d+)?|0\.\d*[1-9]\d*)$/, 'Must be a number greater than 0'),
    pickupAddress: Yup.string().required('Pickup address is required').min(3, 'Pickup address is required'),
    pickupLatitude: Yup.string().optional(),
    pickupLongitude: Yup.string().optional(),
    dropAddress: Yup.string().required('Drop address is required').min(3, 'Drop address is required'),
    dropLatitude: Yup.string().optional(),
    dropLongitude: Yup.string().optional(),
    passengerName: Yup.string().required('Passenger name is required').min(2, 'Passenger name is required'),
    passengerPhone: Yup.string().optional(),
    adultCount: Yup.string().required('Amount is required.').matches(/^[0-9]\d*$/, 'Must be a number greater than 0'),
    childCount: Yup.string().required('Amount is required.').matches(/^[0-9]\d*$/, 'Must be a number greater than 0'),
    infantCount: Yup.string().required('Amount is required.').matches(/^[0-9]\d*$/, 'Must be a number greater than 0'),
    passengerNotes: Yup.string().optional(),
    luggageCount: Yup.string().required('Amount is required.').matches(/^[0-9]\d*$/, 'Must be a number greater than 0'),
    smallLuggageCount: Yup.string().required('Amount is required.').matches(/^[0-9]\d*$/, 'Must be a number greater than 0'),
    largeLuggageCount: Yup.string().required('Amount is required.').matches(/^[0-9]\d*$/, 'Must be a number greater than 0'),
    luggageNotes: Yup.string().optional(),
    routeNotes: Yup.string().optional(),
    specialInstructions: Yup.string().optional(),
    driverId: Yup.string().optional(),
}).required();