import { UserProvider } from "../../../../context/UserContext";

// The OAuth callback lives outside /shop/[shopSlug] (see that layout's
// comment) so it never gets the shop-scoped UserProvider from there — it
// needs its own here just to call fetchMe() once before redirecting into
// the actual shop, where a fresh UserProvider takes over.
export default function AuthCallbackLayout({ children }) {
  return <UserProvider>{children}</UserProvider>;
}
