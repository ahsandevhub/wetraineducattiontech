# 📧 Supabase Email Templates

This guide provides Supabase-compatible email templates that match WeTrainEducation's brand style (yellow/gold accent, professional design).

All templates use HTML and plain text versions for maximum compatibility.

---

## 🔧 How to Set Up Templates

1. **Go to Supabase Dashboard**
   - Select your production project
   - Navigate to: **Authentication → Email Templates**

2. **For each template type:**
   - Click the template name (e.g., "Confirm sign up")
   - Click **"Edit template"**
   - Replace the content with the template provided below
   - **Enable the template** if it's disabled

3. **Test**
   - Send a test email to verify formatting

---

## ✉️ Email Template Variables

Each template type supports specific variables:

| Variable                 | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `{{ .ConfirmationURL }}` | Confirmation/action link (all authentication templates) |
| `{{ .Email }}`           | User's email address                                    |
| `{{ .TokenHash }}`       | Reset password token                                    |
| `{{ .SiteURL }}`         | Your app's site URL                                     |
| `{{ .AdminEmail }}`      | Support email (custom, not built-in)                    |
| `{{ .Token }}`           | Raw token (for custom URLs)                             |

---

## 1️⃣ Confirm Sign Up

**Purpose:** Ask users to confirm their email address after signing up.

### HTML Template

```html
<div
  style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"
>
  <!-- Header -->
  <div
    style="background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;"
  >
    <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">
      WeTrainEducation
    </h1>
    <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">
      Confirm Your Email Address
    </p>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px 20px; background-color: #fff;">
    <h2 style="color: #333; margin-bottom: 20px;">
      Welcome to WeTrainEducation! 🎉
    </h2>

    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Thank you for signing up! We're excited to have you on board.
    </p>

    <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
      To complete your registration, please confirm your email address by
      clicking the button below:
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a
        href="{{ .ConfirmationURL }}"
        style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); color: #333; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(250, 204, 21, 0.3);"
      >
        Confirm Email Address
      </a>
    </div>

    <!-- Alternative Link -->
    <div
      style="background-color: #fbf8f0; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #facc15;"
    >
      <p style="color: #666; font-size: 13px; margin: 0;">
        If the button above doesn't work, copy and paste this link into your
        browser:<br />
        <a
          href="{{ .ConfirmationURL }}"
          style="color: #facc15; word-break: break-all;"
          >{{ .ConfirmationURL }}</a
        >
      </p>
    </div>

    <!-- Important Note -->
    <div
      style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;"
    >
      <p style="color: #555; margin: 0; font-size: 14px;">
        <strong>⏰ Note:</strong> This link will expire in 24 hours. If you
        didn't create this account, please ignore this email.
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div
    style="background-color: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;"
  >
    <p style="margin: 0; font-size: 14px;">
      © 2026 WeTrainEducation & Tech OPC. All rights reserved.
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
      Questions? Email us at
      <a
        href="mailto:support@wetraineducation.com"
        style="color: #facc15; text-decoration: none;"
        >support@wetraineducation.com</a
      >
    </p>
  </div>
</div>
```

### Plain Text Template

```
Welcome to WeTrainEducation! 🎉

Thank you for signing up! We're excited to have you on board.

To complete your registration, please confirm your email address by clicking the link below:

{{ .ConfirmationURL }}

---

⏰ Note: This link will expire in 24 hours. If you didn't create this account, please ignore this email.

Questions? Email us at support@wetraineducation.com

© 2026 WeTrainEducation & Tech OPC. All rights reserved.
```

---

## 2️⃣ Invite User

**Purpose:** Invite users who don't yet have an account to sign up.

### HTML Template

