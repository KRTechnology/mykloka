"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function Loading() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[2px]"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{
            scale: 1,
            transition: {
              duration: 0.5,
              ease: "easeOut",
            },
          }}
          className="relative"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1.5,
              ease: "linear",
              repeat: Infinity,
            }}
            className="h-12 w-12"
          >
            <svg
              className="absolute"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-kr-orange opacity-20"
              />
              <motion.circle
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-kr-orange"
                strokeDasharray={120}
                strokeDashoffset={40}
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
