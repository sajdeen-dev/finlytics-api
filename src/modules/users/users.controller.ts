import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import db from '../../config/db';
import { badRequest, notFound } from '../../utils/errors';

export const getAllUsers = (req: Request, res: Response) => {
  const users = db
    .prepare('SELECT id, name, email, role, status, created_at FROM users')
    .all();
  res.json({ users });
};

export const updateUserRole = (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({ role: z.enum(['viewer', 'analyst', 'admin']) });
  const result = schema.safeParse(req.body);
  if (!result.success) return next(badRequest('Role must be viewer, analyst, or admin'));

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return next(notFound('User not found'));

  db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?")
    .run(result.data.role, req.params.id);

  res.json({ message: 'Role updated successfully' });
};

export const updateUserStatus = (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({ status: z.enum(['active', 'inactive']) });
  const result = schema.safeParse(req.body);
  if (!result.success) return next(badRequest('Status must be active or inactive'));

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return next(notFound('User not found'));

  db.prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(result.data.status, req.params.id);

  res.json({ message: 'Status updated successfully' });
};