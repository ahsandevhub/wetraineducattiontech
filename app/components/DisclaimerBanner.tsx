"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("disclaimerDismissed");
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("disclaimerDismissed", "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-gray-900 text-gray-100 text-xs px-4 py-3 text-center flex justify-between items-center z-50"
        >
          <p className="text-center flex-1">
            <strong>Disclaimer:</strong> WeTrain Education OPC কোনো ট্রেডিং
            প্ল্যাটফর্ম পরিচালনা করে না এবং বাংলাদেশে আর্থিক সেবা প্রদান করে না।
            আমাদের সকল সেবা শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে প্রদান করা হয়।
            যেকোনো ট্রেডিং সিদ্ধান্ত গ্রাহকের নিজ দায়িত্বে।
          </p>
          <button
            onClick={handleClose}
            className="ml-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close disclaimer"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
