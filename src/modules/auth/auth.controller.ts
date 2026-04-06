import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../../config/db';
import { badRequest, unauthorized } from '../../utils/errors';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = (req: Request, res: Response, next: NextFunction) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return next(badRequest(JSON.stringify(result.error.flatten().fieldErrors)));
  }

  const { name, email, password, role = 'viewer' } = result.data;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return next(badRequest('Email already in use'));

  const password_hash = bcrypt.hashSync(password, 10);

  const stmt = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(name, email, password_hash, role);

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: info.lastInsertRowid, name, email, role },
  });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return next(badRequest(JSON.stringify(result.error.flatten().fieldErrors)));
  }

  const { email, password } = result.data;

  const user = db
    .prepare('SELECT * FROM users WHERE email = ? AND status = ?')
    .get(email, 'active') as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return next(unauthorized('Invalid email or password'));
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.json({ message: 'Login successful', token });
};