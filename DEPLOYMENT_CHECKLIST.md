# MiYo Studio Deployment Checklist

## Cloudflare Resources

| Resource | Name |
|---|---|
| Cloudflare Pages project | `miyo-download` |
| Cloudflare Pages URL | `https://miyo-download.pages.dev` |
| D1 database | `miyo-studio` |
| Media mode | Static Pages assets |
| R2 | Disabled |
| Cloudflare Access | Disabled |
| Admin auth | Application-managed session cookie |

## Configuration

- [ ] `wrangler.toml` has `pages_build_output_dir = "dist"`.
- [ ] The D1 binding is `DB`.
- [ ] The D1 database name is `miyo-studio`.
- [ ] The D1 database ID is `7c7575cb-9b3d-41f6-8d63-e07201cb0a6c` (non-placeholder).
- [ ] No `ACCESS_TEAM_DOMAIN` or `ACCESS_AUD` variable is required.
- [ ] `MEDIA_KV` binding exists with the real namespace ID `36a5471eb68f4f6a9bed46c970eaccbb`.
- [ ] GIF upload limit is 8 MiB and MP4 upload limit is 20 MiB.
- [ ] D1 stores media metadata and object keys; KV stores binary media.
- [ ] R2 remains disabled.
- [ ] No test media files (e.g. `production-test.gif`) remain in the bundle.

## Database and Admin Setup

- [ ] Review `migrations/0002_create_admin_auth.sql`.
- [ ] Apply remote migrations: `npm run db:migrate:remote`.
- [ ] Verify `admins`, `admin_sessions`, and `admin_login_attempts` exist.
- [ ] Create the first administrator with `MIYO_ADMIN_PASSWORD` and `npm run admin:create -- --email admin@example.com`.
- [ ] Clear `MIYO_ADMIN_PASSWORD` immediately after the command.

## Authentication

- [ ] Anonymous `/admin` navigation redirects to `/admin/login`.
- [ ] Anonymous admin API requests return `401`.
- [ ] Invalid credentials return only `401 Invalid email or password`.
- [ ] Valid login sets `miyo_admin_session` with `HttpOnly`, `Secure`, and `SameSite=Lax`.
- [ ] `GET /api/admin/session` returns the current authenticated email.
- [ ] Admin write requests reject missing or cross-origin `Origin` headers.
- [ ] Logout deletes the D1 session and clears the cookie.

## Media

- [ ] `MEDIA_KV` is bound to the namespace ID recorded in `wrangler.toml`.
- [ ] Draft creation succeeds before media upload is enabled.
- [ ] GIF upload validates `.gif`, `image/gif`, GIF magic bytes, and 8 MiB maximum.
- [ ] MP4 upload validates `.mp4`, `video/mp4`, `ftyp`, and 20 MiB maximum.
- [ ] Replace writes a new key, updates D1, then deletes the old key.
- [ ] Remove deletes only the animation's referenced key and clears D1 metadata.
- [ ] Public preview is inline at `/api/media?key=...`; downloads use attachment responses.


- [ ] `GET /api/animations` works without authentication.
- [ ] `GET /api/animations/featured` works without authentication.
- [ ] `npm run cf:config:check` passes.
- [ ] `npm run build` passes.
- [ ] `npx wrangler pages functions build` passes.
- [ ] No deployment or `git push` command is run without explicit approval.