```html
<div
  style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"
>
  <!-- Header -->
  <div
    style="background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;"
  >
    <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">
      WeTrainEducation
    </h1>
    <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">
      You're Invited!
    </p>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px 20px; background-color: #fff;">
    <h2 style="color: #333; margin-bottom: 20px;">
      You've been invited to join WeTrainEducation! 👋
    </h2>

    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Someone from our team thought you'd be a great fit for WeTrainEducation.
      Join us today and start collaborating!
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a
        href="{{ .ConfirmationURL }}"
        style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); color: #333; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(250, 204, 21, 0.3);"
      >
        Accept Invitation
      </a>
    </div>

    <!-- What to Expect -->
    <div
      style="background-color: #fbf8f0; padding: 20px; border-radius: 8px; border-left: 4px solid #facc15; margin: 20px 0;"
    >
      <h3 style="color: #333; margin-top: 0; font-size: 16px;">
        What to expect:
      </h3>
      <ul style="color: #555; line-height: 1.8; padding-left: 20px; margin: 0;">
        <li>Set up your account in just a few minutes</li>
        <li>Access to our full platform and resources</li>
        <li>Expert guidance and support from our team</li>
        <li>Join a community of like-minded professionals</li>
      </ul>
    </div>

    <!-- Alternative Link -->
    <div
      style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;"
    >
      <p style="color: #666; font-size: 13px; margin: 0;">
        If the button above doesn't work, copy and paste this link:<br />
        <a
          href="{{ .ConfirmationURL }}"
          style="color: #facc15; word-break: break-all;"
          >{{ .ConfirmationURL }}</a
        >
      </p>
    </div>

    <!-- Expiry Notice -->
    <p style="color: #999; font-size: 13px; margin-top: 20px;">
      ⏰ This invitation link will expire in 7 days.
    </p>
  </div>

  <!-- Footer -->
  <div
    style="background-color: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;"
  >
    <p style="margin: 0; font-size: 14px;">
      © 2026 WeTrainEducation & Tech OPC. All rights reserved.
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
      Questions? Email us at
      <a
        href="mailto:support@wetraineducation.com"
        style="color: #facc15; text-decoration: none;"
        >support@wetraineducation.com</a
      >
    </p>
  </div>
</div>
```

### Plain Text Template

```
You've been invited to join WeTrainEducation! 👋

Someone from our team thought you'd be a great fit for WeTrainEducation. Join us today and start collaborating!

Accept your invitation here:
{{ .ConfirmationURL }}

What to expect:
- Set up your account in just a few minutes
- Access to our full platform and resources
- Expert guidance and support from our team
- Join a community of like-minded professionals

---

⏰ This invitation link will expire in 7 days.

Questions? Email us at support@wetraineducation.com

© 2026 WeTrainEducation & Tech OPC. All rights reserved.
```

---

## 3️⃣ Magic Link (Sign In)

**Purpose:** Allow users to sign in via a one-time link sent to their email.

### HTML Template

```html
<div
  style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"
>
  <!-- Header -->
  <div
    style="background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;"
  >
    <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">
      WeTrainEducation
    </h1>
    <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">
      Your Sign-In Link
    </p>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px 20px; background-color: #fff;">
    <h2 style="color: #333; margin-bottom: 20px;">
      Sign in securely with this magic link ✨
    </h2>

    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Click the button below to sign in to your WeTrainEducation account. No
      password needed!
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a
        href="{{ .ConfirmationURL }}"
        style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); color: #333; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(250, 204, 21, 0.3);"
      >
        Sign In to Your Account
      </a>
    </div>

    <!-- Alternative Link -->
    <div
      style="background-color: #fbf8f0; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #facc15;"
    >
      <p style="color: #666; font-size: 13px; margin: 0;">
        If the button above doesn't work, copy and paste this link:<br />
        <a
          href="{{ .ConfirmationURL }}"
          style="color: #facc15; word-break: break-all;"
          >{{ .ConfirmationURL }}</a
        >
      </p>
    </div>

    <!-- Security Notice -->
    <div
      style="background-color: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4caf50;"
    >
      <p style="color: #2e7d32; margin: 0; font-size: 14px;">
        <strong>🔒 Security:</strong> Never share this link with anyone. It's
        unique to you and will expire in 24 hours.
      </p>
    </div>

    <!-- Didn't Request? -->
    <div
      style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;"
    >
      <p style="color: #555; margin: 0; font-size: 14px;">
        <strong>Didn't request this email?</strong> You can safely ignore it.
        This link will expire automatically.
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div
    style="background-color: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;"
  >
    <p style="margin: 0; font-size: 14px;">
      © 2026 WeTrainEducation & Tech OPC. All rights reserved.
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
      Questions? Email us at
      <a
        href="mailto:support@wetraineducation.com"
        style="color: #facc15; text-decoration: none;"
        >support@wetraineducation.com</a
      >
    </p>
  </div>
</div>
```

