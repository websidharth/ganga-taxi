import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/lib/constants";

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl" aria-hidden>
            {service.icon}
          </span>
          <Badge variant="secondary">{service.category}</Badge>
        </div>
        <CardTitle className="text-lg">{service.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{service.description}</p>
        <Link target="_blank"
          href={`/tools/${service.slug}`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          aria-label={`Read more about ${service.title}`}
        >
          Learn more →
        </Link>
      </CardContent>
    </Card>
  );
}
