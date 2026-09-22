"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, MessageCircle, Phone, X } from "lucide-react";

const PHONE_DISPLAY = "০১৬২৪-১১৪৪০৫";
const PHONE_DIAL = "+8801624114405";
const WEBSITE_URL = "https://hikmahit.com";

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.44-1.43a9.87 9.87 0 0 0 4.6 1.17h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.73-2.08.99-2.36c.26-.28.56-.35.75-.35h.54c.17 0 .4-.02.62.48.24.55.81 1.9.88 2.04.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.61-.07.16-.19.7-.81.89-1.09.19-.28.38-.23.63-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.85 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, type: "spring", stiffness: 380, damping: 22 },
  }),
  exit: { opacity: 0, y: 14, scale: 0.85, transition: { duration: 0.15 } },
};

// নিচে-ডানে ফিক্সড speed-dial — Call, WhatsApp ও Hikmah IT ওয়েবসাইট,
// একনজরেই যোগাযোগের সব উপায় দেখাতে। PlatformLanding-এর যোগাযোগ সেকশনে
// (নিচে স্ক্রল করে) একই তিনটা অপশন আছে, এটা শুধু সবসময়-দৃশ্যমান শর্টকাট।
export default function PlatformContactFab({ whatsappNumber }) {
  const [open, setOpen] = useState(false);

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("আমি ECMS সম্পর্কে জানতে চাই।")}`
    : null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {open && (
          <motion.div className="flex flex-col items-end gap-3">
            {whatsappHref && (
              <motion.a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp"
                custom={0}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={itemVariants}
                whileTap={{ scale: 0.9 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-200"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </motion.a>
            )}

            <motion.a
              href={`tel:${PHONE_DIAL}`}
              aria-label={`কল করুন ${PHONE_DISPLAY}`}
              title={PHONE_DISPLAY}
              custom={1}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={itemVariants}
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-200"
            >
              <Phone size={16} />
            </motion.a>

            <motion.a
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hikmah IT"
              title="Hikmah IT"
              custom={2}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={itemVariants}
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-200"
            >
              <Globe2 size={16} />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "যোগাযোগ মেনু বন্ধ করুন" : "যোগাযোগ করুন"}
        aria-expanded={open}
        whileTap={{ scale: 0.9 }}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-xl shadow-orange-300/50"
      >
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-orange-400/50" />}
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center justify-center"
        >
          {open ? <X size={18} /> : <MessageCircle size={17} />}
        </motion.span>
      </motion.button>
    </div>
  );
}
