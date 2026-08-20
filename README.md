# MiYo Studio

MiYo Studio is a Vite + React animation download platform with a Cloudflare Pages Functions admin backend.

## Production Infrastructure

| Resource | Name |
|---|---|
| Cloudflare Pages project | `miyo-download` |
| Production URL | `https://miyo-download.pages.dev` |
| D1 database | `miyo-studio` |
| Media mode | Static Pages assets (no R2) |
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

The `_redirects` file preserves SPA navigation on Pages. Public API responses contain only `published` rows. Admin metadata is stored in D1; GIF and MP4 files are static Pages assets under `public/assets/animations/library/`.

## Animation metadata

Admin entries require a title, category, character color, valid content scale, and at least one static GIF or MP4 path before publishing. Paths must use `/assets/animations/library/`; file sizes are stored as bytes in D1 and formatted for the UI. The existing `miyoCharacters.js` screen calibration remains static and is not editable from Admin.

## Static media workflow

1. Put real files in `public/assets/animations/library/`, such as `happy.gif` or `happy.mp4`.
2. In Admin, enter `/assets/animations/library/happy.gif` and/or `/assets/animations/library/happy.mp4`.
3. Save and publish the metadata in D1.
4. Rebuild and deploy Pages after adding real media files, because static assets are included at build/deploy time.

R2 and Cloudflare Access are intentionally disabled and not required for the current runtime. GIF and MP4 files are served as static Pages assets.
