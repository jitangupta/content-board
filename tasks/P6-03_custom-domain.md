# P6-03: Custom Domain + Cloudflare

> **Phase:** 6 — Polish & Deploy
> **Branch:** `feature/custom-domain`
> **Depends on:** P6-02 (CI/CD — needs Firebase Hosting deployed first)
> **Status:** [ ] Not started

## Objective

Configure `content.jitangupta.com` as the custom domain via Cloudflare DNS pointing to Firebase Hosting. After this task, the app is live at the custom domain with DDoS protection.

## Steps

1. **Firebase Hosting custom domain setup:**
   - Firebase Console → Hosting → Add custom domain
   - Enter: `content.jitangupta.com`
   - Firebase provides TXT verification record and CNAME target

2. **Cloudflare DNS configuration:**
   - Add TXT record for domain verification
   - Add CNAME record: `content` → Firebase Hosting URL
   - Set proxy status: Proxied (orange cloud)
   - Wait for DNS propagation + SSL provisioning

3. **Cloudflare SSL settings:**
   - SSL/TLS mode: Full (strict)
   - Always Use HTTPS: On
   - Automatic HTTPS Rewrites: On

4. **Cloudflare security settings:**
   - Bot Fight Mode: On
   - Browser Integrity Check: On
   - Under Attack Mode: Off (toggle on only if under active attack)

5. **Verify:**
   - `https://content.jitangupta.com` loads the app
   - SSL certificate is valid (Cloudflare edge cert)
   - HTTP redirects to HTTPS
   - Firebase Hosting direct URL still works as fallback

## Acceptance Criteria

- [ ] `content.jitangupta.com` loads the app over HTTPS
- [ ] SSL certificate is valid
- [ ] HTTP redirects to HTTPS
- [ ] Cloudflare proxy is active (orange cloud)
- [ ] Bot Fight Mode is enabled
- [ ] Firebase Hosting direct URL still works

## Notes

This task is mostly manual configuration (console work, not code). Document the exact Cloudflare settings for reference.

## Files Created / Modified

- No code changes — configuration only
- Document settings in this file for future reference
