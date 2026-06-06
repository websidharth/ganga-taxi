import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExpenseType } from '@prisma/client';
import { driverExpenseSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const skip = (page - 1) * limit;

    const driverId = searchParams.get('driverId') || undefined;
    const expenseType = searchParams.get('expenseType') as ExpenseType | null;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where = {
      ...(driverId ? { driverId } : {}),
      ...(expenseType ? { expenseType } : {}),
      ...(from || to
        ? {
            expenseDate: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const [total, expenses] = await Promise.all([
      prisma.driverDailyExpense.count({ where }),
      prisma.driverDailyExpense.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
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
      }),
    ]);

    return NextResponse.json({
      message: 'Expenses fetched successfully',
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = driverExpenseSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const expense = await prisma.driverDailyExpense.create({
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

    return NextResponse.json(
      {
        message: 'Expense created successfully',
        expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Unable to create expense' }, { status: 500 });
  }
}
