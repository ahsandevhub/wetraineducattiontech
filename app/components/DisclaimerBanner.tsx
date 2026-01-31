"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("bannerDismissed");
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("bannerDismissed", "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-gray-900 text-gray-100 text-xs px-4 py-3 flex justify-between items-center z-50"
        >
          <p className="flex-1 text-center">
            <strong>Notice:</strong> WeTrainEducation & Tech is a global IT and
            marketing solutions company. All content on this site is provided
            for general informational purposes and does not constitute financial
            or legal advice.
          </p>
          <button
            onClick={handleClose}
            className="ml-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close notice"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
