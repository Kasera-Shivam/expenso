import express from "express";
import authRouter from "./auth.router";
import accountRouter from "./account.router";
import categoryRouter from "./category.router";
import expenseRouter from "./expense.router";

const router = express.Router();

router.use("/account", authRouter);
router.use("/account", accountRouter);
router.use("/category", categoryRouter);
router.use("/expense", expenseRouter);

export default router;
