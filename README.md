# WWF North Africa — Independent CMS Setup

This repository now includes an independent pre-launch CMS for the WWF North Africa website.

## What it does

- Separate admin interface served from `/admin`
- Manager and administrator roles with login authentication
- Draft saving and private preview
- Approval workflow before launch
- Persistent JSON storage on disk
- Image upload support via the local uploads folder
- No automatic public launch when content is saved

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file and update the credentials before use:
   ```bash
   cp .env.example .env
   ```

3. Start the CMS server:
   ```bash
   npm start
   ```

4. Open:
   - admin: http://localhost:3000/admin
   - public website: http://localhost:3000/

## Default credentials

The default values in `.env.example` are intentionally placeholders and must be changed before production use.

- Communications Manager username: `communications-manager`
- Communications Manager password: `change-me`
- Administrator username: `administrator`
- Administrator password: `change-me`

## Storage model

Content is saved to `data/store.json`.

- `content`: active working content
- `drafts`: saved drafts
- `queue`: pending approval submissions
- `approved`: approved content ready for launch

Uploaded images are stored under `uploads/` and served at `/uploads/...`.

## Launch workflow

1. Communications Manager logs in to `/admin`
2. Edits sections and saves drafts
3. Uses Preview to view private updates
4. Submits content for approval
5. Administrator reviews and approves or rejects
6. Approved content remains stored until WWF triggers the public launch

This preserves the public site and prevents accidental publishing when content is edited.
