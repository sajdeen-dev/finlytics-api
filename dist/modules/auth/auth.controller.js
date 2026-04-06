"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const db_1 = __importDefault(require("../../config/db"));
const errors_1 = require("../../utils/errors");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['viewer', 'analyst', 'admin']).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const register = (req, res, next) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return next((0, errors_1.badRequest)(JSON.stringify(result.error.flatten().fieldErrors)));
    }
    const { name, email, password, role = 'viewer' } = result.data;
    const existing = db_1.default.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing)
        return next((0, errors_1.badRequest)('Email already in use'));
    const password_hash = bcryptjs_1.default.hashSync(password, 10);
    const stmt = db_1.default.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, password_hash, role);
    res.status(201).json({
        message: 'User registered successfully',
        user: { id: info.lastInsertRowid, name, email, role },
    });
};
exports.register = register;
const login = (req, res, next) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return next((0, errors_1.badRequest)(JSON.stringify(result.error.flatten().fieldErrors)));
    }
    const { email, password } = result.data;
    const user = db_1.default
        .prepare('SELECT * FROM users WHERE email = ? AND status = ?')
        .get(email, 'active');
    if (!user || !bcryptjs_1.default.compareSync(password, user.password_hash)) {
        return next((0, errors_1.unauthorized)('Invalid email or password'));
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
};
exports.login = login;
