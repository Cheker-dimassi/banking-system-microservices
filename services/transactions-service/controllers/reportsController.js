const Transaction = require('../models/transaction');
const { getAccount } = require('../utils/atomicity');

/**
 * Get overall transaction summary
 * GET /transactions/reports/summary
 */
async function getSummary(req, res) {
    try {
        const { startDate, endDate } = req.query;
        
        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.timestamp = {};
            if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
            if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
        }

        // Get all transactions
        const transactions = await Transaction.find({
            ...dateFilter,
            status: 'completed'
        }).lean();

        // Calculate statistics
        const summary = {
            totalTransactions: transactions.length,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalTransfers: 0,
            totalAmount: 0,
            totalDepositAmount: 0,
            totalWithdrawalAmount: 0,
            totalTransferAmount: 0,
            averageTransactionAmount: 0,
            period: {
                startDate: startDate || 'all time',
                endDate: endDate || 'all time'
            }
        };

        transactions.forEach(t => {
            const amount = t.amount || 0;
            summary.totalAmount += amount;

            switch (t.type) {
                case 'deposit':
                    summary.totalDeposits++;
                    summary.totalDepositAmount += amount;
                    break;
                case 'withdrawal':
                    summary.totalWithdrawals++;
                    summary.totalWithdrawalAmount += amount;
                    break;
                case 'internal_transfer':
                case 'interbank_transfer':
                    summary.totalTransfers++;
                    summary.totalTransferAmount += amount;
                    break;
            }
        });

        summary.averageTransactionAmount = summary.totalTransactions > 0
            ? parseFloat((summary.totalAmount / summary.totalTransactions).toFixed(2))
            : 0;

        // Round amounts
        summary.totalAmount = parseFloat(summary.totalAmount.toFixed(2));
        summary.totalDepositAmount = parseFloat(summary.totalDepositAmount.toFixed(2));
        summary.totalWithdrawalAmount = parseFloat(summary.totalWithdrawalAmount.toFixed(2));
        summary.totalTransferAmount = parseFloat(summary.totalTransferAmount.toFixed(2));

        res.json({
            success: true,
            summary
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get account-specific statistics
 * GET /transactions/reports/account/:accountId
 */
async function getAccountStatistics(req, res) {
    try {
        const { accountId } = req.params;
        const { startDate, endDate } = req.query;

        // Verify account exists
        const account = await getAccount(accountId);
        if (!account) {
            return res.status(404).json({
                success: false,
                error: `Account ${accountId} not found`
            });
        }

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.timestamp = {};
            if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
            if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
        }

        // Get transactions for this account
        const transactions = await Transaction.find({
            $or: [
                { fromAccount: accountId },
                { toAccount: accountId }
            ],
            ...dateFilter,
            status: 'completed'
        }).lean();

        const stats = {
            accountId,
            accountBalance: account.balance || 0,
            totalTransactions: transactions.length,
            incomingTransactions: 0,
            outgoingTransactions: 0,
            totalIncoming: 0,
            totalOutgoing: 0,
            netFlow: 0,
            deposits: 0,
            withdrawals: 0,
            transfers: 0,
            averageIncoming: 0,
            averageOutgoing: 0,
            period: {
                startDate: startDate || 'all time',
                endDate: endDate || 'all time'
            }
        };

        transactions.forEach(t => {
            const amount = t.amount || 0;
            const isIncoming = t.toAccount === accountId;
            const isOutgoing = t.fromAccount === accountId;

            if (isIncoming) {
                stats.incomingTransactions++;
                stats.totalIncoming += amount;
            }

            if (isOutgoing) {
                stats.outgoingTransactions++;
                stats.totalOutgoing += amount;
            }

            switch (t.type) {
                case 'deposit':
                    if (isIncoming) stats.deposits++;
                    break;
                case 'withdrawal':
                    if (isOutgoing) stats.withdrawals++;
                    break;
                case 'internal_transfer':
                case 'interbank_transfer':
                    stats.transfers++;
                    break;
            }
        });

        stats.netFlow = parseFloat((stats.totalIncoming - stats.totalOutgoing).toFixed(2));
        stats.totalIncoming = parseFloat(stats.totalIncoming.toFixed(2));
        stats.totalOutgoing = parseFloat(stats.totalOutgoing.toFixed(2));
        stats.averageIncoming = stats.incomingTransactions > 0
            ? parseFloat((stats.totalIncoming / stats.incomingTransactions).toFixed(2))
            : 0;
        stats.averageOutgoing = stats.outgoingTransactions > 0
            ? parseFloat((stats.totalOutgoing / stats.outgoingTransactions).toFixed(2))
            : 0;

        res.json({
            success: true,
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get monthly statistics
 * GET /transactions/reports/monthly
 */
async function getMonthlyStatistics(req, res) {
    try {
        const { year, month } = req.query;
        const now = new Date();
        const targetYear = year ? parseInt(year) : now.getFullYear();
        const targetMonth = month ? parseInt(month) : now.getMonth() + 1;

        // Build date range for the month
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

        const transactions = await Transaction.find({
            timestamp: {
                $gte: startDate,
                $lte: endDate
            },
            status: 'completed'
        }).lean();

        const monthlyStats = {
            year: targetYear,
            month: targetMonth,
            monthName: startDate.toLocaleString('default', { month: 'long' }),
            totalTransactions: transactions.length,
            totalAmount: 0,
            deposits: {
                count: 0,
                total: 0
            },
            withdrawals: {
                count: 0,
                total: 0
            },
            transfers: {
                count: 0,
                total: 0
            },
            dailyBreakdown: {}
        };

        transactions.forEach(t => {
            const amount = t.amount || 0;
            monthlyStats.totalAmount += amount;

            const day = new Date(t.timestamp).getDate();
            if (!monthlyStats.dailyBreakdown[day]) {
                monthlyStats.dailyBreakdown[day] = {
                    date: `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                    count: 0,
                    amount: 0
                };
            }
            monthlyStats.dailyBreakdown[day].count++;
            monthlyStats.dailyBreakdown[day].amount += amount;

            switch (t.type) {
                case 'deposit':
                    monthlyStats.deposits.count++;
                    monthlyStats.deposits.total += amount;
                    break;
                case 'withdrawal':
                    monthlyStats.withdrawals.count++;
                    monthlyStats.withdrawals.total += amount;
                    break;
                case 'internal_transfer':
                case 'interbank_transfer':
                    monthlyStats.transfers.count++;
                    monthlyStats.transfers.total += amount;
                    break;
            }
        });

        // Round amounts
        monthlyStats.totalAmount = parseFloat(monthlyStats.totalAmount.toFixed(2));
        monthlyStats.deposits.total = parseFloat(monthlyStats.deposits.total.toFixed(2));
        monthlyStats.withdrawals.total = parseFloat(monthlyStats.withdrawals.total.toFixed(2));
        monthlyStats.transfers.total = parseFloat(monthlyStats.transfers.total.toFixed(2));

        // Convert daily breakdown to array
        monthlyStats.dailyBreakdown = Object.values(monthlyStats.dailyBreakdown).map(day => ({
            ...day,
            amount: parseFloat(day.amount.toFixed(2))
        }));

        res.json({
            success: true,
            monthlyStatistics: monthlyStats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get transaction trends
 * GET /transactions/reports/trends
 */
async function getTrends(req, res) {
    try {
        const { period = '30', type } = req.query;
        const days = parseInt(period) || 30;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Build filter
        const filter = {
            timestamp: { $gte: startDate },
            status: 'completed'
        };
        if (type) {
            filter.type = type;
        }

        const transactions = await Transaction.find(filter).sort({ timestamp: 1 }).lean();

        // Group by date
        const trends = {};
        const typeStats = {
            deposit: { count: 0, total: 0 },
            withdrawal: { count: 0, total: 0 },
            internal_transfer: { count: 0, total: 0 },
            interbank_transfer: { count: 0, total: 0 }
        };

        transactions.forEach(t => {
            const date = new Date(t.timestamp).toISOString().split('T')[0];
            if (!trends[date]) {
                trends[date] = {
                    date,
                    count: 0,
                    totalAmount: 0,
                    deposits: 0,
                    withdrawals: 0,
                    transfers: 0
                };
            }

            const amount = t.amount || 0;
            trends[date].count++;
            trends[date].totalAmount += amount;

            switch (t.type) {
                case 'deposit':
                    trends[date].deposits++;
                    typeStats.deposit.count++;
                    typeStats.deposit.total += amount;
                    break;
                case 'withdrawal':
                    trends[date].withdrawals++;
                    typeStats.withdrawal.count++;
                    typeStats.withdrawal.total += amount;
                    break;
                case 'internal_transfer':
                    trends[date].transfers++;
                    typeStats.internal_transfer.count++;
                    typeStats.internal_transfer.total += amount;
                    break;
                case 'interbank_transfer':
                    trends[date].transfers++;
                    typeStats.interbank_transfer.count++;
                    typeStats.interbank_transfer.total += amount;
                    break;
            }
        });

        // Convert to array and round amounts
        const trendsArray = Object.values(trends).map(day => ({
            ...day,
            totalAmount: parseFloat(day.totalAmount.toFixed(2))
        }));

        // Round type stats
        Object.keys(typeStats).forEach(key => {
            typeStats[key].total = parseFloat(typeStats[key].total.toFixed(2));
        });

        res.json({
            success: true,
            period: `${days} days`,
            totalTransactions: transactions.length,
            typeStatistics: typeStats,
            trends: trendsArray
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    getSummary,
    getAccountStatistics,
    getMonthlyStatistics,
    getTrends
};

