import express from "express";
import middleware from "../middleware";
import expenseValidation from "../validations/expense.validation";
import expenseController from "../controllers/expense.controller";
import commonValidation from "../validations/common.validation";

const router = express.Router();

router.post(
  "/create",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ body: expenseValidation.CreateExpenseSchema }),
  expenseController.createExpense,
);

router.get(
  "/list",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ query: expenseValidation.ListExpensesQuery }),
  expenseController.fetchExpenseList,
);

router.get(
  "/:id/details",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ params: commonValidation.IdParams }),
  expenseController.fetchExpenseDetails,
);

router.patch(
  "/:id/update",
  middleware.isAuthenticated,
  middleware.ValidateSchema({
    params: commonValidation.IdParams,
    body: expenseValidation.UpdateExpenseSchema,
  }),
  expenseController.updateExpense,
);

router.delete(
  "/:id/delete",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ params: commonValidation.IdParams }),
  expenseController.deleteExpense,
);

export default router;
