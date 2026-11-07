import { redirect } from "next/navigation";

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value)) value.forEach(item => query.append(key, item));
  }
  // Existing ad links retain their plan and attribution when redirected.
  redirect(`/${query.size ? `?${query}` : ""}#lead-form`);
}
