import { Request, Response } from 'express';
import db from '../../config/db';

export const getSummary = (req: Request, res: Response) => {
  const summary = db.prepare(`
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

export const getByCategory = (req: Request, res: Response) => {
  const data = db.prepare(`
    SELECT category, type, SUM(amount) AS total, COUNT(*) AS count
    FROM financial_records
    WHERE deleted_at IS NULL
    GROUP BY category, type
    ORDER BY total DESC
  `).all();

  res.json({ byCategory: data });
};

export const getTrends = (req: Request, res: Response) => {
  const data = db.prepare(`
    SELECT strftime('%Y-%m', date) AS month, type, SUM(amount) AS total, COUNT(*) AS count
    FROM financial_records
    WHERE deleted_at IS NULL
    GROUP BY month, type
    ORDER BY month DESC
  `).all();

  res.json({ trends: data });
};

export const getRecentActivity = (req: Request, res: Response) => {
  const records = db.prepare(`
    SELECT * FROM financial_records
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 10
  `).all();

  res.json({ recentActivity: records });
};