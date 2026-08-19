import { UserProvider } from "../../../../context/UserContext";

// The OAuth callback lives outside /shop/[shopSlug] (see that layout's
// comment) so it never gets the shop-scoped UserProvider from there — it
// needs its own here just so page.jsx can call useUser().fetchMe() once
// before redirecting into the actual shop, where a fresh UserProvider
// takes over. skipAutoFetch=true: without it, this provider's own mount
// effect would re-read the token page.jsx just saved to localStorage and
// re-fetch /me a second time without the shop-slug header page.jsx sends
// explicitly — that duplicate call 404s and deletes the token it just set.
export default function AuthCallbackLayout({ children }) {
  return <UserProvider skipAutoFetch>{children}</UserProvider>;
}
