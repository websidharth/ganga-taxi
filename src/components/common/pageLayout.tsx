import * as React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
export default function PageLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button type="button" asChild>
            <Link href="/add-rider">Driver list</Link>
          </Button>
          <Button type="button" asChild>
            <Link href="/expenses">Expenses List</Link>
          </Button>
          <Button type="button" asChild>
            <Link href="/booking-details">Booking List</Link>
          </Button>
        </div>
      </div>
      {children}
    </> 
  );
}
