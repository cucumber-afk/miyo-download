# Cloudflare Setup

MiYo Studio runs on Cloudflare Pages with D1 and Workers KV media storage. This project does not require Cloudflare Access, R2, or a Cloudflare payment method.

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
- Media storage: Workers KV binding `MEDIA_KV`
- Uploaded media: GIF max 8 MiB; MP4 max 20 MiB
- D1 stores metadata and media object keys
- Legacy static assets remain for bundled Hero and website assets only

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

## Runtime Media Uploads

Create the KV namespace once with `npx wrangler kv namespace create MEDIA_KV`, then keep its real ID in `wrangler.toml`. The current namespace ID is `36a5471eb68f4f6a9bed46c970eaccbb`. Do not create another namespace or enable R2. Upload limits are 8 MiB for GIF and 20 MiB for MP4.
## Legacy Static Media Workflow

Bundled Hero and website assets may remain under `public/assets/animations/library/`. New Admin animation uploads use `MEDIA_KV` and do not require a rebuild.


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
