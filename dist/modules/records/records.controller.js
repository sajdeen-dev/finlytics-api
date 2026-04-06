"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecord = exports.updateRecord = exports.createRecord = exports.getRecords = void 0;
const zod_1 = require("zod");
const db_1 = __importDefault(require("../../config/db"));
const errors_1 = require("../../utils/errors");
const recordSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Amount must be positive'),
    type: zod_1.z.enum(['income', 'expense']),
    category: zod_1.z.string().min(1, 'Category is required'),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    notes: zod_1.z.string().optional(),
});
const getRecords = (req, res) => {
    const { type, category, from, to } = req.query;
    let query = 'SELECT * FROM financial_records WHERE deleted_at IS NULL';
    const params = [];
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (from) {
        query += ' AND date >= ?';
        params.push(from);
    }
    if (to) {
        query += ' AND date <= ?';
        params.push(to);
    }
    query += ' ORDER BY date DESC';
    const records = db_1.default.prepare(query).all(...params);
    res.json({ records });
};
exports.getRecords = getRecords;
const createRecord = (req, res, next) => {
    const result = recordSchema.safeParse(req.body);
    if (!result.success) {
        return next((0, errors_1.badRequest)(JSON.stringify(result.error.flatten().fieldErrors)));
    }
    const { amount, type, category, date, notes } = result.data;
    const created_by = req.user.id;
    const info = db_1.default
        .prepare('INSERT INTO financial_records (created_by, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)')
        .run(created_by, amount, type, category, date, notes ?? null);
    res.status(201).json({ message: 'Record created', id: info.lastInsertRowid });
};
exports.createRecord = createRecord;
const updateRecord = (req, res, next) => {
    const record = db_1.default
        .prepare('SELECT * FROM financial_records WHERE id = ? AND deleted_at IS NULL')
        .get(req.params.id);
    if (!record)
        return next((0, errors_1.notFound)('Record not found'));
    const updateSchema = recordSchema.partial();
    const result = updateSchema.safeParse(req.body);
    if (!result.success) {
        return next((0, errors_1.badRequest)(JSON.stringify(result.error.flatten().fieldErrors)));
    }
    const { amount, type, category, date, notes } = result.data;
    db_1.default.prepare(`
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
exports.updateRecord = updateRecord;
const deleteRecord = (req, res, next) => {
    const record = db_1.default
        .prepare('SELECT * FROM financial_records WHERE id = ? AND deleted_at IS NULL')
        .get(req.params.id);
    if (!record)
        return next((0, errors_1.notFound)('Record not found'));
    db_1.default.prepare("UPDATE financial_records SET deleted_at = datetime('now') WHERE id = ?")
        .run(req.params.id);
    res.json({ message: 'Record deleted successfully' });
};
exports.deleteRecord = deleteRecord;
