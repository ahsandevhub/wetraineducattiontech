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
          className="w-full bg-gradient-to-r from-[var(--primary-yellow)] to-[var(--secondary-yellow)] text-gray-900 py-2"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <p className="text-sm">
              <span className="font-semibold">Limited Time:</span> Get a free
              marketing audit worth $500 with any new campaign.
              <span className="font-semibold ml-2">
                Results may vary based on industry and market conditions.
              </span>
            </p>
            <button
              onClick={handleClose}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-900 hover:text-gray-700 transition-colors"
              aria-label="Close banner"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
