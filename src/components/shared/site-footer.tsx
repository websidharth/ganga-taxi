import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/seo";
import Logo from "../common/logo";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl container-px py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <Logo logoType="logo" width={200} height={0} className="m-0 h-auto" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{site.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Pages</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services" className="hover:text-foreground">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>{site.email}</li>
              <li>{site.phone}</li>
              <li>{site.address}</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
