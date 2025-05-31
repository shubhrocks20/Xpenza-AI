import * as z from "zod"
import * as imports from "../null"
import { AuthProvider } from "@prisma/client"
import { CompleteBills, RelatedBillsModel, CompleteBudget, RelatedBudgetModel, CompleteFinancialGoal, RelatedFinancialGoalModel } from "./index"

export const UserModel = z.object({
  id: z.number().int(),
  email: z.string(),
  username: z.string().nullish(),
  password: z.string().nullish(),
  avatar: z.string().nullish(),
  authProvider: z.nativeEnum(AuthProvider),
  providerId: z.string().nullish(),
  createdAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  bills: CompleteBills[]
  budgets: CompleteBudget[]
  financialGoals: CompleteFinancialGoal[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  bills: RelatedBillsModel.array(),
  budgets: RelatedBudgetModel.array(),
  financialGoals: RelatedFinancialGoalModel.array(),
}))
