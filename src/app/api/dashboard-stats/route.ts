import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalRides, totalDrivers, monthlyExpenses, todayRides] = await Promise.all([
      prisma.ride.count(),
      prisma.driver.count(),
      prisma.driverDailyExpense.aggregate({
        where: {
          expenseDate: {
            gte: firstDayOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.ride.count({
        where: {
          rideDate: {
            gte: today,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalRides,
        totalDrivers,
        monthlyExpenses: monthlyExpenses._sum.amount ? Number(monthlyExpenses._sum.amount) : 0,
        todayRides,
      },
    });
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load dashboard stats' },
      { status: 500 }
    );
  }
}
