import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ensureForeignKeys, testConnection, seedDatabase } from './config/db.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      try {
        const { hostname } = new URL(origin);
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          callback(null, true);
          return;
        }
      } catch {
        // fall through to reject invalid origins
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'smart-mall-api' });
});

app.listen(port, async () => {
  try {
    const connected = await testConnection();
    await ensureForeignKeys();
    if (connected) {
      await seedDatabase();
    }

    console.log(`Smart Mall API listening on port ${port}`);
    console.log(`Database connection: ${connected ? 'connected' : 'not available'}`);
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exitCode = 1;
  }
});
