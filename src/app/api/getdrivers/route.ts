import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverSchema } from '@/lib/validations';

 

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        vehicleNo: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ message: 'Drivers fetched successfully', data: drivers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch drivers' }, { status: 500 });
  }
}


