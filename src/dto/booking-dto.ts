
export interface BookingDto {
  estimatedKm: string;
  pickupAddress: string;
  pickupLatitude: string;
  pickupLongitude: string;
  dropAddress: string;
  dropLatitude: string;
  dropLongitude: string;
  routeNotes: string;
}

export interface CreateRideModalDto {
  driverId?: string;
  rideDate: string;     
  estimatedKm: string;
  pickupAddress: string;
  pickupLatitude?: string;
  pickupLongitude?: string;
  dropAddress: string;
  dropLatitude?: string;
  dropLongitude?: string;
  routeNotes?: string;
  specialInstructions?: string; 
  passengerName: string;
  passengerPhone?: string;
  adultCount: string;
  childCount: string;
  infantCount: string;
  passengerNotes?: string;  
  luggageCount: string;
  smallLuggageCount: string;
  largeLuggageCount: string;
  luggageNotes?: string;
}

export interface RideResponse {
  id: string;
  bookingReference: string;
  driverId?: string;
  rideDate: string;
  estimatedKm: number;
  pickupAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropAddress: string;
  dropLatitude?: number;
  dropLongitude?: number;
  routeNotes?: string;
  specialInstructions?: string;
  fareAmount?: number;
  passengerName: string;
  passengerPhone?: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  passengerNotes?: string;
  luggageItemName: string;
  luggageCount: number;
  smallLuggageCount: number;
  largeLuggageCount: number;
  luggageNotes?: string;
  createdAt: string;
  updatedAt: string;
}