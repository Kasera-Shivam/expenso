import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().min(1000).max(65534).default(5000),
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  DATABASE_URL: z.url().nonempty(),
  BACKEND_URL: z.url().nonempty(),
  FRONTEND_URL: z.url().nonempty(),
  ACCESS_TOKEN_SECRET: z.string().nonempty(),
  CLOUDINARY_CLOUD_NAME: z.string().nonempty(),
  CLOUDINARY_API_KEY: z.string().nonempty(),
  CLOUDINARY_API_SECRET: z.string().nonempty(),
  BREVO_API_URL: z.url().min(1),
  BREVO_API_KEY: z.string().min(1),
  BREVO_USER: z.email().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.log(parsed.error);
  process.exit(1);
}

const env = parsed.data;

export default env;
