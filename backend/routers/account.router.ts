import express from "express";
import middleware from "../middleware";
import accountValidation from "../validations/account.validation";
import accountController from "../controllers/account.controller";
import { avatarUpload } from "../multer";

const router = express.Router();

router.get("/me", middleware.isAuthenticated, accountController.fetchMyAccount);

router.patch(
  "/update/avatar",
  middleware.isAuthenticated,
  avatarUpload,
  accountController.updateAvatar,
);

router.patch(
  "/update",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ body: accountValidation.UpdateAccountSchema }),
  accountController.updateAccount,
);

export default router;
