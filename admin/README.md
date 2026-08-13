# Cartvan Admin Portal

Shop admin/staff portal only. The platform-owner Super Admin portal is a
separate app — see [`../super-admin`](../super-admin).

## Portal URLs

| Role | Login | Dashboard |
| --- | --- | --- |
| Shop Admin / Staff | `/login` | `/admin/dashboard` |

A Shop Admin/Staff session cannot open the Super Admin app. If a superadmin
session cookie is ever detected here (e.g. shared `localhost` cookies in
dev), it's redirected out to `SUPER_ADMIN_URL`.

## Development

```bash
npm install
npm run dev
```

The development server runs on port `3001` by default. Set `BACKEND_API_URL` to the backend base URL used by the `/api/*` proxy, and `SUPER_ADMIN_URL` to the Super Admin app's URL (used for the cross-app redirect above).

## Production

```bash
npm run build
npm start
```

The production server runs on port `3008` by default.
