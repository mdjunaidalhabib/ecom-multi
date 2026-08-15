import { notFound } from "next/navigation";
import LandingPageClient from "../../../../../../components/landing/LandingPageClient";
import { getLandingPageBySlug, serverFetch } from "../../../../../../lib/serverApi";
import { shopBasePath } from "../../../../../../lib/shopMode";

async function getLandingPage(slug) {
  try {
    return await getLandingPageBySlug(slug);
  } catch {
    return null;
  }
}

export default async function LandingPage({ params }) {
  const { shopSlug, landingSlug } = await params;

  const [page, paymentMethods] = await Promise.all([
    getLandingPage(landingSlug),
    serverFetch("/payment-methods").catch(() => []),
  ]);

  if (!page || !page.productId) {
    notFound();
  }

  return (
    <LandingPageClient
      page={page}
      product={page.productId}
      paymentMethods={Array.isArray(paymentMethods) ? paymentMethods : []}
      base={shopBasePath(shopSlug)}
    />
  );
}
