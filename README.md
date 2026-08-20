# MiYo Studio

MiYo Studio is a Vite + React animation download platform with a Cloudflare Pages Functions admin backend.

## Production Infrastructure

| Resource | Name |
|---|---|
| Cloudflare Pages project | `miyo-download` |
| Production URL | `https://miyo-download.pages.dev` |
| D1 database | `miyo-studio` |
| Media mode | Workers KV uploads; legacy static Pages assets |
| Cloudflare Access | Disabled |

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- Wrangler for local D1 development (`npm install -g wrangler` or `npx wrangler`)

## Local development

```bash
npm install
npm run dev
```

The public app runs at `http://localhost:5174`. The `/admin` route uses the application login at `/admin/login` and a D1-backed HttpOnly session cookie when using Pages preview. R2 and Cloudflare Access are disabled in the current static media mode.

## Cloudflare setup

1. Create a Pages project named `miyo-download` in the Cloudflare dashboard.
2. Create a D1 database named `miyo-studio` and note its ID.
3. Update `wrangler.toml` with the D1 database ID and apply migrations with `npm run db:migrate:remote`.
4. Build and preview Pages Functions with `npm run pages:dev`.
5. Create the first administrator with `MIYO_ADMIN_PASSWORD` and `npm run admin:create -- --email admin@example.com`.

To deploy, run:

```bash
npm run build
npx wrangler pages deploy dist --project-name miyo-download
```

To view production logs:

```bash
npx wrangler pages deployment tail --project-name miyo-download --environment production --status error
```

The production runtime uses Workers KV for uploaded GIF and MP4 media. Legacy static Pages assets remain available for bundled Hero and website assets only.

## Animation metadata

Admin entries require a title, category, character color, valid content scale, and at least one media object before publishing. Legacy static paths remain supported for bundled assets; new Admin uploads use Workers KV. The existing `miyoCharacters.js` screen calibration remains static and is not editable from Admin.

## Runtime media uploads

`MEDIA_KV` stores uploaded GIF and MP4 binaries; D1 stores animation metadata and the corresponding object keys. GIF uploads are limited to 8 MiB and MP4 uploads to 20 MiB. The server validates extension, declared MIME type, and GIF87a/GIF89a or ISO BMFF `ftyp` magic bytes. R2 is disabled and no payment method is required.

Administrators save a draft first, then upload or replace media from the Admin workspace. Preview URLs use `/api/media?key=...`; downloads use `/api/download?key=...&filename=...`. Replacements use a new UUID key and update D1 before deleting the previous KV object. Failed D1 updates immediately delete the newly uploaded object. A future orphan cleanup job may reconcile unusual interrupted writes.
Legacy static asset workflow

Bundled website media under `public/assets/animations/library/` remains supported for Hero and other legacy assets. New animation media should be uploaded from Admin and does not require a rebuild.
