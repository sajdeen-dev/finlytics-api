import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import './config/db';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import recordRoutes from './modules/records/records.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { AppError } from './utils/errors';

const app = express();
if (process.env.CORS_ORIGIN === '*') {
  app.use(cors());
} else {
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:5173'];
  app.use(cors({ origin: corsOrigins }));
}
app.use(express.json());

const openApiPath = path.join(process.cwd(), 'docs', 'openapi.yaml');
const openApiDoc = YAML.parse(fs.readFileSync(openApiPath, 'utf8')) as Record<string, unknown>;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDoc, { customSiteTitle: 'Finlytics API' }));
app.get('/openapi.yaml', (_req: Request, res: Response) => {
  res.type('text/yaml; charset=utf-8').send(fs.readFileSync(openApiPath, 'utf8'));
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: AppError | Error, req: Request, res: Response, next: NextFunction) => {
  const status = (err as AppError).status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);