import { Suspense } from "react";
import AuthForm from "../../../../../components/auth/AuthForm";

export const metadata = { title: "Login", robots: { index: false, follow: false } };

// AuthForm useSearchParams() ব্যবহার করে, তাই Suspense boundary লাগে
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
