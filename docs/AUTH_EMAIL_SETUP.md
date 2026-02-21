# 🔐 Email Auth Setup Guide

This guide walks you through configuring Supabase email authentication to work with your application's new auth flow handlers.

---

## ✅ Prerequisites

- Supabase production project accessible
- Admin access to Supabase Dashboard
- Production URL: `https://www.wetraineducation.com`
- Local development URL: `http://localhost:3000`

---

## 📋 Step 1: Configure Redirect URLs in Supabase

These URLs tell Supabase where to send users after they click email links.

### Go to Supabase Dashboard

1. Navigate to: **Authentication → URL Configuration**
2. Find the **Redirect URLs** section

### Add All Redirect URLs

Add each of these URLs to the **Redirect URLs** allowlist:

#### Production URLs (Primary)

```
https://www.wetraineducation.com/auth/callback
https://www.wetraineducation.com/auth/accept-invite
https://www.wetraineducation.com/auth/magic-link
https://www.wetraineducation.com/auth/verify-email-change
https://www.wetraineducation.com/auth/error
https://www.wetraineducation.com/set-password
https://www.wetraineducation.com/auth/reauthenticate
```

#### Development URLs (Optional - for local testing)

```
http://localhost:3000/auth/callback
http://localhost:3000/auth/accept-invite
http://localhost:3000/auth/magic-link
http://localhost:3000/auth/verify-email-change
http://localhost:3000/auth/error
http://localhost:3000/set-password
http://localhost:3000/auth/reauthenticate
```

### Set Site URL

In the same page, set the **Site URL**:

- **Production**: `https://www.wetraineducation.com`
- **Local**: `http://localhost:3000`

---

## 📧 Step 2: Update Email Templates

Now update each email template to use the correct redirect URLs.

Go to: **Authentication → Email Templates**

### 2.1 Invite User Template

**Subject**: `You've been invited to join WeTrainEducation`

**HTML Template**:
Copy the **HTML template** from [SUPABASE_EMAIL_TEMPLATES.md](./SUPABASE_EMAIL_TEMPLATES.md) → **Section 2: Invite User**

**Redirect URL Configuration**:

- Verify the template uses `{{ .ConfirmationURL }}` (already correct ✅)
- No custom redirect needed - Supabase will use `/auth/accept-invite` automatically

### 2.2 Magic Link Template

**Subject**: `Your sign-in link for WeTrainEducation`

**HTML Template**:
Copy the **HTML template** from [SUPABASE_EMAIL_TEMPLATES.md](./SUPABASE_EMAIL_TEMPLATES.md) → **Section 3: Magic Link**

**Redirect URL Configuration**:

- Template uses `{{ .ConfirmationURL }}` ✅
- Redirects to `/auth/magic-link`

### 2.3 Reset Password Template

**Subject**: `Reset your WeTrainEducation password`

**HTML Template**:
Copy the **HTML template** from [SUPABASE_EMAIL_TEMPLATES.md](./SUPABASE_EMAIL_TEMPLATES.md) → **Section 5: Reset Password**

**Redirect URL Configuration**:

- Template uses `{{ .ConfirmationURL }}` ✅
- Redirects to `/set-password`

### 2.4 Confirm Sign Up Template

**Subject**: `Confirm your WeTrainEducation account`

**HTML Template**:
Copy the **HTML template** from [SUPABASE_EMAIL_TEMPLATES.md](./SUPABASE_EMAIL_TEMPLATES.md) → **Section 1: Confirm Sign Up**

**Redirect URL Configuration**:

- Template uses `{{ .ConfirmationURL }}` ✅
- Redirects to `/auth/callback`

### 2.5 Change Email Template

**Subject**: `Confirm your email change`

**HTML Template**:
Copy the **HTML template** from [SUPABASE_EMAIL_TEMPLATES.md](./SUPABASE_EMAIL_TEMPLATES.md) → **Section 4: Change Email Address**

**Redirect URL Configuration**:

- Template uses `{{ .ConfirmationURL }}` ✅
- Redirects to `/auth/verify-email-change`

### 2.6 Reauthentication Template (Optional)

**Subject**: `Confirm your identity`

**HTML Template**:
Copy the **HTML template** from [SUPABASE_EMAIL_TEMPLATES.md](./SUPABASE_EMAIL_TEMPLATES.md) → **Section 6: Reauthentication**

**Redirect URL Configuration**:

- Template uses `{{ .ConfirmationURL }}` ✅
- Redirects to `/auth/reauthenticate`

---

## 🧪 Step 3: Test Each Flow

### Test Invite User (Primary Admin Function)

**How It Works:**
When an admin creates a new user from `/dashboard/crm/admin/users`:

1. The app calls `supabase.auth.admin.inviteUserByEmail(email, { redirectTo: '/auth/accept-invite' })`
2. Supabase creates an unconfirmed user and sends an invite email
3. The email contains a link with the redirect URL: `/auth/accept-invite`
4. User clicks the link and lands on the invite acceptance page
5. User sets their password (this confirms their account)
6. User is redirected to `/dashboard`

**Testing Steps:**

1. Go to **Dashboard → CRM → Admin → Users**
2. Click **Invite User** button
3. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Role: `Marketer`
4. Click **Send Invite**
5. **Expected Result**:
   - Success toast: "Invite sent successfully! User will receive an email to set their password."
   - Check email inbox for branded invite
   - Click **Accept Invitation** button in email
   - Should land on `/auth/accept-invite`
   - Shows password setup form
   - After setting password → redirected to `/dashboard`

