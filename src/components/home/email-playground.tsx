"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSendEmail } from "@/hooks/use-send-test-email"; // <-- update path to your hook

const DEFAULT_HTML = `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; padding: 24px;">
    <h2 style="margin:0 0 8px;">Test Email</h2>
    <p style="margin:0 0 16px;">This is a quick preview for your HTML email.</p>
    <a href="https://example.com"
      style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
      Call to Action
    </a>
  </body>
</html>`;

export function EmailPlayground() {
 
  const [html, setHtml] = React.useState(DEFAULT_HTML);
  const [to, setTo] = React.useState("");
  const [subject, setSubject] = React.useState("Test Email");

  const { sendEmail, isLoading, error, data } = useSendEmail();

  const srcDoc = React.useMemo(() => html, [html]);

  async function handleSend() {
    if (!to.trim()) {
      toast.error("Please enter recipient email.");
      return;
    }

    try {
      const res = await sendEmail({
        to,
        subject,
        html,
      });

      if (res?.success) {
        toast.success("Test email sent ✅");
      } else {
        toast.error(res?.message || res?.error || "Failed to send ❌");
      }
    } catch (e: any) {
      toast.error(e?.message || "Email failed ❌");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left */}
      <div className="lg:col-span-5">
        <Card className="rounded-2xl p-5">
          <h2 className="text-lg font-semibold">Email Playground</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste your HTML email, preview it, and send a test email using your existing hook.
          </p>

          <Tabs defaultValue="html" className="mt-5">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="send">Send test</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-4 space-y-3">
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="min-h-[360px] font-mono text-xs"
                placeholder="Paste HTML email here..."
              />

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setHtml(DEFAULT_HTML)}>
                  Reset sample
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(html)}
                >
                  Copy HTML
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="send" className="mt-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="someone@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                />
              </div>

              <Button onClick={handleSend} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send test email"}
              </Button>

              {/* Inline feedback from hook */}
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : data?.success ? (
                <p className="text-sm text-emerald-600">{data?.message || "Sent successfully"}</p>
              ) : null}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right */}
      <div className="lg:col-span-7">
        <Card className="rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preview</h3>
            <span className="text-xs text-muted-foreground">Rendered in an iframe</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border">
            <iframe
              title="Email Preview"
              className="h-[520px] w-full bg-white"
              sandbox="allow-same-origin"
              srcDoc={srcDoc}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
