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
https://www.wetraineducation.com/set-password
https://www.wetraineducation.com/auth/reauthenticate
```

#### Development URLs (Optional - for local testing)

```
http://localhost:3000/auth/callback
http://localhost:3000/auth/accept-invite
http://localhost:3000/auth/magic-link
http://localhost:3000/auth/verify-email-change
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

### Test Invite User

1. Go to **Authentication → Users** in Supabase Dashboard
2. Click **Invite User**
3. Enter test email: `test@example.com`
4. Click **Send Invite**
5. **Expected Result**:
   - Email received with branded template
   - Clicking button/link redirects to `/auth/accept-invite`
   - User can set password
   - Redirected to `/dashboard` after success

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

**Cause**: User clicked the link after expiration time (default 1 hour).

**Solution**: Request a new link. Tokens expire for security.

### Issue: User lands on correct page but sees error

**Possible Causes**:

- Token already used (can only be used once)
- Session not created properly
- Network/firewall blocking Supabase requests

**Solution**: Check browser console for errors, verify Supabase credentials are correct.

### Issue: Email template variables not working

**Cause**: Using incorrect variable names.

**Solution**: All email links should use `{{ .ConfirmationURL }}` (not `{{ .InviteLink }}` or `{{ .MagicLink }}`).

---

## 📚 References

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Email Template Variables Table](./SUPABASE_EMAIL_TEMPLATES.md#-email-template-variables)
- [Auth Config File](../lib/supabase/auth-config.ts)
- [Auth Handlers Utility](../lib/supabase/auth-handlers.ts)

---

## 🎯 Summary Checklist

- [ ] Added all 6 redirect URLs to Supabase Dashboard
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
- [ ] Verified all templates use `{{ .ConfirmationURL }}`
- [ ] No errors in browser console during auth flows

---

**All done!** Your email authentication flows are now properly configured. Users will have a seamless experience when clicking links from emails.
