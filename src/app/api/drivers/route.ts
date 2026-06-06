import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverSchema } from '@/lib/validations';

 
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = driverSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
    }

    const driver = await prisma.driver.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        licenseNo: parsed.data.licenseNo,
        vehicleNo: parsed.data.vehicleNo
      }
    });

    return NextResponse.json({ message: 'Driver created successfully', driverId: driver.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Unable to create driver. Email or license number may already exist.' }, { status: 500 });
  }
}
