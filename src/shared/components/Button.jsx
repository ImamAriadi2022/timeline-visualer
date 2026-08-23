import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  icon = null,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5",
  };

  const variantClasses = {
    primary: "bg-[#007AFF] text-white hover:bg-[#0066d6] shadow-sm",
    secondary:
      "bg-[#2C2C2E] text-[#F5F5F7] hover:bg-[#3A3A3C] border border-[#38383A]",
    ghost: "bg-transparent text-[#98989D] hover:text-[#F5F5F7] hover:bg-white/5",
    danger: "bg-[#FF453A] text-white hover:bg-[#D70015]",
    outline:
      "border border-[#D2D2D7] dark:border-[#38383A] text-inherit hover:bg-black/5 dark:hover:bg-white/5",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
