import type { Metadata } from "next";
import { Inter  } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/shared/providers";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/components/shared/json-ld";
import { absoluteUrl, site } from "@/lib/seo";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/shared/site-header";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageLayout from "@/components/common/pageLayout";
 

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    title: site.title,
    description: site.description,
    siteName: site.name,
    images: [{ url: absoluteUrl(site.ogImage), width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [absoluteUrl(site.ogImage)],
    creator: site.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter)}>
      <body className={inter.className}>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow"
          >
            Skip to content
          </a>
          <JsonLd data={websiteJsonLd} />
          <JsonLd data={organizationJsonLd} />
         
          <div id="main-content" className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(255,196,152,0.4)_0%,transparent_42%),radial-gradient(circle_at_85%_20%,rgba(126,173,255,0.35)_0%,transparent_45%),linear-gradient(145deg,#f4efe7_0%,#eaf2ff_52%,#f8f9ff_100%)] p-6   max-sm:px-3 max-sm:py-6 ">
              {/* <SiteHeader/> */}
               <PageLayout><TooltipProvider>{children}</TooltipProvider></PageLayout> 
                    
          </div>
          {/* <footer className="border-t border-[#d9e4f4] bg-[rgba(232,241,253,0.65)] p-[14px] text-center text-[0.8rem] text-[#587297]">
            Default size: 300x110px | Max size: 2000x2000px
          </footer> */}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
