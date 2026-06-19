import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  optional,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </Label>
        {optional && (
          <span className="text-xs text-gray-400 font-normal">اختياري</span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
