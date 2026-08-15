"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import InvoiceCanvas from "./invoiceDesigner/InvoiceCanvas";
import InvoiceStylePanel from "./invoiceDesigner/InvoiceStylePanel";
import { buildSampleOrder, buildSampleShop } from "../lib/invoiceTemplateContract";

const CANVAS_SCALE = 0.7;

// ✅ প্ল্যাটফর্ম-ওয়াইড ডিফল্ট ইনভয়েস ডিজাইন — শুধু super-admin এডিট করতে পারে।
// যেসব শপের নিজস্ব InvoiceTemplate নেই (বা প্ল্যানে invoiceCustomization
// ফিচার নেই), তাদের ইনভয়েস এই ডিজাইন দিয়েই তৈরি হয় (দেখুন
// backend/src/services/invoiceTemplateService.js)।
export default function InvoiceTemplateDefaultPanel() {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    axios
      .get("/api/admin/invoice-template-default", { withCredentials: true })
      .then((res) => setTemplate(res.data?.template))
      .catch(() => {
        setLoadError(true);
        toast.error("❌ টেমপ্লেট লোড করতে সমস্যা হয়েছে");
      })
      .finally(() => setLoading(false));
  }, []);

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
      const res = await axios.post("/api/admin/invoice-template-default/background", formData, {
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
      const res = await axios.put("/api/admin/invoice-template-default", template, {
        withCredentials: true,
      });
      setTemplate(res.data?.template);
      toast.success("✅ ডিফল্ট ইনভয়েস ডিজাইন সেভ হয়েছে");
    } catch {
      toast.error("❌ সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">⏳ লোড হচ্ছে...</div>;
  }

  if (loadError || !template) {
    return (
      <div className="p-8 text-center text-red-500">
        ❌ টেমপ্লেট লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।
      </div>
    );
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
          {saving ? "⏳ সেভ হচ্ছে..." : "💾 ডিফল্ট ডিজাইন সেভ করো"}
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
