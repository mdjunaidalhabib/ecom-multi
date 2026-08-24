import { useEffect, useState } from "react";
import axios from "axios";
import { normalizeTemplate } from "../lib/invoiceTemplateContract";

// ✅ শপের resolved invoice template (নিজের কাস্টম বা প্ল্যাটফর্ম ডিফল্ট)
// একবার fetch করে — OrdersTable/OrderCard এর সব সারি একই টেমপ্লেট শেয়ার
// করে, তাই প্রতি রো আলাদা রিকোয়েস্ট পাঠায় না। normalizeTemplate() দিয়ে
// পাস করা হয় যাতে নতুন element type (যেমন orderNote) যোগ হওয়ার আগে সেভ করা
// পুরনো টেমপ্লেটও সেই ডিফল্ট নিয়ে সঠিকভাবে রেন্ডার হয়।
export function useInvoiceTemplate() {
  const [data, setData] = useState({ template: null, shop: null, loading: true });

  useEffect(() => {
    axios
      .get("/api/admin/invoice-template/resolved", { withCredentials: true })
      .then((res) =>
        setData({
          template: res.data?.template ? normalizeTemplate(res.data.template) : null,
          shop: res.data?.shop,
          loading: false,
        }),
      )
      .catch(() => setData({ template: null, shop: null, loading: false }));
  }, []);

  return data;
}

export default useInvoiceTemplate;