### Plain Text Template

```
Sign in securely with this magic link ✨

Click the link below to sign in to your WeTrainEducation account. No password needed!

{{ .ConfirmationURL }}

---

🔒 Security: Never share this link with anyone. It's unique to you and will expire in 24 hours.

Didn't request this email? You can safely ignore it. This link will expire automatically.

© 2026 WeTrainEducation & Tech OPC. All rights reserved.
```

---

## 4️⃣ Change Email Address

**Purpose:** Ask users to verify their new email address after changing it.

### HTML Template

```html
<div
  style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"
>
  <!-- Header -->
  <div
    style="background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;"
  >
    <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">
      WeTrainEducation
    </h1>
    <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">
      Verify Your New Email Address
    </p>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px 20px; background-color: #fff;">
    <h2 style="color: #333; margin-bottom: 20px;">
      Confirm your email change 📧
    </h2>

    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      We received a request to change the email address on your WeTrainEducation
      account. To complete this change, please verify your new email address by
      clicking the button below:
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a
        href="{{ .ConfirmationURL }}"
        style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); color: #333; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(250, 204, 21, 0.3);"
      >
        Verify New Email
      </a>
    </div>

    <!-- Account Info Box -->
    <div
      style="background-color: #fbf8f0; padding: 20px; border-radius: 8px; border-left: 4px solid #facc15; margin: 20px 0;"
    >
      <p style="color: #666; margin: 0;">
        <strong>New email address:</strong><br />
        {{ .Email }}
      </p>
    </div>

    <!-- Alternative Link -->
    <div
      style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;"
    >
      <p style="color: #666; font-size: 13px; margin: 0;">
        If the button above doesn't work, copy and paste this link:<br />
        <a
          href="{{ .ConfirmationURL }}"
          style="color: #facc15; word-break: break-all;"
          >{{ .ConfirmationURL }}</a
        >
      </p>
    </div>

    <!-- Security Notice -->
    <div
      style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;"
    >
      <p style="color: #555; margin: 0; font-size: 14px;">
        <strong>Security:</strong> If you didn't request this change, please
        <a
          href="mailto:support@wetraineducation.com"
          style="color: #ff9800; font-weight: bold;"
          >contact our support team</a
        >
        immediately.
      </p>
    </div>

    <p style="color: #999; font-size: 13px; margin-top: 20px;">
      ⏰ This link will expire in 24 hours.
    </p>
  </div>

  <!-- Footer -->
  <div
    style="background-color: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;"
  >
    <p style="margin: 0; font-size: 14px;">
      © 2026 WeTrainEducation & Tech OPC. All rights reserved.
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
      Questions? Email us at
      <a
        href="mailto:support@wetraineducation.com"
        style="color: #facc15; text-decoration: none;"
        >support@wetraineducation.com</a
      >
    </p>
  </div>
</div>
```

### Plain Text Template

```
Confirm your email change 📧

We received a request to change the email address on your WeTrainEducation account. To complete this change, please verify your new email address by clicking the link below:

{{ .ConfirmationURL }}

New email address:
{{ .Email }}

---

Security: If you didn't request this change, please contact our support team immediately at support@wetraineducation.com

⏰ This link will expire in 24 hours.

© 2026 WeTrainEducation & Tech OPC. All rights reserved.
```

---

## 5️⃣ Reset Password

