import express from "express";
import rateLimit from "../rateLimit/index";
import middleware from "../middleware";
import authValidation from "../validations/auth.validation";
import authController from "../controllers/auth.controller";

const router = express.Router();

router.post(
  "/create",
  rateLimit.signupLimiter,
  middleware.ValidateSchema({ body: authValidation.CreateAccountSchema }),
  authController.createAccount,
);

router.post(
  "/login",
  rateLimit.loginLimiter,
  middleware.ValidateSchema({ body: authValidation.LoginSchema }),
  authController.login,
);

router.post("/refresh", authController.refresh);

router.post(
  "/password/forgot",
  rateLimit.passwordLimiter,
  middleware.ValidateSchema({ body: authValidation.ForgotPasswordSchema }),
  authController.forgotPassword,
);

router.put(
  "/password/reset",
  rateLimit.passwordLimiter,
  middleware.ValidateSchema({ body: authValidation.ResetPasswordSchema }),
  authController.resetPassword,
);

router.put(
  "/password/change",
  middleware.isAuthenticated,
  rateLimit.changePasswordLimiter,
  middleware.ValidateSchema({ body: authValidation.ChangePasswordSchema }),
  authController.changePassword,
);

router.get(
  "/sessions",
  middleware.isAuthenticated,
  authController.listSessions,
);

router.delete(
  "/sessions",
  middleware.isAuthenticated,
  authController.revokeOtherSessions,
);

router.delete(
  "/sessions/:id",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ params: authValidation.SessionParamsSchema }),
  authController.revokeSession,
);

router.post("/logout", middleware.isAuthenticated, authController.logout);

export default router;
