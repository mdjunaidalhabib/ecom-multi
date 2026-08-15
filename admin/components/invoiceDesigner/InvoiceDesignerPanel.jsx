"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import InvoiceCanvas from "./InvoiceCanvas";
import InvoiceStylePanel from "./InvoiceStylePanel";
import { useShopFeatures } from "../../hooks/useShopFeatures";
import { buildSampleOrder, buildSampleShop } from "../../lib/invoiceTemplateContract";

const CANVAS_SCALE = 0.7;

export default function InvoiceDesignerPanel() {
  const features = useShopFeatures();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const allowed = features ? !!features.invoiceCustomization : null;

  useEffect(() => {
    if (allowed !== true) {
      setLoading(false);
      return;
    }
    axios
      .get("/api/admin/invoice-template/mine", { withCredentials: true })
      .then((res) => setTemplate(res.data?.template))
      .catch(() => toast.error("❌ টেমপ্লেট লোড করতে সমস্যা হয়েছে"))
      .finally(() => setLoading(false));
  }, [allowed]);

  const updateElement = (id, patch) => {
    setTemplate((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    }));
  };

  const updateBackground = (patch) => {
    setTemplate((prev) => ({ ...prev, background: { ...prev.background, ...patch } }));
  };

  const uploadBackgroundFile = async (file) => {
    setBgUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post("/api/admin/invoice-template/mine/background", formData, {
        withCredentials: true,
      });
      updateBackground({ imageUrl: res.data.url, imagePublicId: res.data.publicId });
      toast.success("✅ ব্যাকগ্রাউন্ড আপলোড হয়েছে");
    } catch {
      toast.error("❌ ব্যাকগ্রাউন্ড আপলোড ব্যর্থ হয়েছে");
    } finally {
      setBgUploading(false);
    }
  };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      const res = await axios.put("/api/admin/invoice-template/mine", template, {
        withCredentials: true,
      });
      setTemplate(res.data?.template);
      toast.success("✅ ইনভয়েস ডিজাইন সেভ হয়েছে");
    } catch {
      toast.error("❌ সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  if (allowed === false) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-8">
        <h2 className="text-lg font-semibold mb-2">🔒 Invoice Design ফিচারটি লক করা আছে</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          আপনার বর্তমান প্ল্যানে এই ফিচারটি নেই। প্ল্যান আপগ্রেড করতে সুপারএডমিনের সাথে যোগাযোগ করুন।
        </p>
      </div>
    );
  }

  if (loading || !template) {
    return <div className="p-8 text-center text-gray-400">⏳ লোড হচ্ছে...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Toaster position="top-center" />
      <div className="flex-1 overflow-auto border rounded-lg bg-gray-100 dark:bg-slate-900 dark:border-slate-700 p-4">
        <div style={{ width: template.pageSize.width * CANVAS_SCALE, height: template.pageSize.height * CANVAS_SCALE }}>
          <InvoiceCanvas
            template={template}
            order={buildSampleOrder()}
            shop={buildSampleShop()}
            scale={CANVAS_SCALE}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChangeElement={updateElement}
          />
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-4">
        <button
          type="button"
          onClick={saveTemplate}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg font-semibold"
        >
          {saving ? "⏳ সেভ হচ্ছে..." : "💾 সেভ করো"}
        </button>
        <InvoiceStylePanel
          template={template}
          selectedId={selectedId}
          onChangeElement={updateElement}
          onChangeBackground={updateBackground}
          onUploadBackgroundFile={uploadBackgroundFile}
          bgUploading={bgUploading}
        />
      </div>
    </div>
  );
}
