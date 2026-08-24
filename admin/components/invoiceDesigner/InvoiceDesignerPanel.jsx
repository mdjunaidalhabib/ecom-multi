"use client";

import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import InvoiceCanvas from "./InvoiceCanvas";
import InvoiceStylePanel from "./InvoiceStylePanel";
import ConfirmModal from "../orders/modals/ConfirmModal";
import { useShopFeatures } from "../../hooks/useShopFeatures";
import useInvoiceTemplate from "../../hooks/useInvoiceTemplate";
import {
  buildDefaultSampleOrder,
  buildOrderFromSample,
  buildSampleShop,
  normalizeTemplate,
} from "../../lib/invoiceTemplateContract";

const CANVAS_WRAP_PADDING = 16; // wrapper-এর p-4 এর সাথে মেলাতে হবে
const CANVAS_MAX_SCALE = 0.85;
const PAGE_BOTTOM_GAP = 16; // পুরো পেজের নিচে অল্প খালি জায়গা রাখার জন্য
const PANEL_GAP = 16; // canvas আর style panel-এর মাঝের gap-4 এর সাথে মেলাতে হবে
const CANVAS_HEIGHT_SHARE = 0.6; // মোবাইলে মোট উচ্চতার সর্বোচ্চ কতটুকু canvas নেবে, বাকিটা style panel পাবে
const MOBILE_BREAKPOINT = 1024; // lg breakpoint — এর নিচে হলে পুরো পেজ viewport উচ্চতার মধ্যে ফিট করা হয়

export default function InvoiceDesignerPanel() {
  const features = useShopFeatures();
  const { shop: realShop } = useInvoiceTemplate();
  const [template, setTemplate] = useState(null);
  const [isCustomized, setIsCustomized] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [sampleOrder, setSampleOrder] = useState(buildDefaultSampleOrder());

  const rootRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const [canvasScale, setCanvasScale] = useState(CANVAS_MAX_SCALE);
  const [mobileFit, setMobileFit] = useState(null); // { total, canvasBox, panelBox } — শুধু মোবাইলে সেট হয়

  const allowed = features ? !!features.invoiceCustomization : null;

  useEffect(() => {
    if (allowed !== true) {
      setLoading(false);
      return;
    }
    axios
      .get("/api/admin/invoice-template/mine", { withCredentials: true })
      .then((res) => {
        setTemplate(res.data?.template ? normalizeTemplate(res.data.template) : null);
        setIsCustomized(res.data?.isCustomized !== false);
      })
      .catch(() => toast.error("❌ টেমপ্লেট লোড করতে সমস্যা হয়েছে"))
      .finally(() => setLoading(false));
  }, [allowed]);

  // ✅ ডিজাইনার প্রিভিউতে দেখানো ডেমো অর্ডার সুপারএডমিন সেট করে (দেখুন
  // super-admin-এর "প্রিভিউ ডেমো ডেটা" ফর্ম) — এখানে শুধু পড়া হয়, প্ল্যান-গেট
  // ছাড়াই সবাই অ্যাক্সেস করতে পারে বলে `allowed` এর উপর নির্ভর করে না
  useEffect(() => {
    axios
      .get("/api/admin/invoice-template-default", { withCredentials: true })
      .then((res) => {
        if (res.data?.template?.sampleOrder) setSampleOrder(res.data.template.sampleOrder);
      })
      .catch(() => {});
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
      setTemplate(res.data?.template ? normalizeTemplate(res.data.template) : null);
      setIsCustomized(true);
      toast.success("✅ ইনভয়েস ডিজাইন সেভ হয়েছে");
    } catch {
      toast.error("❌ সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  // ✅ সুপারএডমিনের সেট করা প্ল্যাটফর্ম ডিফল্ট ডিজাইন এডিটরে লোড করে —
  // "সেভ করো" না চাপা পর্যন্ত এটা স্থায়ী হয় না, তাই আগে কনফার্মেশন নেওয়া হয়
  const applyPlatformDefault = () => {
    setConfirm({
      title: "প্ল্যাটফর্ম ডিফল্ট ডিজাইন ব্যবহার করবেন?",
      description:
        "এখন যা এডিট করছেন তার বদলে সুপারএডমিনের সেট করা ডিফল্ট ইনভয়েস ডিজাইন এখানে লোড হবে। এটা তখনই স্থায়ী হবে যখন আপনি নিচের \"সেভ করো\" বাটনে চাপবেন।",
      confirmText: "হ্যাঁ, লোড করো",
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await axios.get("/api/admin/invoice-template-default", {
            withCredentials: true,
          });
          setTemplate(res.data?.template ? normalizeTemplate(res.data.template) : null);
          setSelectedId(null);
          toast.success('✅ ডিফল্ট ডিজাইন লোড হয়েছে — স্থায়ী করতে "সেভ করো" চাপুন');
        } catch {
          toast.error("❌ ডিফল্ট ডিজাইন লোড করতে সমস্যা হয়েছে");
        }
      },
    });
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

  // ✅ শপের নাম সবসময় ডিফল্ট ডেমো প্লেসহোল্ডার দেখায় (শপের নিজের আসল নাম না —
  // name ফিল্ড কখনো খালি থাকে না বলে real-data fallback এখানে কাজ করে না)।
  // ফোন/ইমেইল real ডেটা থাকলে সেটাই দেখায়, খালি থাকলে (নতুন শপ) ডেমো
  // প্লেসহোল্ডার — এই দুটো ঐচ্ছিক ফিল্ড বলে খালি থাকা স্বাভাবিক।
  const demoShop = buildSampleShop();
  const previewShop = {
    name: demoShop.name,
    logo: realShop?.logo || demoShop.logo,
    contactPhone: realShop?.contactPhone || demoShop.contactPhone,
    contactEmail: realShop?.contactEmail || demoShop.contactEmail,
  };

  return (
    <div
      ref={rootRef}
      className="flex flex-col lg:flex-row gap-4 lg:gap-6"
      style={mobileFit ? { height: mobileFit.total, overflow: "hidden" } : undefined}
    >
      <Toaster position="top-center" />
      <ConfirmModal data={confirm} onClose={() => setConfirm(null)} />
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
            shop={previewShop}
            scale={canvasScale}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChangeElement={updateElement}
          />
        </div>
      </div>

      <div
        className="w-full lg:w-80 flex flex-col gap-4"
        style={mobileFit ? { height: mobileFit.panelBox, overflowY: "auto" } : undefined}
      >
        {!isCustomized && (
          <p className="shrink-0 text-xs bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-lg px-3 py-2">
            🆕 এটা এখনো প্ল্যাটফর্মের ডিফল্ট ডিজাইন — আপনি নিজের কোনো কাস্টমাইজেশন সেভ করেননি।
          </p>
        )}
        <button
          type="button"
          onClick={saveTemplate}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg font-semibold shrink-0"
        >
          {saving ? "⏳ সেভ হচ্ছে..." : "💾 সেভ করো"}
        </button>
        <button
          type="button"
          onClick={applyPlatformDefault}
          className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 py-2 rounded-lg font-semibold shrink-0"
        >
          🔄 প্ল্যাটফর্ম ডিফল্ট ব্যবহার করো
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
