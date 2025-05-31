import * as z from "zod"
import * as imports from "../null"
import { Category } from "@prisma/client"
import { CompleteUser, RelatedUserModel } from "./index"

export const BillsModel = z.object({
  id: z.number().int(),
  merchantName: z.string(),
  totalAmount: z.number().int(),
  category: z.nativeEnum(Category),
  purchaseDate: z.date(),
  createdAt: z.date(),
  userId: z.number().int(),
  ocrHash: z.string().nullish(),
})

export interface CompleteBills extends z.infer<typeof BillsModel> {
  user: CompleteUser
}

/**
 * RelatedBillsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedBillsModel: z.ZodSchema<CompleteBills> = z.lazy(() => BillsModel.extend({
  user: RelatedUserModel,
}))
