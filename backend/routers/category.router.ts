import express from "express";
import middleware from "../middleware";
import commonValidation from "../validations/common.validation";
import categoryValidation from "../validations/category.validation";
import categoryController from "../controllers/category.controller";

const router = express.Router();

router.post(
  "/create",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ body: categoryValidation.CreateCategorySchema }),
  categoryController.createCategory,
);

router.get(
  "/list",
  middleware.isAuthenticated,
  categoryController.fetchCategoryList,
);

router.patch(
  "/:id/update",
  middleware.isAuthenticated,
  middleware.ValidateSchema({
    params: commonValidation.IdParams,
    body: categoryValidation.UpdateCategorySchema,
  }),
  categoryController.updateCategory,
);

router.delete(
  "/:id/delete",
  middleware.isAuthenticated,
  middleware.ValidateSchema({ params: commonValidation.IdParams }),
  categoryController.deleteCategory,
);

export default router;
