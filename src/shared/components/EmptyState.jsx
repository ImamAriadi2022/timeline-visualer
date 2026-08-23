import React from "react";
import { Button } from "./Button";
import { UploadIcon } from "./Icons";

export function EmptyState({
  title = "No Timeline Loaded",
  description = "Import your Google Maps Timeline export to begin visualizing your journey on the map.",
  actionLabel = "Import Timeline",
  onAction,
  icon = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#38383A] rounded-2xl bg-[#1C1C1E]/50">
      <div className="w-12 h-12 rounded-2xl bg-[#2C2C2E] flex items-center justify-center text-[#98989D] mb-4">
        {icon || <UploadIcon className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-semibold text-[#F5F5F7] tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#98989D] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
