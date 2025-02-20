"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./button";

interface BackButtonProps {
  href: string;
}

export function BackButton({ href }: BackButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={href}>
        <Button
          variant="ghost"
          className="gap-2 pl-0 hover:pl-2 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
    </motion.div>
  );
}
