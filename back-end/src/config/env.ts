export const ENV = {
  isProd: process.env.NODE_ENV === "production",
  PORT: process.env.PORT as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  FRONTEND_URL: process.env.FRONTEND_URL as string
}

/*
 * ---------------------------------------------------------
 * Critical environment variables validation
 * ---------------------------------------------------------
 */

if (!ENV.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}

if (!ENV.FRONTEND_URL) {
  throw new Error("Without FRONT_END_URL env. Cors might not work properly")
}
