import express from "express";
import middleware from "../middleware";
import budgetValidation from "../validations/budget.validation";
import budgetController from "../controllers/budget.controller";

const router = express.Router();

router.get(
  "/",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ query: budgetValidation.MonthQuery }),
  budgetController.fetchBudget,
);

router.put(
  "/",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ body: budgetValidation.UpsertBudgetSchema }),
  budgetController.upsertBudget,
);

router.delete(
  "/",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ query: budgetValidation.MonthQuery }),
  budgetController.deleteBudget,
);

export default router;
