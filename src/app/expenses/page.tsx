"use client";

import ExpenseManager from '../../components/home/expense-manager';

export default function ExpensesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <ExpenseManager />
      </div>
    </main>
  );
}
