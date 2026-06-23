import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { driverExpenseSchema } from '@/lib/validations';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const json = await request.json();
    const parsed = driverExpenseSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
    }

    const expense = await prisma.driverDailyExpense.update({
      where: { id },
      data: {
        driverId: parsed.data.driverId,
        expenseDate: new Date(parsed.data.expenseDate),
        expenseType: parsed.data.expenseType,
        title: parsed.data.title,
        description: parsed.data.description || null,
        amount: parsed.data.amount,
        receiptUrl: parsed.data.receiptUrl || null,
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleNo: true,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Expense updated successfully', expense }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Unable to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.driverDailyExpense.delete({
      where: { id }
    });
    return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to delete expense' }, { status: 500 });
  }
}
