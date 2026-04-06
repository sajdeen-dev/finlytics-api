"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const errors_1 = require("../utils/errors");
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next((0, errors_1.forbidden)('You do not have permission to perform this action'));
        }
        next();
    };
};
exports.requireRole = requireRole;
