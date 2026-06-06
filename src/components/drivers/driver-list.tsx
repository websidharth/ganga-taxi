'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type Driver = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  licenseNo: string;
  vehicleNo: string;
  createdAt: string;
};

export function DriverList() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/getdrivers')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || `Request failed: ${res.status}`);
        }
        return json.data || [];
      })
      .then((data) => setDrivers(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive font-medium text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!drivers.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 pb-6 text-center text-muted-foreground text-sm">
          No drivers found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {drivers.map((driver) => (
        <Card key={driver.id} className="transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{driver.name}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {driver.phone}
                </div>
              </div>
              <Badge variant="outline">{driver.vehicleNo}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">License:</span>
              <span className="font-medium truncate">{driver.licenseNo}</span>
            </div>
            {driver.email && (
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <span className="text-muted-foreground">Email:</span>
                <span className="truncate">{driver.email}</span>
              </div>
            )}
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Joined:</span>
              <span>{new Date(driver.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
