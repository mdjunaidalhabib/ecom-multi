# Cartvan Admin Portals

The admin application now has separate, role-restricted portal URLs.

## Portal URLs

| Role | Login | Dashboard |
| --- | --- | --- |
| Shop Admin / Staff | `/login` | `/admin/dashboard` |
| Super Admin | `/super-admin/login` | `/super-admin/dashboard` |

Super Admin management pages:

- `/super-admin/shops`
- `/super-admin/profile`

A Super Admin session is redirected away from `/admin/*` to the Super Admin portal. A Shop Admin or Staff session cannot open `/super-admin/*`.

## Development

```bash
npm install
npm run dev
```

The development server runs on port `3001` by default. Set `BACKEND_API_URL` to the backend base URL used by the `/api/*` proxy.

## Production

```bash
npm run build
npm start
```

The production server runs on port `3008` by default.
