import express from "express";
import middleware from "../middleware";
import categoryValidation from "../validations/category.validation";
import categoryController from "../controllers/category.controller";

const router = express.Router();

router.post(
  "/create",
  middleware.isAuthenticated,
  middleware.ValidateSchema(categoryValidation.CreateCategorySchema),
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
  middleware.ValidateSchema(categoryValidation.UpdateCategorySchema),
  categoryController.updateCategory,
);

router.delete(
  "/:id/delete",
  middleware.isAuthenticated,
  categoryController.deleteCategory,
);

export default router;
