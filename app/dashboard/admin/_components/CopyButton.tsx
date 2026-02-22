"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyButtonProps = {
  text: string;
  truncateLength?: number;
};

export default function CopyButton({
  text,
  truncateLength = 8,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText =
    text.length > truncateLength ? `${text.slice(0, truncateLength)}...` : text;

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm">{displayText}</span>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 hover:bg-gray-100"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3 text-gray-500" />
        )}
      </Button>
    </div>
  );
}
