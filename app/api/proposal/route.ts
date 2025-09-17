import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_TO,
      subject: `New Proposal Request: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #facc15; padding-bottom: 10px;">
            New Proposal Request
          </h2>
          
          <div style="background-color: #fbf8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #eccf4f; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #555;">${message.replace(
              /\n/g,
              "<br>"
            )}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              This proposal request was sent from WeTrainEducation website.
            </p>
          </div>
        </div>
      `,
      text: `
New Proposal Request

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This proposal request was sent from WeTrainEducation website.
      `,
    };

    // Send notification email to company
    await transporter.sendMail(mailOptions);

    // Send confirmation email to the sender
    const confirmationMailOptions = {
      from: `"WeTrainEducation" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Thank you for your proposal request - WeTrainEducation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">WeTrainEducation</h1>
            <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">Thank you for reaching out to us!</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: #fff;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}! 👋</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              We've successfully received your proposal request and wanted to let you know that it's now in our queue for review.
            </p>
            
            <!-- Request Details -->
            <div style="background-color: #fbf8f0; padding: 20px; border-radius: 8px; border-left: 4px solid #facc15; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 18px;">Your Request Details:</h3>
              <p style="color: #555; margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="color: #555; margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #555; margin: 8px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <!-- What's Next -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 18px;">What happens next?</h3>
              <ul style="color: #555; line-height: 1.6; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Our team will review your proposal request within 24-48 hours</li>
                <li style="margin-bottom: 8px;">We'll analyze your requirements and prepare a customized solution</li>
                <li style="margin-bottom: 8px;">You'll receive a detailed proposal via email</li>
                <li>We'll schedule a follow-up call to discuss your project in detail</li>
              </ul>
            </div>
            
            <!-- Contact Info -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #555; margin-bottom: 15px;">Need immediate assistance? Feel free to contact us:</p>
              <p style="color: #facc15; font-weight: bold; margin: 5px 0;">📧 support@wetraineducation.com</p>
              <p style="color: #555; margin: 5px 0;">🌐 www.wetraineducation.com</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px;">© 2025 WeTrainEducation. All rights reserved.</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
              You're receiving this because you submitted a proposal request on our website.
            </p>
          </div>
        </div>
      `,
      text: `
Hi ${name}!

Thank you for your proposal request!

We've successfully received your proposal request and wanted to let you know that it's now in our queue for review.

Your Request Details:
- Subject: ${subject}
- Email: ${email}
- Submitted: ${new Date().toLocaleString()}

What happens next?
1. Our team will review your proposal request within 24-48 hours
2. We'll analyze your requirements and prepare a customized solution
3. You'll receive a detailed proposal via email
4. We'll schedule a follow-up call to discuss your project in detail

Need immediate assistance?
Email: support@wetraineducation.com
Website: www.wetraineducation.com

Best regards,
WeTrainEducation Team

© 2025 WeTrainEducation. All rights reserved.
      `,
    };

    // Send confirmation email
    await transporter.sendMail(confirmationMailOptions);

    return NextResponse.json(
      {
        message:
          "Proposal request sent successfully and confirmation email sent",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send proposal request. Please try again." },
      { status: 500 }
    );
  }
}
