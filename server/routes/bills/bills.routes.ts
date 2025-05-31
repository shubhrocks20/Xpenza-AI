import { Router } from "express";
import { billController } from "./bills.controller";
import { validateData } from "../../middlewares/validationMiddleware";
import { billsSchema, budgetSchema, financialGoalSchema, financialGoalUpdateSchema } from "../../types/index.d";
import {uploadLocal} from "../../middlewares/multer";
import { authMiddleware } from "../../middlewares/authMiddleware";

const billsRouter = Router()
billsRouter.get('/', authMiddleware, billController.getFilteredBillsController)
billsRouter.post('/manual-bill', [authMiddleware, validateData(billsSchema)] ,billController.manualBill);
billsRouter.post('/auto-bill', [authMiddleware,uploadLocal.single('bill')], billController.autoBill);
billsRouter.get('/recent-uploads', authMiddleware, billController.recentUploads);
billsRouter.delete(`/:billId`, authMiddleware, billController.deleteBill);
billsRouter.get('/category-wise-spend/:category', authMiddleware, billController.categoryWiseSpend);
billsRouter.get('/all-categories-spend', authMiddleware, billController.allCategoriesSpend);
billsRouter.post('/budgets', [authMiddleware, validateData(budgetSchema)], billController.createBudget);
billsRouter.get('/budgets', authMiddleware, billController.getBudget);
billsRouter.put('/budgets', [authMiddleware, validateData(budgetSchema)], billController.updateBudget);
billsRouter.post('/financial-goals', [authMiddleware, validateData(financialGoalSchema)], billController.createFinancialGoal);
billsRouter.get('/financial-goals', authMiddleware, billController.getFinancialGoals);
billsRouter.put('/financial-goals/:id', [authMiddleware, validateData(financialGoalUpdateSchema)], billController.updateFinancialGoal);
export default billsRouter