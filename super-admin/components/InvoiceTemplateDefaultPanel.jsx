"use client";

import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import InvoiceCanvas from "./invoiceDesigner/InvoiceCanvas";
import InvoiceStylePanel from "./invoiceDesigner/InvoiceStylePanel";
import SampleOrderEditor from "./invoiceDesigner/SampleOrderEditor";
import {
  buildDefaultSampleOrder,
  buildOrderFromSample,
  buildSampleShop,
  normalizeTemplate,
} from "../lib/invoiceTemplateContract";

const CANVAS_WRAP_PADDING = 16; // wrapper-এর p-4 এর সাথে মেলাতে হবে
const CANVAS_MAX_SCALE = 0.85;
const PAGE_BOTTOM_GAP = 16; // পুরো পেজের নিচে অল্প খালি জায়গা রাখার জন্য
const PANEL_GAP = 16; // canvas আর style panel-এর মাঝের gap-4 এর সাথে মেলাতে হবে
const CANVAS_HEIGHT_SHARE = 0.6; // মোবাইলে মোট উচ্চতার সর্বোচ্চ কতটুকু canvas নেবে, বাকিটা style panel পাবে
const MOBILE_BREAKPOINT = 1024; // lg breakpoint — এর নিচে হলে পুরো পেজ viewport উচ্চতার মধ্যে ফিট করা হয়

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
  const [sampleOrder, setSampleOrder] = useState(buildDefaultSampleOrder());
  const [sampleShop, setSampleShop] = useState(buildSampleShop());
  const [activeTab, setActiveTab] = useState("style"); // "style" | "demo"

  const rootRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const [canvasScale, setCanvasScale] = useState(CANVAS_MAX_SCALE);
  const [mobileFit, setMobileFit] = useState(null); // { total, canvasBox, panelBox } — শুধু মোবাইলে সেট হয়

  useEffect(() => {
    axios
      .get("/api/admin/invoice-template-default", { withCredentials: true })
      .then((res) => {
        setTemplate(res.data?.template ? normalizeTemplate(res.data.template) : null);
        if (res.data?.template?.sampleOrder) setSampleOrder(res.data.template.sampleOrder);
        if (res.data?.template?.sampleShop) setSampleShop(res.data.template.sampleShop);
      })
      .catch(() => {
        setLoadError(true);
        toast.error("❌ টেমপ্লেট লোড করতে সমস্যা হয়েছে");
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Desktop-এ canvas নিজের wrapper-এর প্রস্থ অনুযায়ী fit করে scale হয়।
  // মোবাইলে (lg breakpoint-এর নিচে) পুরো পেজটাই (canvas + style panel)
  // viewport-এর উচ্চতার মধ্যে বসিয়ে দেওয়া হয় — canvas একটা নির্দিষ্ট অংশ
  // (সর্বোচ্চ ৬০%) নেয়, বাকিটা style panel পায় ও নিজের ভেতরে স্ক্রল করে —
  // ফলে পুরো পেজে কোনো স্ক্রল ছাড়াই ইনভয়েসটা একবারে দেখা যায়
  useEffect(() => {
    if (!template) return;
    const root = rootRef.current;
    const el = canvasWrapRef.current;
    if (!root || !el) return;

    const compute = () => {
      const availableW = el.clientWidth - CANVAS_WRAP_PADDING * 2;
      if (availableW <= 0) return;
      const widthScale = availableW / template.pageSize.width;

      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (!isMobile) {
        setCanvasScale(Math.min(widthScale, CANVAS_MAX_SCALE));
        setMobileFit(null);
        return;
      }

      const viewportH = window.visualViewport?.height || window.innerHeight;
      const top = root.getBoundingClientRect().top;
      const total = Math.max(viewportH - top - PAGE_BOTTOM_GAP, 240);

      const idealCanvasBox = template.pageSize.height * widthScale + CANVAS_WRAP_PADDING * 2;
      const canvasBox = Math.min(idealCanvasBox, total * CANVAS_HEIGHT_SHARE);
      const heightScale = (canvasBox - CANVAS_WRAP_PADDING * 2) / template.pageSize.height;
      const panelBox = Math.max(total - canvasBox - PANEL_GAP, 100);

      setCanvasScale(Math.max(Math.min(widthScale, heightScale), 0.1));
      setMobileFit({ total, canvasBox, panelBox });
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [template]);

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
      const res = await axios.put(
        "/api/admin/invoice-template-default",
        { ...template, sampleOrder, sampleShop },
        { withCredentials: true },
      );
      setTemplate(res.data?.template ? normalizeTemplate(res.data.template) : null);
      if (res.data?.template?.sampleOrder) setSampleOrder(res.data.template.sampleOrder);
      if (res.data?.template?.sampleShop) setSampleShop(res.data.template.sampleShop);
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
    <div
      ref={rootRef}
      className="flex flex-col lg:flex-row gap-4 lg:gap-6"
      style={mobileFit ? { height: mobileFit.total, overflow: "hidden" } : undefined}
    >
      <Toaster position="top-center" />
      <div
        ref={canvasWrapRef}
        onPointerDown={() => setSelectedId(null)}
        className="min-w-0 lg:flex-1 border rounded-lg bg-gray-100 dark:bg-slate-900 dark:border-slate-700 p-4 flex items-start justify-center lg:overflow-auto"
        style={mobileFit ? { height: mobileFit.canvasBox, flexShrink: 0, overflow: "hidden" } : undefined}
      >
        <div
          style={{
            width: template.pageSize.width * canvasScale,
            height: template.pageSize.height * canvasScale,
            flexShrink: 0,
          }}
        >
          <InvoiceCanvas
            template={template}
            order={buildOrderFromSample(sampleOrder)}
            shop={sampleShop}
            scale={canvasScale}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChangeElement={updateElement}
          />
        </div>
      </div>

      <div
        className="w-full lg:w-80 flex flex-col gap-4 min-h-0"
        style={mobileFit ? { height: mobileFit.panelBox, overflowY: "auto" } : undefined}
      >
        <button
          type="button"
          onClick={saveTemplate}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg font-semibold shrink-0"
        >
          {saving ? "⏳ সেভ হচ্ছে..." : "💾 ডিফল্ট ডিজাইন সেভ করো"}
        </button>

        <div className="shrink-0 grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("style")}
            className={`py-1.5 rounded-md transition ${
              activeTab === "style"
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            🎨 স্টাইল
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("demo")}
            className={`py-1.5 rounded-md transition ${
              activeTab === "demo"
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            🧪 ডেমো ডেটা
          </button>
        </div>

        {activeTab === "style" ? (
          <InvoiceStylePanel
            template={template}
            selectedId={selectedId}
            onChangeElement={updateElement}
            onChangeBackground={updateBackground}
            onUploadBackgroundFile={uploadBackgroundFile}
            bgUploading={bgUploading}
          />
        ) : (
          <SampleOrderEditor
            sample={sampleOrder}
            onChange={setSampleOrder}
            shop={sampleShop}
            onChangeShop={setSampleShop}
          />
        )}
      </div>
    </div>
  );
}
