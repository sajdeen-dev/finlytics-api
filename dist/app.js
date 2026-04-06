"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
require("./config/db");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const records_routes_1 = __importDefault(require("./modules/records/records.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const app = (0, express_1.default)();
if (process.env.CORS_ORIGIN === '*') {
    app.use((0, cors_1.default)());
}
else {
    const corsOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
        : ['http://localhost:5173'];
    app.use((0, cors_1.default)({ origin: corsOrigins }));
}
app.use(express_1.default.json());
const openApiPath = path_1.default.join(process.cwd(), 'docs', 'openapi.yaml');
const openApiDoc = yaml_1.default.parse(fs_1.default.readFileSync(openApiPath, 'utf8'));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openApiDoc, { customSiteTitle: 'Finlytics API' }));
app.get('/openapi.yaml', (_req, res) => {
    res.type('text/yaml; charset=utf-8').send(fs_1.default.readFileSync(openApiPath, 'utf8'));
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/records', records_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT);