**Purpose:** Allow users to reset their password if they forget it.

### HTML Template

```html
<div
  style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"
>
  <!-- Header -->
  <div
    style="background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;"
  >
    <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">
      WeTrainEducation
    </h1>
    <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">
      Reset Your Password
    </p>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px 20px; background-color: #fff;">
    <h2 style="color: #333; margin-bottom: 20px;">
      Password reset request received 🔐
    </h2>

    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      We received a request to reset your password. Click the button below to
      create a new password for your WeTrainEducation account.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a
        href="{{ .ConfirmationURL }}"
        style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); color: #333; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(250, 204, 21, 0.3);"
      >
        Reset Your Password
      </a>
    </div>

    <!-- Alternative Link -->
    <div
      style="background-color: #fbf8f0; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #facc15;"
    >
      <p style="color: #666; font-size: 13px; margin: 0;">
        If the button above doesn't work, copy and paste this link:<br />
        <a
          href="{{ .ConfirmationURL }}"
          style="color: #facc15; word-break: break-all;"
          >{{ .ConfirmationURL }}</a
        >
      </p>
    </div>

    <!-- Instructions -->
    <div
      style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 20px 0;"
    >
      <h3 style="color: #1565c0; margin-top: 0; font-size: 16px;">
        What happens next:
      </h3>
      <ol style="color: #555; line-height: 1.8; padding-left: 20px; margin: 0;">
        <li>Click the button above to reset your password</li>
        <li>Create a new, strong password</li>
        <li>Sign in with your new password</li>
      </ol>
    </div>

    <!-- Security Notice -->
    <div
      style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;"
    >
      <p style="color: #555; margin: 0; font-size: 14px;">
        <strong>⚠️ Didn't request this?</strong> If you didn't request a
        password reset, you can safely ignore this email. Your account is
        secure.
      </p>
    </div>

    <p style="color: #999; font-size: 13px; margin-top: 20px;">
      ⏰ For security, this link will expire in 1 hour.
    </p>
  </div>

  <!-- Footer -->
  <div
    style="background-color: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;"
  >
    <p style="margin: 0; font-size: 14px;">
      © 2026 WeTrainEducation & Tech OPC. All rights reserved.
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
      Questions? Email us at
      <a
        href="mailto:support@wetraineducation.com"
        style="color: #facc15; text-decoration: none;"
        >support@wetraineducation.com</a
      >
    </p>
  </div>
</div>
```

### Plain Text Template

```
Password reset request received 🔐

We received a request to reset your password. Click the link below to create a new password for your WeTrainEducation account.

{{ .ConfirmationURL }}

What happens next:
1. Click the link above to reset your password
2. Create a new, strong password
3. Sign in with your new password

---

⚠️ Didn't request this? If you didn't request a password reset, you can safely ignore this email. Your account is secure.

⏰ For security, this link will expire in 1 hour.

© 2026 WeTrainEducation & Tech OPC. All rights reserved.
```

---

## 6️⃣ Reauthentication

**Purpose:** Ask users to re-authenticate before performing a sensitive action.

### HTML Template

