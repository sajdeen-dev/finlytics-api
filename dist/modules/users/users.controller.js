"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.updateUserRole = exports.getAllUsers = void 0;
const zod_1 = require("zod");
const db_1 = __importDefault(require("../../config/db"));
const errors_1 = require("../../utils/errors");
const getAllUsers = (req, res) => {
    const users = db_1.default
        .prepare('SELECT id, name, email, role, status, created_at FROM users')
        .all();
    res.json({ users });
};
exports.getAllUsers = getAllUsers;
const updateUserRole = (req, res, next) => {
    const schema = zod_1.z.object({ role: zod_1.z.enum(['viewer', 'analyst', 'admin']) });
    const result = schema.safeParse(req.body);
    if (!result.success)
        return next((0, errors_1.badRequest)('Role must be viewer, analyst, or admin'));
    const user = db_1.default.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user)
        return next((0, errors_1.notFound)('User not found'));
    db_1.default.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?")
        .run(result.data.role, req.params.id);
    res.json({ message: 'Role updated successfully' });
};
exports.updateUserRole = updateUserRole;
const updateUserStatus = (req, res, next) => {
    const schema = zod_1.z.object({ status: zod_1.z.enum(['active', 'inactive']) });
    const result = schema.safeParse(req.body);
    if (!result.success)
        return next((0, errors_1.badRequest)('Status must be active or inactive'));
    const user = db_1.default.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user)
        return next((0, errors_1.notFound)('User not found'));
    db_1.default.prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?")
        .run(result.data.status, req.params.id);
    res.json({ message: 'Status updated successfully' });
};
exports.updateUserStatus = updateUserStatus;
