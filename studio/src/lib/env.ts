import { z } from "zod";

const requiredCloudinaryKeys = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_FOLDER",
] as const;

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().optional().default("redis://localhost:6379"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  APP_URL: z
    .string()
    .transform((val) =>
      val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`
    )
    .pipe(z.string().url("APP_URL must be a valid URL")),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  CLOUDINARY_FOLDER: z.string().min(1, "CLOUDINARY_FOLDER is required"),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),
  GROQ_API_KEY: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(input: Record<string, string | undefined> = process.env): Env {
  // First check Cloudinary explicitly so we fail with the exact variable name and never leak values
  for (const key of requiredCloudinaryKeys) {
    const val = input[key];
    if (!val || val.trim() === "") {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  const result = envSchema.safeParse(input);
  if (!result.success) {
    const missingKeys = result.error.issues
      .map((issue) => issue.path.join("."))
      .filter(Boolean);
    throw new Error(`Invalid environment variables: ${missingKeys.join(", ")}`);
  }

  return result.data;
}

// Lazy/cached env accessor to allow testing without failing on file import
let cachedEnv: Env | null = null;
export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}
