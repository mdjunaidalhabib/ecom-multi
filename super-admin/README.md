# Cartvan Super Admin Portal

Platform-owner portal — manage shops, shop admins, and shop trash. Separate
app from the shop-admin/staff portal in [`../admin`](../admin).

## Portal URLs

| Login | Dashboard |
| --- | --- |
| `/login` | `/dashboard` |

Only a `superadmin` session may access this app; anything else is bounced
to `/login`.

## Development

```bash
npm install
npm run dev
```

The development server runs on port `3002` by default. Set `BACKEND_API_URL` to the backend base URL used by the `/api/*` proxy.

## Production

```bash
npm run build
npm start
```

The production server runs on port `3009` by default.
