import * as z from "zod"
import * as imports from "../null"
import { Decimal } from "decimal.js"
import { CompleteUser, RelatedUserModel } from "./index"

// Helper schema for Decimal fields
z
  .instanceof(Decimal)
  .or(z.string())
  .or(z.number())
  .refine((value) => {
    try {
      return new Decimal(value)
    } catch (error) {
      return false
    }
  })
  .transform((value) => new Decimal(value))

export const FinancialGoalModel = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  name: z.string(),
  target: z.number(),
  saved: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteFinancialGoal extends z.infer<typeof FinancialGoalModel> {
  user: CompleteUser
}

/**
 * RelatedFinancialGoalModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedFinancialGoalModel: z.ZodSchema<CompleteFinancialGoal> = z.lazy(() => FinancialGoalModel.extend({
  user: RelatedUserModel,
}))
