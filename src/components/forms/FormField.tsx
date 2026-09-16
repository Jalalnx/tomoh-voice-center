import { ReactNode, cloneElement, isValidElement, useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  /**
   * Set for fields whose control is a *group* (radios, option buttons) instead
   * of one labelable element. The label then renders as plain text and no
   * `for` is emitted — point at the group with `role` + `aria-label` on the
   * wrapper instead, so we never ship a dangling `for` attribute.
   */
  group?: boolean;
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
  group,
  required,
  optional,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  const autoId = useId();

  // Most call sites never passed `htmlFor`, which left the Arabic label
  // orphaned from its input. When the field wraps a single element we hand it
  // a generated id and point the label at it, so every form field is wired
  // without touching each page.
  let control: ReactNode = children;
  let controlId: string | undefined = htmlFor;
  if (!group && !htmlFor && isValidElement<{ id?: string }>(children)) {
    controlId = children.props.id ?? autoId;
    control = children.props.id
      ? children
      : cloneElement(children, { id: controlId });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {group ? (
          <span className="text-sm font-semibold leading-none text-gray-700">
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </span>
        ) : (
          <Label htmlFor={controlId} className="text-sm font-semibold text-gray-700">
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </Label>
        )}
        {optional && (
          <span className="text-xs text-gray-500 font-normal">اختياري</span>
        )}
      </div>
      {control}
      {hint && !error && (
        <p className="text-xs text-gray-600">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
