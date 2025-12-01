import { MouvementCompte } from '../models/MouvementCompte';
import { IMouvementCompte } from '../types';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4, validate as isUuid } from 'uuid';

export interface FilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  typeTransaction?: 'CREDIT' | 'DEBIT';
  minAmount?: number;
  maxAmount?: number;
  description?: string;
}

export interface FilteredResponse {
  transactions: IMouvementCompte[];
  total: number;
  filters: FilterOptions;
  summary: {
    totalCredits: number;
    totalDebits: number;
    netBalance: number;
    creditCount: number;
    debitCount: number;
  };
}

export class TransactionFilterService {
  /**
   * Filter transactions by multiple criteria
   */
  async filterTransactions(
    compteId: string,
    filters: FilterOptions
  ): Promise<FilteredResponse> {
    if (!isUuid(compteId)) {
      throw new AppError(400, 'ID du compte invalide');
    }

    // Build MongoDB query
    const query: any = { compteId };

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      query.dateMouvement = {};
      if (filters.dateFrom) {
        query.dateMouvement.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.dateMouvement.$lte = endDate;
      }
    }

    // Transaction type filter
    if (filters.typeTransaction) {
      query.typeMouvement = filters.typeTransaction;
    }

    // Amount range filter
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.montant = {};
      if (filters.minAmount !== undefined) {
        query.montant.$gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        query.montant.$lte = filters.maxAmount;
      }
    }

    // Description search (case insensitive partial match)
    if (filters.description) {
      query.description = { $regex: filters.description, $options: 'i' };
    }

    // Execute query
    const transactions = await MouvementCompte.find(query).sort({ dateMouvement: -1 });

    // Calculate summary statistics
    const summary = this.calculateSummary(transactions);

    return {
      transactions,
      total: transactions.length,
      filters,
      summary,
    };
  }

  /**
   * Search transactions by reference
   */
  async searchByReference(
    compteId: string,
    reference: string
  ): Promise<IMouvementCompte | null> {
    if (!isUuid(compteId)) {
      throw new AppError(400, 'ID du compte invalide');
    }

    const transaction = await MouvementCompte.findOne({
      compteId,
      referenceTransaction: reference,
    });

    return transaction;
  }

  /**
   * Get transactions paginated with filters
   */
  async getFilteredPaginated(
    compteId: string,
    filters: FilterOptions,
    page: number = 1,
    limit: number = 10
  ) {
    if (!isUuid(compteId)) {
      throw new AppError(400, 'ID du compte invalide');
    }

    if (page < 1 || limit < 1) {
      throw new AppError(400, 'Page et limit doivent être > 0');
    }

    // Build query (same as filterTransactions)
    const query: any = { compteId };

    if (filters.dateFrom || filters.dateTo) {
      query.dateMouvement = {};
      if (filters.dateFrom) {
        query.dateMouvement.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.dateMouvement.$lte = endDate;
      }
    }

    if (filters.typeTransaction) {
      query.typeMouvement = filters.typeTransaction;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.montant = {};
      if (filters.minAmount !== undefined) {
        query.montant.$gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        query.montant.$lte = filters.maxAmount;
      }
    }

    if (filters.description) {
      query.description = { $regex: filters.description, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      MouvementCompte.find(query)
        .sort({ dateMouvement: -1 })
        .skip(skip)
        .limit(limit),
      MouvementCompte.countDocuments(query),
    ]);

    const summary = this.calculateSummary(
      await MouvementCompte.find(query) // Get all for summary calculation
    );

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters,
      summary,
    };
  }

  /**
   * Calculate summary statistics from transactions
   */
  private calculateSummary(transactions: IMouvementCompte[]) {
    let totalCredits = 0;
    let totalDebits = 0;
    let creditCount = 0;
    let debitCount = 0;

    transactions.forEach((t) => {
      if (t.typeMouvement === 'CREDIT') {
        totalCredits += t.montant;
        creditCount++;
      } else {
        totalDebits += t.montant;
        debitCount++;
      }
    });

    return {
      totalCredits,
      totalDebits,
      netBalance: totalCredits - totalDebits,
      creditCount,
      debitCount,
    };
  }

  /**
   * Get monthly transaction summary
   */
  async getMonthlyStatistics(compteId: string) {
    if (!isUuid(compteId)) {
      throw new AppError(400, 'ID du compte invalide');
    }

    const transactions = await MouvementCompte.find({ compteId }).sort({ dateMouvement: -1 });

    const monthlyStats: any = {};

    transactions.forEach((t) => {
      const date = new Date(t.dateMouvement);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          totalCredits: 0,
          totalDebits: 0,
          creditCount: 0,
          debitCount: 0,
        };
      }

      if (t.typeMouvement === 'CREDIT') {
        monthlyStats[monthKey].totalCredits += t.montant;
        monthlyStats[monthKey].creditCount++;
      } else {
        monthlyStats[monthKey].totalDebits += t.montant;
        monthlyStats[monthKey].debitCount++;
      }
    });

    return monthlyStats;
  }
}

export default new TransactionFilterService();
