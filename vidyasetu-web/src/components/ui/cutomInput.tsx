import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="text-xs font-semibold text-text block mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full h-9 bg-surface text-sm text-text placeholder:text-text-secondary/60 border-2 border-border rounded-lg px-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all",
              icon && "pl-9",
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p
            className="text-xs mt-1.5 font-medium"
            style={{ color: "#ef4444" }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
