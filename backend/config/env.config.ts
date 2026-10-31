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
  SMTP_SERVICE: z.literal("gmail"),
  SMTP_HOST: z.literal("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().pipe(z.literal(465)).default(465),
  SMTP_USER: z.email().nonempty(),
  SMTP_PASS: z.string().nonempty(),
  SMTP_FROM: z.string().nonempty(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.log(parsed.error);
  process.exit(1);
}

const env = parsed.data;

export default env;
