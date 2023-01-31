import * as dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

export default {
  PORT: process.env.PORT ?? "",
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "",
  DATABASE_HOST: process.env.DATABASE_HOST ?? "",
  DATABASE_USERNAME: process.env.DATABASE_USERNAME ?? "",
  DATABASE_PORT: process.env.DATABASE_PORT ?? "",
  DATABASE: process.env.DATABASE ?? "",
  STRIPE_SECRET: process.env.STRIPE_SECRET ?? "",
  SKINCURE_EMAIL: process.env.SKINCURE_EMAIL ?? "",
  SKINCURE_PASS: process.env.SKINCURE_PASS ?? "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
};