```html
<div
  style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"
>
  <!-- Header -->
  <div
    style="background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;"
  >
    <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">
      WeTrainEducation
    </h1>
    <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">
      Security Verification Required
    </p>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px 20px; background-color: #fff;">
    <h2 style="color: #333; margin-bottom: 20px;">
      Please verify your identity 🔒
    </h2>

    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      To protect your account and complete a sensitive action, we need you to
      verify your identity. Click the button below to continue:
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a
        href="{{ .ConfirmationURL }}"
        style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #eccf4f 100%); color: #333; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(250, 204, 21, 0.3);"
      >
        Verify Your Identity
      </a>
    </div>

    <!-- Sensitive Actions -->
    <div
      style="background-color: #fbf8f0; padding: 20px; border-radius: 8px; border-left: 4px solid #facc15; margin: 20px 0;"
    >
      <h3 style="color: #333; margin-top: 0; font-size: 16px;">
        This verification is needed for:
      </h3>
      <ul style="color: #555; line-height: 1.8; padding-left: 20px; margin: 0;">
        <li>Changing your email address</li>
        <li>Changing your password</li>
        <li>Updating sensitive account settings</li>
        <li>Managing team permissions</li>
      </ul>
    </div>

    <!-- Alternative Link -->
    <div
      style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;"
    >
      <p style="color: #666; font-size: 13px; margin: 0;">
        If the button above doesn't work, copy and paste this link:<br />
        <a
          href="{{ .ConfirmationURL }}"
          style="color: #facc15; word-break: break-all;"
          >{{ .ConfirmationURL }}</a
        >
      </p>
    </div>

    <!-- Security Notice -->
    <div
      style="background-color: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4caf50;"
    >
      <p style="color: #2e7d32; margin: 0; font-size: 14px;">
        <strong>🔐 Security Tip:</strong> We'll never ask for your password via
        email. Always verify actions in your account settings.
      </p>
    </div>

    <!-- Didn't Request? -->
    <div
      style="background-color: #ffebee; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #d32f2f;"
    >
      <p style="color: #c62828; margin: 0; font-size: 14px;">
        <strong>Didn't request this?</strong> If you didn't initiate this
        action, someone may have tried to access your account.
        <a
          href="mailto:support@wetraineducation.com"
          style="color: #d32f2f; font-weight: bold;"
          >Contact support immediately</a
        >.
      </p>
    </div>

    <p style="color: #999; font-size: 13px; margin-top: 20px;">
      ⏰ This link will expire in 15 minutes.
    </p>
  </div>

  <!-- Footer -->
  <div
    style="background-color: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;"
  >
    <p style="margin: 0; font-size: 14px;">
      © 2026 WeTrainEducation & Tech OPC. All rights reserved.
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
      Questions? Email us at
      <a
        href="mailto:support@wetraineducation.com"
        style="color: #facc15; text-decoration: none;"
        >support@wetraineducation.com</a
      >
    </p>
  </div>
</div>
```

### Plain Text Template

```
Please verify your identity 🔒

To protect your account and complete a sensitive action, we need you to verify your identity. Click the link below to continue:

{{ .ConfirmationURL }}

This verification is needed for:
- Changing your email address
- Changing your password
- Updating sensitive account settings
- Managing team permissions

---

🔐 Security Tip: We'll never ask for your password via email. Always verify actions in your account settings.

Didn't request this? If you didn't initiate this action, someone may have tried to access your account. Contact support immediately at support@wetraineducation.com

⏰ This link will expire in 15 minutes.

© 2026 WeTrainEducation & Tech OPC. All rights reserved.
```

---

## 🚀 Setup Checklist

- [ ] **Confirm Sign Up** - HTML and text templates saved
- [ ] **Invite User** - HTML and text templates saved
- [ ] **Magic Link** - HTML and text templates saved
- [ ] **Change Email** - HTML and text templates saved
- [ ] **Reset Password** - HTML and text templates saved
- [ ] **Reauthentication** - HTML and text templates saved
- [ ] All templates enabled in Supabase
- [ ] Sent test emails to verify formatting
- [ ] Links in emails correctly point to your app domain
- [ ] Company email (support@wetraineducation.com) is correct

---

## 📌 Brand Colors Reference

- **Primary Gold/Yellow**: `#facc15`
- **Accent Yellow**: `#eccf4f`
- **Dark Text**: `#333`
- **Body Text**: `#555`
- **Light Background**: `#fbf8f0`
- **Dark Footer**: `#333`
- **Warning/Info**: `#fff3cd`, `#e3f2fd`
- **Success**: `#e8f5e9`
- **Error**: `#ffebee`

---

## 🔗 Additional Resources

- [Supabase Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Environment Variables](https://supabase.com/docs/guides/local-development#link-your-project)
- [Email Best Practices](https://supabase.com/docs/guides/auth/auth-smtp)
