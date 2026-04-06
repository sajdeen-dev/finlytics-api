"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getTrends = exports.getByCategory = exports.getSummary = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getSummary = (req, res) => {
    const summary = db_1.default.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS totalIncome,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
      COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END), 0) AS netBalance,
      COUNT(*) AS totalRecords
    FROM financial_records
    WHERE deleted_at IS NULL
  `).get();
    res.json({ summary });
};
exports.getSummary = getSummary;
const getByCategory = (req, res) => {
    const data = db_1.default.prepare(`
    SELECT category, type, SUM(amount) AS total, COUNT(*) AS count
    FROM financial_records
    WHERE deleted_at IS NULL
    GROUP BY category, type
    ORDER BY total DESC
  `).all();
    res.json({ byCategory: data });
};
exports.getByCategory = getByCategory;
const getTrends = (req, res) => {
    const data = db_1.default.prepare(`
    SELECT strftime('%Y-%m', date) AS month, type, SUM(amount) AS total, COUNT(*) AS count
    FROM financial_records
    WHERE deleted_at IS NULL
    GROUP BY month, type
    ORDER BY month DESC
  `).all();
    res.json({ trends: data });
};
exports.getTrends = getTrends;
const getRecentActivity = (req, res) => {
    const records = db_1.default.prepare(`
    SELECT * FROM financial_records
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 10
  `).all();
    res.json({ recentActivity: records });
};
exports.getRecentActivity = getRecentActivity;
