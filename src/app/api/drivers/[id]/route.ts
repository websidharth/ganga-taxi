import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverSchema } from '@/lib/validations';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const json = await request.json();
    const parsed = driverSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        licenseNo: parsed.data.licenseNo,
        vehicleNo: parsed.data.vehicleNo
      }
    });

    return NextResponse.json({ message: 'Driver updated successfully', driver }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Unable to update driver. Email or license number may already exist.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.driver.delete({
      where: { id }
    });
    return NextResponse.json({ message: 'Driver deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to delete driver' }, { status: 500 });
  }
}