**Common Issues:**

- **Lands on homepage with token in URL**: Redirect URL not in Supabase allowlist (see Step 1)
- **Error: "This link has expired"**: Invite links expire after 24 hours by default
- **Error: "This link has already been used"**: User already accepted the invite
- **No email received**: Check spam folder, verify SMTP settings in Supabase

### Test Magic Link (Optional)

If you implement magic link login in your app:

1. From login page, add "Sign in with magic link" option
2. User enters email → call `supabase.auth.signInWithOtp({email, options: {emailRedirectTo: '/auth/magic-link'}})`
3. Click link in email
4. **Expected Result**:
   - Redirects to `/auth/magic-link`
   - Auto-signed in
   - Redirected to `/dashboard`

### Test Password Reset

1. Go to login page: `/login`
2. Click **Forgot Password**
3. Enter registered email
4. Click reset link in email
5. **Expected Result**:
   - Redirects to `/set-password`
   - User can set new password
   - Redirected to `/dashboard` after success

### Test Signup Confirmation

1. Go to register page: `/register`
2. Sign up with new email
3. Click confirmation link in email
4. **Expected Result**:
   - Redirects to `/auth/callback`
   - Auto-creates profile
   - Redirected to `/dashboard`

### Test Email Change

1. Go to profile/settings page
2. Change email address
3. Check new email inbox
4. Click confirmation link
5. **Expected Result**:
   - Redirects to `/auth/verify-email-change`
   - Shows "Email updated!" message
   - Redirected to `/dashboard`

---

## 🛠️ Troubleshooting

### Issue: "Invalid redirect URL" error

**Solution**: Verify all URLs are added to **Redirect URLs** allowlist in Supabase Dashboard.

### Issue: Email link redirects to homepage with token in URL

**Cause**: The redirect URL is not in the allowlist, so Supabase defaults to Site URL.

**Solution**: Add the specific route to Redirect URLs (e.g., `/auth/accept-invite`).

### Issue: "Token expired" error

**Cause**: User clicked the link after expiration time (default 1 hour for most flows, 24 hours for confirmation).

**Error shown**:

```
This link has expired. Please request a new one.
```

**Solution**: Request a new link. Tokens expire for security. Each email flow has built-in error handling:

- **Invite**: Click "Back to Login" and request a new invite
- **Magic Link**: Click "Request New Magic Link"
- **Password Reset**: Click "Back to Login" and use "Forgot Password" again
- **Email Change**: Go back to profile settings and request email change again

### Issue: "This email link has already been used"

**Cause**: The token can only be used once for security.

**Error shown**:

```
This link has already been used. Please request a new one.
```

**Solution**: Request a new link. Email links are single-use for security.

### Issue: User lands on correct page but sees error

**Possible Causes**:

- Token already used (can only be used once)
- Session not created properly
- Network/firewall blocking Supabase requests
- Link expired before user clicked it

**Solution**:

1. Check browser console (F12 → Console tab) for detailed errors
2. Verify Supabase credentials are correct in `.env.local`
3. Try requesting a new link
4. Check that Supabase project is active and accessible

### Issue: Email template variables not working

**Cause**: Using incorrect variable names.

**Solution**: All email links should use `{{ .ConfirmationURL }}` (not `{{ .InviteLink }}` or `{{ .MagicLink }}`).

### Issue: Errors redirecting to homepage instead of error page

**Possible Causes**:

- Redirect URL not in allowlist - Supabase defaults to Site URL (homepage)
- Link generated before redirect URLs were configured

**Solution**:

1. Verify all 6 redirect URLs are in Supabase Dashboard → Authentication → URL Configuration
2. Regenerate the email link (for invites, request a new invite)
3. If you see `#error=access_denied&error_code=otp_expired`, you can manually navigate to `/auth/error` to see the error message

### Error Codes Reference

These error codes appear in the URL hash (e.g., `#error_code=otp_expired`):

| Code               | Meaning                   | Action                  |
| ------------------ | ------------------------- | ----------------------- |
| `otp_expired`      | Email link expired        | Request a new link      |
| `otp_already_used` | Link already used         | Request a new link      |
| `invalid_otp`      | Invalid or malformed link | Check URL and try again |
| `user_not_found`   | Email not registered      | Sign up first           |
| `access_denied`    | General access error      | Contact support         |
| `server_error`     | Supabase server error     | Try again later         |

---

## 📚 References

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Email Template Variables Table](./SUPABASE_EMAIL_TEMPLATES.md#-email-template-variables)
- [Auth Config File](../lib/supabase/auth-config.ts)
- [Auth Handlers Utility](../lib/supabase/auth-handlers.ts)

---

## 🎯 Summary Checklist

- [ ] Added all 7 redirect URLs to Supabase Dashboard (including `/auth/error`)
- [ ] Set Site URL to production domain
- [ ] Updated Invite User email template
- [ ] Updated Magic Link email template (if using)
- [ ] Updated Reset Password email template
- [ ] Updated Confirm Sign Up email template
- [ ] Updated Change Email template
- [ ] Updated Reauthentication template (optional)
- [ ] Tested invite flow end-to-end
- [ ] Tested password reset flow
- [ ] Tested signup confirmation
- [ ] Tested error handling (expired link, etc.)
- [ ] Verified all templates use `{{ .ConfirmationURL }}`
- [ ] No errors in browser console during auth flows
- [ ] Error messages display properly on expired links

---

**All done!** Your email authentication flows are now properly configured with error handling. Users will have a seamless experience when clicking links from emails, and clear error messages if something goes wrong.
