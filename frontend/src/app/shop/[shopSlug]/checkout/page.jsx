// app/checkout/page.jsx
import CheckoutClient from "../../../../../components/home/CheckoutClient";
import { requireFullStorefront } from "../../../../../lib/requireFullStorefront";

export default async function CheckoutPage({ params }) {
  const { shopSlug } = await params;
  await requireFullStorefront(shopSlug);
  return <CheckoutClient />;
}
