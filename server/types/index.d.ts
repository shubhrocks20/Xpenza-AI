import z from 'zod'
import { BillsModel } from '../prisma/zod'

export const loginSchema = z.object({
  emailOrUsername: z.string(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
})

// export const billsSchema = BillsModel.pick({
//     merchantName: true,
//     totalAmount: true,
//     category: true,
//     purchaseDate: true,
// })
import { z } from 'zod';

export const billsSchema = z.object({
  merchantName: z.string().min(1),
  totalAmount: z.number().int().positive(),
  category: z.string().optional(),
  purchaseDate: z.string().optional(),
});

export const budgetSchema = z.object({
  totalBudget: z.number().min(0),
  spent: z.number().min(0),
});

export const financialGoalSchema = z.object({
  name: z.string().min(1),
  target: z.number().min(0),
  saved: z.number().min(0),
});

export const financialGoalUpdateSchema = z.object({
  id: z.number().int().positive(),
  target: z.number().min(0),
  saved: z.number().min(0),
});
