import { Category } from "@prisma/client";
import { prisma } from "../../prisma";
import crypto from "crypto";
export const fetchRecentUploads = async (providerId: string) => {
  try {
    const userId = await prisma.user.findUnique({
      where: {
        providerId: providerId,
      },
      select: {
        id: true,
      },
    });
    if (!userId) {
      throw new Error("User not found");
    }
    const uploads = await prisma.bills.findMany({
      where: {
        userId: userId.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    return uploads;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const storeManualBill = async (
  merchantName: string,
  totalAmount: number,
  category: string,
  purchaseDate: Date,
  providerId: string
) => {
  try {
    const userId = await prisma.user.findUnique({
      where: {
        providerId: providerId,
      },
      select: {
        id: true,
      },
    });
    if (!userId) {
      throw new Error("User not found");
    }

    const bill = await prisma.bills.create({
      data: {
        merchantName,
        totalAmount,
        category: category as Category,
        purchaseDate,
        userId: Number(userId.id),
      },
    });
    return bill;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const deleteBillService = async (billId: string) => {
  try {
    const bill = await prisma.bills.delete({
      where: {
        id: Number(billId),
      },
    });
    return bill;
  } catch (error: any) {
    throw new Error(error);
  }
};
export function isInvalidOCR(ocrResult: any): boolean {
  if (!ocrResult || !ocrResult.result) return true; // Missing result = invalid

  const {
    establishment,
    date,
    total,
    totalConfidence,
    establishmentConfidence,
    dateConfidence,
  } = ocrResult.result;

  // Ensure required fields exist
  const hasValidFields =
    Boolean(establishment?.trim()) && Boolean(date?.trim()) && total > 0;

  // Ensure at least one confidence score is strong enough
  const hasStrongConfidence =
    (totalConfidence ?? 0) >= 0.3 ||
    (establishmentConfidence ?? 0) >= 0.3 ||
    (dateConfidence ?? 0) >= 0.3;

  // Debugging logs
  console.log("Debugging OCR Validation:", {
    hasValidFields,
    hasStrongConfidence,
  });

  // Return false (valid) if all checks pass
  return !(hasValidFields && hasStrongConfidence);
}
export function generateOcrHash(ocrData: any): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(ocrData))
    .digest("hex");
}

export async function getCategorySpend(category: Category, providerId: string) {
  if (!Object.values(Category).includes(category as Category)) {
    return { success: false, message: "Category is not valid" };
  }
  const userId = await prisma.user.findUnique({
    where: {
      providerId: providerId,
    },
    select: {
      id: true,
    },
  });
  if (!userId) {
    throw new Error("User not found");
  }
  const spend = await prisma.bills.aggregate({
    where: {
      category: category,
      userId: Number(userId.id),
    },
    _sum: {
      totalAmount: true,
    },
  });
  return {
    success: true,
    message: "Bills found for this category",
    data: spend._sum.totalAmount || 0,
  };
}

export async function getAllCategorySpend(providerId: string) {
  const user = await prisma.user.findUnique({
    where: {
      providerId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const spend = await prisma.bills.groupBy({
    by: ["category"],
    where: {
      userId: user.id,
    },
    _sum: {
      totalAmount: true,
    },
  });

  const spendMap = new Map<string, number>();
  spend.forEach((item) => {
    spendMap.set(item.category, item._sum.totalAmount ?? 0);
  });

  const allCategorySpend = Object.values(Category).map((category) => ({
    category,
    totalAmount: spendMap.get(category) ?? 0,
  }));

  return {
    success: true,
    message: "All category spend fetched successfully",
    data: allCategorySpend,
  };
}

export async function getFilteredBills({
  from,
  to,
  categories,
  providerId,
}: {
  from?: string;
  to?: string;
  categories?: string[];
  providerId: string;
}) {
  const user = await prisma.user.findUnique({
    where: { providerId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const where: any = { userId: user.id };

  if (from || to) {
    where.purchaseDate = {};
    if (from) where.purchaseDate.gte = new Date(from);
    if (to) where.purchaseDate.lte = new Date(to);
  }

  if (categories && categories.length > 0) {
    where.category = { in: categories as Category[] };
  }

  const bills = await prisma.bills.findMany({
    where,
    orderBy: { purchaseDate: "desc" },
  });

  return {
    success: true,
    message: "Bills fetched successfully",
    data: bills,
  };
}

export async function getFilteredBillsService(filters: {
  providerId: string;
  from?: string;
  to?: string;
  categories?: string[];
  search?: string;
  sortBy?: "purchaseDate" | "totalAmount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}) {
  const {
    providerId,
    from,
    to,
    categories,
    search,
    sortBy = "purchaseDate",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filters;
  console.log('Categories,,,', categories)

  const user = await prisma.user.findUnique({
    where: { providerId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  const where: any = { userId: user.id };

  if (from || to) {
    where.purchaseDate = {};
    if (from) where.purchaseDate.gte = new Date(from);
    if (to) where.purchaseDate.lte = new Date(to);
  }

  if (categories && categories.length > 0) {
    console.log('Executing Categories:', categories)
    where.category = { in: categories };
  }

  if (search) {
    where.merchantName = { contains: search, mode: "insensitive" };
  }

  const bills = await prisma.bills.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  });

  const totalCount = await prisma.bills.count({ where });

  const totalSpendResult = await prisma.bills.aggregate({
    where,
    _sum: { totalAmount: true },
  });

  const grouped = await prisma.bills.groupBy({
    by: ["category"],
    where,
    _sum: { totalAmount: true },
  });

  const allCategories = Object.values(Category);
  const categoryWiseTotals = allCategories.map((category) => {
    const match = grouped.find((g) => g.category === category);
    return {
      category,
      totalAmount: match?._sum.totalAmount ?? 0,
    };
  });

  return {
    bills,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
    totalSpend: totalSpendResult._sum.totalAmount ?? 0,
    categoryWiseTotals,
  };
}

