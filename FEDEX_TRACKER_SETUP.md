# FedEx Tracker Vercel + Supabase Setup

Hidden route after deploy:

`https://garythomaswhitehead.com/fedex-tracker`

This route is not linked from the public navigation.

## Vercel environment variables

Add these in Vercel Project Settings > Environment Variables:

- `FEDEX_TRACKER_PASSWORD` = the password users enter to open the tracker
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Supabase service role key, server-side only
- `FEDEX_TRACKER_TABLE` = `fedex_work_orders` unless you rename the table

Do not put the service role key in client-side code.

## Supabase table

Run this SQL in Supabase SQL Editor:

```sql
create table if not exists fedex_work_orders (
  tracking_number text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
```

## How it works

- `/fedex-tracker` asks for the tracker password.
- After login, it serves the existing HTML tracker interface.
- The tracker loads/saves through `/api/fedex-work-orders`.
- The API uses Supabase server-side, so the private Supabase service key is not exposed in the browser.
- Daily imports still merge by tracking number using the existing tracker behavior.

## Deploy

From this folder:

```bash
npm run build
vercel --prod
```

Or push/deploy using the Vercel workflow already connected to this project.
