import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${parsed.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")}`
  );
}

export const API_URL = parsed.data.VITE_API_URL;
