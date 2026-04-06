import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import db from '../../config/db';
import { badRequest, notFound, forbidden } from '../../utils/errors';

const recordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: z.string().optional(),
});

export const getRecords = (req: Request, res: Response) => {
  const { type, category, from, to } = req.query;

  let query = 'SELECT * FROM financial_records WHERE deleted_at IS NULL';
  const params: any[] = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (from) { query += ' AND date >= ?'; params.push(from); }
  if (to) { query += ' AND date <= ?'; params.push(to); }

  query += ' ORDER BY date DESC';

  const records = db.prepare(query).all(...params);
  res.json({ records });
};

export const createRecord = (req: Request, res: Response, next: NextFunction) => {
  const result = recordSchema.safeParse(req.body);
  if (!result.success) {
    return next(badRequest(JSON.stringify(result.error.flatten().fieldErrors)));
  }

  const { amount, type, category, date, notes } = result.data;
  const created_by = req.user!.id;

  const info = db
    .prepare(
      'INSERT INTO financial_records (created_by, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(created_by, amount, type, category, date, notes ?? null);

  res.status(201).json({ message: 'Record created', id: info.lastInsertRowid });
};

export const updateRecord = (req: Request, res: Response, next: NextFunction) => {
  const record = db
    .prepare('SELECT * FROM financial_records WHERE id = ? AND deleted_at IS NULL')
    .get(req.params.id) as any;

  if (!record) return next(notFound('Record not found'));

  const updateSchema = recordSchema.partial();
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    return next(badRequest(JSON.stringify(result.error.flatten().fieldErrors)));
  }

  const { amount, type, category, date, notes } = result.data;

  db.prepare(`
    UPDATE financial_records SET
      amount    = COALESCE(?, amount),
      type      = COALESCE(?, type),
      category  = COALESCE(?, category),
      date      = COALESCE(?, date),
      notes     = COALESCE(?, notes),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(amount ?? null, type ?? null, category ?? null, date ?? null, notes ?? null, req.params.id);

  res.json({ message: 'Record updated successfully' });
};

export const deleteRecord = (req: Request, res: Response, next: NextFunction) => {
  const record = db
    .prepare('SELECT * FROM financial_records WHERE id = ? AND deleted_at IS NULL')
    .get(req.params.id);

  if (!record) return next(notFound('Record not found'));

  db.prepare("UPDATE financial_records SET deleted_at = datetime('now') WHERE id = ?")
    .run(req.params.id);

  res.json({ message: 'Record deleted successfully' });
};