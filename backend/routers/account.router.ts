import express from "express";
import middleware from "../middleware";
import accountController from "../controllers/account.controller";

const router = express.Router();

router.get("/me", middleware.isAuthenticated, accountController.fetchMyAccount);

export default router;
