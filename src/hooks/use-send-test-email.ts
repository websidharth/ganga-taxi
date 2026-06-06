'use client';

import { useState, useCallback } from 'react';

export type EmailPayload = {
  to: string;               // Recipient email
  subject: string;          // Email subject
  html: string;            // HTML content
  text?: string;           // Plain text fallback (optional)
  from?: string;           //add from env variable MAIL_FROM
  replyTo?: string;        // Reply-to address (optional)
};

export type EmailResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export function useSendEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EmailResponse | null>(null);

  const sendEmail = useCallback(async (payload: EmailPayload) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to send email');
      }

      setData(json);
      return json;
    } catch (err: any) {
      const message = err.message || 'Something went wrong';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { sendEmail, isLoading, error, data };
}