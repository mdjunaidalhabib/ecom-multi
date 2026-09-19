// Screen-reader/crawler-visible intro for the storefront home page. It used to
// hardcode "Cartvan" for every shop — now it uses the shop's own brand name.
export default function HomeSEO({ brand }) {
  if (!brand) return null;

  return (
    <div className="sr-only">
      <h1>{brand} – অনলাইন শপ</h1>

      <p>
        {brand} থেকে অনলাইনে মানসম্পন্ন প্রোডাক্ট কিনুন সাশ্রয়ী দামে, সারা
        বাংলাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধাসহ।
      </p>
    </div>
  );
}
