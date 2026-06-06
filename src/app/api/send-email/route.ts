import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true, // Keep connection alive – good for serverless
  maxConnections: 5,
  maxMessages: Infinity,
});

export async function POST(req: Request) {
  try {
    const body = await req.json(); 
    
    const { to, subject, html, text, from = process.env.MAIL_FROM } = body;

    // Basic validation
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and either html or text' },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      html: html,
      //text: text || html?.replace(/<[^>]*>?/gm, ''), // fallback plain text
      //replyTo: body.replyTo || from,
    };

    // Send in background for faster response (optional)
    // If you need guaranteed delivery, await it.
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}