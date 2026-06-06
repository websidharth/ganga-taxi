import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 container-px py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you’re looking for doesn’t exist or may have moved.</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/services">View services</Link>
        </Button>
      </div>
    </main>
  );
}
