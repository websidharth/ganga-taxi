import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined;
    const driverId = searchParams.get('driverId') || undefined;
    const bookingReference = searchParams.get('bookingReference') || undefined;

    const where = {
      ...(status ? { status: status as any } : {}),
      ...(driverId ? { driverId } : {}),
      ...(bookingReference
        ? { bookingReference: { contains: bookingReference, mode: 'insensitive' as const } }
        : {}),
    };

    const [total, rides] = await Promise.all([
      prisma.ride.count({ where }),
      prisma.ride.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
              vehicleNo: true,
            },
          },
          passengers: true,
          luggageItems: true,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Bookings fetched successfully',
      data: rides,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch bookings' }, { status: 500 });
  }
}