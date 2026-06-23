import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalRides,
      totalDrivers,
      todayRides,
      completedRidesCount,
      totalExpensesSum,
      monthlyExpensesSum,
      dailyExpensesSum,
      totalIncomeSum,
      monthlyIncomeSum,
      dailyIncomeSum,
    ] = await Promise.all([
      prisma.ride.count(),
      prisma.driver.count(),
      prisma.ride.count({
        where: {
          rideDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.ride.count({
        where: {
          status: 'COMPLETED',
        },
      }),
      prisma.driverDailyExpense.aggregate({
        _sum: { amount: true },
      }),
      prisma.driverDailyExpense.aggregate({
        where: {
          expenseDate: { gte: firstDayOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.driverDailyExpense.aggregate({
        where: {
          expenseDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: { amount: true },
      }),
      prisma.ride.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { fareAmount: true },
      }),
      prisma.ride.aggregate({
        where: {
          status: 'COMPLETED',
          rideDate: { gte: firstDayOfMonth },
        },
        _sum: { fareAmount: true },
      }),
      prisma.ride.aggregate({
        where: {
          status: 'COMPLETED',
          rideDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: { fareAmount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalRides,
        totalDrivers,
        todayRides,
        completedRidesCount,
        totalExpenses: totalExpensesSum._sum.amount ? Number(totalExpensesSum._sum.amount) : 0,
        monthlyExpenses: monthlyExpensesSum._sum.amount ? Number(monthlyExpensesSum._sum.amount) : 0,
        dailyExpenses: dailyExpensesSum._sum.amount ? Number(dailyExpensesSum._sum.amount) : 0,
        totalIncome: totalIncomeSum._sum.fareAmount ? Number(totalIncomeSum._sum.fareAmount) : 0,
        monthlyIncome: monthlyIncomeSum._sum.fareAmount ? Number(monthlyIncomeSum._sum.fareAmount) : 0,
        dailyIncome: dailyIncomeSum._sum.fareAmount ? Number(dailyIncomeSum._sum.fareAmount) : 0,
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
