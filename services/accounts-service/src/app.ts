import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { connectDB } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import compteRoutes from './routes/compteRoutes';
import mouvementRoutes from './routes/mouvementRoutes';

// Configuration dotenv chargée via import 'dotenv/config' (avant toute autre importation)

const app: Application = express();
const HOST = process.env.HOST || '0.0.0.0';
const BASE_PORT = Number(process.env.PORT) || 3004;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// ========== MIDDLEWARES ==========

// Sécurité
app.use(helmet());

// CORS
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service bancaire en ligne',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/comptes', compteRoutes);
app.use('/api/mouvements', mouvementRoutes);

// ========== ERROR HANDLING ==========

// 404 Not Found
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ========== SERVER STARTUP ==========

// Trouve un port libre à partir d'un port de base
const findFreePort = async (startPort: number, host: string): Promise<number> => {
  const net = await import('net');
  const tryPort = (port: number): Promise<number> =>
    new Promise((resolve, reject) => {
      const tester = net.createServer()
        .once('error', (err: any) => {
          if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
            resolve(-1); // port occupé
          } else {
            reject(err);
          }
        })
        .once('listening', () => {
          tester.close(() => resolve(port));
        })
        .listen(port, host);
    });

  let port = startPort;
  for (let i = 0; i < 20; i++) {
    const res = await tryPort(port);
    if (res !== -1) return res;
    port++;
  }
  throw new Error(`Aucun port libre trouvé à partir de ${startPort}`);
};

// Empêche les démarrages multiples en mode hot-reload
let serverStarted = false;

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});

export const startServer = async (): Promise<void> => {
  if (serverStarted) {
    return; // éviter de relancer si déjà démarré
  }
  try {
    // Connexion à MongoDB
    await connectDB();

    // Recherche d'un port disponible
    const portToUse = await findFreePort(BASE_PORT, HOST);

    // Démarrage du serveur
    const server = app.listen(portToUse, HOST, async () => {
      serverStarted = true;
      console.log(`✓ Serveur démarré sur http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${portToUse}`);
      if (portToUse !== BASE_PORT) {
        console.log(`ℹ Le port ${BASE_PORT} était occupé. Utilisation du port ${portToUse}.`);
      }
      console.log(`✓ Mode: ${process.env.NODE_ENV || 'development'}`);

      // Register with service discovery
      try {
        const { ServiceRegistration } = require('../../../shared/serviceRegistration');
        const registration = new ServiceRegistration('accounts-service', portToUse);
        await registration.register();
      } catch (error) {
        console.warn('⚠️  Service discovery not available, continuing without it...');
      }
    });

    server.on('error', (err) => {
      console.error('[SERVER ERROR]', err);
    });
  } catch (error) {
    if ((error as any)?.code === 'EADDRINUSE') {
      console.error(`✗ Port ${BASE_PORT} déjà utilisé. Essayez de définir une autre valeur pour PORT ou laissez l'auto-sélection.`);
    } else {
      console.error('✗ Erreur au démarrage du serveur:', error);
    }
    process.exit(1);
  }
};

export default app;
