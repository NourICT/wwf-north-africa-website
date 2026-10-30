# WWF North Africa CMS

This repository has been upgraded to a deployment-ready content management architecture suitable for Netlify or Vercel, with a real PostgreSQL-backed data layer instead of JSON-only storage.

## Deployment targets

### Vercel

1. Provision a PostgreSQL database (Neon, Supabase, Railway, etc.)
2. Add this environment variable in Vercel Dashboard:
   - `DATABASE_URL=postgres://...`
3. Add secure login credentials:
   - `CMS_MANAGER_USERNAME`
   - `CMS_MANAGER_PASSWORD`
   - `CMS_ADMIN_USERNAME`
   - `CMS_ADMIN_PASSWORD`
   - `CMS_SESSION_SECRET`
4. Run:
   ```bash
   npm install
   npm run init-db
   npm run start
   ```
5. Deploy to Vercel with the repo root as the project root.

### Netlify

1. Create a managed Postgres database.
2. Set the same environment variables in Netlify Site settings.
3. Deploy the repo.
4. Use `netlify.toml` and the serverless setup included in the project.

## Production database setup

Run the schema initializer:

```bash
npm run init-db
```

This creates the required tables:
- `cms_content` for active content and approved content
- `cms_submissions` for approval workflow
- `cms_drafts` for draft snapshots
- `cms_media` for uploaded assets

## Production UI improvements

The CMS UI now includes:
- dedicated manager and administrator roles
- role-based access control
- draft management
- approval queue
- preview window
- structured content editing for homepage, projects, team, news, partners, and contact fields
- upload-ready media design for future image storage integration

## Security notes

Before production launch:
- change all default credentials in `.env`
- use strong passwords and a long `CMS_SESSION_SECRET`
- use a hosted Postgres database instead of local development storage
- never expose your admin portal publicly without authentication and HTTPS

## Local development

```bash
cp .env.example .env
npm install
npm run init-db
npm start
```

Then open:
- Admin: `http://localhost:3000/admin`
- Public homepage: `http://localhost:3000/`

## Important note

This version is ready for deployment on Vercel or Netlify with a managed PostgreSQL database, but the public website content is still separate from the admin layer by design. The public website remains unpublished until the Administrator approves and triggers the launch step.
