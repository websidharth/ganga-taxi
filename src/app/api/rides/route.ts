import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateFare } from '@/lib/fare';
import { rideSchema } from '@/lib/validations';
import { generateBookingReference } from '@/lib/other';

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeRidePayload = (input: any) => {
  if (Array.isArray(input?.passengers)) {
    return input;
  }

  const adultCount = toNumber(input?.adultCount, 0);
  const childCount = toNumber(input?.childCount, 0);
  const infantCount = toNumber(input?.infantCount, 0);

  const luggageCount = toNumber(input?.luggageCount, 0);
  const smallLuggageCount = toNumber(input?.smallLuggageCount, 0);
  const largeLuggageCount = toNumber(input?.largeLuggageCount, 0);

  return {
    driverId: input?.driverId,
    rideDate: input?.rideDate,
    estimatedKm: input?.estimatedKm,
    pickupAddress: input?.pickupAddress,
    pickupLatitude: input?.pickupLatitude,
    pickupLongitude: input?.pickupLongitude,
    dropAddress: input?.dropAddress,
    dropLatitude: input?.dropLatitude,
    dropLongitude: input?.dropLongitude,
    routeNotes: input?.routeNotes,
    specialInstructions: input?.specialInstructions,
    passengers: [
      {
        fullName: input?.passengerName || 'Passenger',
        phone: input?.passengerPhone,
        adultCount,
        childCount,
        infantCount,
        seatsRequired: Math.max(1, adultCount + childCount),
        notes: input?.passengerNotes,
      },
    ],
    luggageItems:
      luggageCount > 0 || smallLuggageCount > 0 || largeLuggageCount > 0
        ? [
            {
              itemName: input?.luggageItemName || 'Luggage',
              luggageCount,
              smallLuggageCount,
              largeLuggageCount,
              notes: input?.luggageNotes,
            },
          ]
        : [],
  };
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = normalizeRidePayload(json);
    const parsed = rideSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const luggageItems = data.luggageItems || [];

    const passengersCount = data.passengers.reduce(
      (sum, passenger) =>
        sum +
        (passenger.adultCount || 0) +
        (passenger.childCount || 0) +
        (passenger.infantCount || 0),
      0
    );

    if (passengersCount <= 0) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          issues: { fieldErrors: { passengers: ['At least one passenger is required'] } },
        },
        { status: 400 }
      );
    }

    const hasInvalidLuggageCounts = luggageItems.some(
      (item) => item.smallLuggageCount + item.largeLuggageCount > item.luggageCount
    );

    if (hasInvalidLuggageCounts) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          issues: {
            fieldErrors: {
              luggageItems: ['Small and large luggage counts cannot exceed total luggage count'],
            },
          },
        },
        { status: 400 }
      );
    }

    const totalLuggagePieces = luggageItems.reduce((sum, item) => sum + (item.luggageCount || 0), 0);

    const fare = calculateFare({
      estimatedKm: data.estimatedKm,
      passengersCount: passengersCount > 0 ? passengersCount : data.passengers.length,
      luggageItemsCount: totalLuggagePieces,
      totalLuggageWeightKg: 0,
    });

    const ride = await prisma.ride.create({
      data: {
        bookingReference: generateBookingReference(),
        driverId: data.driverId?.trim() ? data.driverId : null,
        rideDate: new Date(data.rideDate),
        estimatedKm: data.estimatedKm,
        pickupAddress: data.pickupAddress,
        pickupLatitude: data.pickupLatitude ? Number(data.pickupLatitude) : null,
        pickupLongitude: data.pickupLongitude ? Number(data.pickupLongitude) : null,
        dropAddress: data.dropAddress,
        dropLatitude: data.dropLatitude ? Number(data.dropLatitude) : null,
        dropLongitude: data.dropLongitude ? Number(data.dropLongitude) : null,
        routeNotes: data.routeNotes,
        specialInstructions: data.specialInstructions,
        fareAmount: fare.totalFare,
        passengers: {
          create: data.passengers.map((passenger) => ({
            fullName: passenger.fullName,
            phone: passenger.phone,
            adultCount: passenger.adultCount,
            childCount: passenger.childCount,
            infantCount: passenger.infantCount,
            seatsRequired: passenger.seatsRequired,
            notes: passenger.notes,
          })),
        },
        luggageItems: {
          create: luggageItems.map((item) => ({
            itemName: item.itemName,
            luggageCount: item.luggageCount,
            smallLuggageCount: item.smallLuggageCount,
            largeLuggageCount: item.largeLuggageCount,
            notes: item.notes,
          })),
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Ride created successfully',
        rideId: ride.id,
        bookingReference: ride.bookingReference,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const json = await request.json();
    const { id, status } = json;

    if (!id || !status) {
      return NextResponse.json(
        { message: 'ID and Status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['DRAFT', 'BOOKED', 'STARTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    if (json.fareAmount !== undefined && json.fareAmount !== null && json.fareAmount !== '') {
      const parsedFare = Number(json.fareAmount);
      if (!isNaN(parsedFare)) {
        updateData.fareAmount = parsedFare;
      }
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Ride status updated successfully',
      data: updatedRide,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}