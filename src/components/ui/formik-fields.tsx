import type { ComponentProps } from "react";
import { useField, useFormikContext } from "formik";
import { inputClassName } from "@/components/ui/form";

type BoundProps<T> = Omit<T, "name" | "value" | "onChange" | "onBlur"> & { name: string };

function useFieldError(name: string) {
  const { getFieldMeta } = useFormikContext();
  const { touched, error } = getFieldMeta(name);
  return touched && typeof error === "string" ? error : undefined;
}

export function FieldError({ name }: { name: string }) {
  const error = useFieldError(name);
  if (!error) return null;

  return (
    <p data-field-error className="text-xs text-red-600">
      {error}
    </p>
  );
}

export function FormikInput({
  name,
  className = inputClassName,
  ...props
}: BoundProps<ComponentProps<"input">>) {
  const [field] = useField(name);
  const error = useFieldError(name);

  return (
    <>
      <input {...props} {...field} aria-invalid={Boolean(error)} className={className} />
      <FieldError name={name} />
    </>
  );
}

export function FormikTextarea({
  name,
  className = inputClassName,
  ...props
}: BoundProps<ComponentProps<"textarea">>) {
  const [field] = useField(name);
  const error = useFieldError(name);

  return (
    <>
      <textarea {...props} {...field} aria-invalid={Boolean(error)} className={className} />
      <FieldError name={name} />
    </>
  );
}

export function FormikSelect({
  name,
  className = inputClassName,
  ...props
}: BoundProps<ComponentProps<"select">>) {
  const [field] = useField(name);
  const error = useFieldError(name);

  return (
    <>
      <select {...props} {...field} aria-invalid={Boolean(error)} className={className} />
      <FieldError name={name} />
    </>
  );
}
