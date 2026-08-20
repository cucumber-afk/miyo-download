# Cloudflare Setup

MiYo Studio runs on Cloudflare Pages with D1 and static media. This project does not require Cloudflare Access, R2, or a Cloudflare payment method.

## Cloudflare Resources

| Resource | Name | Notes |
|---|---|---|
| Cloudflare Pages project | `miyo-download` | Deploy target; manage with `--project-name miyo-download` |
| Cloudflare Pages URL | `https://miyo-download.pages.dev` | Production live site |
| D1 database | `miyo-studio` | Stores animation metadata, sessions, admin auth |
| Pages build output | `dist` | Static assets + bundled Functions |
| Admin auth | Application-managed session cookie | No Cloudflare Access required |

## Active Configuration

- Pages build output: `dist`
- D1 binding: `DB`
- D1 database: `miyo-studio`
- D1 database ID: `7c7575cb-9b3d-41f6-8d63-e07201cb0a6c`
- Media: static files under `public/assets/animations/library/`

`wrangler.toml` contains no R2 binding and no Access variables.

## Pages Operations

```bash
# Deploy to production Pages project
npx wrangler pages deploy dist --project-name miyo-download

# Tail production error logs
npx wrangler pages deployment tail --project-name miyo-download --environment production --status error

# List deployments
npx wrangler pages deployment list --project-name miyo-download

# Build and preview locally (no deploy)
npm run pages:dev
```

## Database (D1)

Apply migrations only after confirming the intended Cloudflare account and database:

```bash
npx wrangler d1 migrations apply miyo-studio --remote
```

The admin authentication migration creates `admins`, `admin_sessions`, and `admin_login_attempts`. It does not modify `animations` data.

## First Administrator

In PowerShell, set a password only for the current process and create or rotate the account:

```powershell
$env:MIYO_ADMIN_PASSWORD = 'choose-a-strong-password'
npm run admin:create -- --email admin@example.com
Remove-Item Env:MIYO_ADMIN_PASSWORD
```

The script hashes the password locally with PBKDF2-SHA256 before writing it to D1. It never logs the password. `MIYO_ADMIN_PASSWORD` must be removed after use.

## Static Media Workflow

1. Put GIF and MP4 files under `public/assets/animations/library/`.
2. Sign in at `/admin/login`.
3. Enter asset paths such as `/assets/animations/library/happy.gif` and save the animation metadata.
4. Publish the metadata after the static media is included in a Pages build.

Binary media uploads and runtime R2 media endpoints are disabled. Pages serves the media files and D1 stores only the metadata.

## Verification

```bash
npm run cf:config:check
npm run build
npx wrangler pages functions build
```

Do not run a Pages deploy command until the deployment is explicitly approved.

## Cleanup

After all production acceptance is complete, remove the test media file:

```
public/assets/animations/library/production-test.gif
```

This file was used for end-to-end validation only and should not remain in the production static bundle.
