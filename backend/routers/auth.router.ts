import express from "express";
import middleware from "../middleware";
import authValidation from "../validations/auth.validation";
import authController from "../controllers/auth.controller";

const router = express.Router();

router.post(
  "/create",
  middleware.ValidateSchema(authValidation.CreateAccountSchema),
  authController.createAccount,
);

router.post(
  "/login",
  middleware.ValidateSchema(authValidation.LoginSchema),
  authController.login,
);

router.post("/refresh", authController.refresh);

router.post("/logout", authController.logout);

export default router;
