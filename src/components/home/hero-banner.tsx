"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CardDescription } from "../ui/card";

export function HeroPostdrop() {
    return (
        <section className="relative overflow-hidden">
            <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* LEFT */}
                    <div>
                        <h1 className="text-4xl font-semibold tracking-tightsm:text-5xl md:text-6xl leading-[1.05]">
                            AI-powered HTML <br /> email template development  , <br />
                            without the pain

                        </h1>

                        <CardDescription className="mt-6 max-w-xl text-base leading-relaxed ">
                            Build, preview, test, and share bulletproof HTML emails — powered by AI and built for
                            developers & modern email marketers. Generate templates, collaborate with your team,
                            and ship emails that just work in every client.
                        </CardDescription>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button className="">
                                Build your first email — free
                            </Button>
                            <Button asChild
                                variant="secondary"
                                className=""
                            >
                                <Link href="/send-test">Try the HTML editor</Link>
                            </Button>
                        </div>

                        <div className="mt-8 ">
                            <CardDescription className="flex flex-wrap gap-3 text-xs "> 
                                <Pill>Preview</Pill>
                                <Pill>Send test</Pill>
                                <Pill>Dark mode</Pill>
                                <Pill>Export</Pill>
                                </CardDescription>
                        </div>
                    </div>

                    {/* RIGHT: mock app preview */}
                    <div className="relative">
                        {/* Outer glow */}
                        <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-r from-fuchsia-500/20 via-sky-500/15 to-violet-500/20 blur-2xl" />

                        <div className="rounded-[22px] border border-white/10 bg-[#0b1020]/70 shadow-2xl backdrop-blur">
                            {/* Top bar */}
                            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                                </div>

                                <div className="hidden items-center gap-2 sm:flex">
                                    <SmallTab>Templates</SmallTab>
                                    <SmallTab>Images</SmallTab>
                                    <SmallTab>Brand</SmallTab>
                                    <SmallTab>Export</SmallTab>
                                    <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-500">
                                        Send Test
                                    </Button>
                                </div>
                            </div>

                            {/* Body split */}
                            <div className="grid grid-cols-12 gap-0">
                                {/* Sidebar */}
                                <div className="col-span-3 hidden border-r border-white/10 p-3 sm:block">
                                    <div className="text-xs font-medium text-white/70">New Template</div>
                                    <div className="mt-3 space-y-2">
                                        <SideItem active>F1 Promotion</SideItem>
                                        <SideItem>Fall Newsletter</SideItem>
                                        <SideItem>Welcome Email</SideItem>
                                    </div>
                                </div>

                                {/* Code */}
                                <div className="col-span-12 sm:col-span-5 border-r border-white/10 p-3">
                                    <div className="mb-2 text-[11px] text-white/55">HTML</div>
                                    <pre className="h-[340px] overflow-hidden rounded-xl border border-white/10 bg-black/25 p-3 text-[11px] leading-relaxed text-white/70">
                                        {`<!doctype html>
<html>
  <body style="font-family: Arial">
    <table width="100%">
      <tr>
        <td align="center">
          <h1>Rev up your creative excitement</h1>
          <p>Celebrate the world of motorsport…</p>
          <a href="#">Shop now</a>
        </td>
      </tr>
    </table>
  </body>
</html>`}
                                    </pre>

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-[11px] text-white/50">CSS</span>
                                        <span className="text-[11px] text-white/40">Dark mode preview</span>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="col-span-12 sm:col-span-4 p-3">
                                    <div className="mb-2 text-[11px] text-white/55">Preview</div>
                                    <div className="h-[340px] overflow-hidden rounded-xl border border-white/10 bg-white">
                                        <div className="h-16 bg-[#f4b400]" />
                                        <div className="h-10 bg-[#d32f2f]" />
                                        <div className="h-[170px] bg-[radial-gradient(circle_at_50%_30%,#222,transparent_55%),linear-gradient(to_bottom,#111,#000)]" />
                                        <div className="p-4">
                                            <div className="h-5 w-3/4 rounded bg-black/10" />
                                            <div className="mt-2 h-3 w-full rounded bg-black/10" />
                                            <div className="mt-2 h-3 w-5/6 rounded bg-black/10" />
                                            <div className="mt-4 h-9 w-2/3 rounded bg-black/15" />
                                        </div>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <Button variant="secondary" className="h-8 bg-white/10 text-white hover:bg-white/15">
                                            Download
                                        </Button>
                                        <Button variant="secondary" className="h-8 bg-white/10 text-white hover:bg-white/15">
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CardDescription className="mt-4 text-xs ">
                            Tip: this is a UI mock. You can replace preview with your iframe-based HTML renderer.
                        </CardDescription>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1">
            {children}
        </span>
    );
}

function SmallTab({ children }: { children: React.ReactNode }) {
    return (
        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">
            {children}
        </span>
    );
}

function SideItem({ children, active }: { children: React.ReactNode; active?: boolean }) {
    return (
        <div
            className={cn(
                "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70",
                active && "bg-white/10 text-white"
            )}
        >
            {children}
        </div>
    );
}
