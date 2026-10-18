# Recruitment backend — fixes and deployment

## What was changed

- Public **POST /api/applications/submit** remains public and rate-limited (five attempts/IP/hour). No applicant login is required.
- Express now trusts **one proxy hop in production by default**, configurable via `TRUST_PROXY_HOPS`. This addresses Render's `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` and prevents Render's shared proxy IP from becoming the rate-limit key. Verify from distinct networks after deployment; incorrect hop counts can weaken limits.
- Kept the API-wide limiter (100 requests/IP/15 minutes) and removed redundant API rate limiter registrations on management routes.
- Resend **errors now throw** instead of being silently treated as success. Sending acceptance is logged by the Resend email ID; delivery to the recipient's mailbox is a separate step.
- `ADMIN_EMAIL` is now required to send administrator notifications. If it's missing or invalid, Render logs a clear error, while submitted applications remain saved.
- Email templates escape applicant data inserted into HTML. Portfolio links are normalized to HTTP(S) links.
- Missing optional portfolio links no longer cause a runtime error. CV uploads get cleaned up when validation fails.
- Private application listing, read, update, delete and statistics endpoints require an `X-Admin-Key` **server-side** header. If `ADMIN_API_KEY` is not set, these endpoints return 503 instead of exposing applicant details. **Never send this secret from a public browser-side application.** If an admin dashboard uses these endpoints, add server-side authentication/proxy support before enabling it.
- Admin email no longer includes broken dashboard links unless `ADMIN_DASHBOARD_URL` is set.

## Required Render environment configuration

Make sure `RESEND_API_KEY` belongs to the **same Resend team/workspace that verified `designandbuildhq.com`**. Also set:

| Variable | Value |
|---|---|
| `ADMIN_EMAIL` | A real, working inbox where notifications should arrive (for example your existing administrator's mailbox) |
| `RESEND_FROM_EMAIL` | `DesignandBuildHQ <info@designandbuildhq.com>` (or another sender on the verified domain) |
| `CORS_ORIGIN` | `https://recruit.designandbuildhq.com` |
| `TRUST_PROXY_HOPS` | `1` for a verified one-proxy setup on Render. Adjust only after verifying client IP detection. |
| `ADMIN_API_KEY` | Optional random secret of 32+ characters; without it management routes are disabled. |

Keep the existing `MONGODB_URI_PROD`, `CLOUDINARY_*` and `NODE_ENV=production` values. Other existing secrets must not be committed to GitHub.

**A verified Resend sending domain does not create a mailbox.** Ensure `ADMIN_EMAIL` actually receives mail at its provider. If using `info@designandbuildhq.com`, confirm its mailbox exists and that the domain's receiving MX records are set to its email provider. Resend's "Enable Receiving" is for receiving into Resend; it is not required for sending notifications to a third-party mailbox. Check Resend > Emails for accepted/delivered/bounced status.

## Apply from VS Code PowerShell (when VS Code is open at your backend repo root)

Download the fixed ZIP and place it in **Downloads**, then run:

```powershell
Expand-Archive -Path "$HOME\Downloads\DesignandbuildHQRecruitformbackend-fixed.zip" -DestinationPath "$env:TEMP\recruit-backend-patch" -Force
Copy-Item -Path "$env:TEMP\recruit-backend-patch\*" -Destination . -Recurse -Force
npm ci
npm test
git status
git add src package.json .gitignore .env.example FIX_AND_DEPLOY.md tests
git commit -m "Fix recruitment emails, proxy rate limits, and admin endpoint access"
git push origin HEAD
```

**Do not run this from another repository.** `Copy-Item` overwrites matching source files but leaves your existing `.git` and `.env` alone. Review `git status` before committing. Render should auto-deploy from GitHub if configured; otherwise deploy the current commit from Render. Render build command: `npm ci && npm run build`; start command: `npm start`.

## Test after deployment

1. Visit `https://recruit.designandbuildhq.com` and submit **one new email address** (duplicate submissions from the same email are rejected by the existing validation rule).
2. Confirm the form returns 201 and the applicant gets a confirmation.
3. Check **Render logs** for the Resend email IDs or a clear `Admin email failed` reason.
4. Check **Resend > Emails** for the admin recipient and its sending/delivery status, then check that mailbox. API accepted != delivered.
5. To verify rate-limit isolation, use Wi-Fi and cellular data and compare effective client IPs at the backend; don't expose test `/ip` diagnostics publicly long-term.
6. Administrative API: without `ADMIN_API_KEY`, `GET /api/applications` should return 503; with a valid key sent from an authorized server-side client, it should be accessible. Public submit remains available without a key.

## Remaining limitations

- CVs uploaded to Cloudinary in the original app use **public raw-file delivery**. These stored URLs may expose sensitive documents if discovered. Protecting historical and future CVs requires a separate authenticated/private storage migration and signed-download mechanism; this patch does **not** silently change Cloudinary delivery and break existing uploaded CVs.
- The built-in rate-limit store is **in-memory per Render instance** and resets when Render restarts. If you scale horizontally or require durable abuse prevention, use a shared Redis-backed limiter or managed bot mitigation.
- Email requests are sent synchronously after saving each application. A transient mail failure won't undo the saved application, but it also isn't automatically retried. Use a durable job queue/outbox to guarantee eventual notification and safe retries.
