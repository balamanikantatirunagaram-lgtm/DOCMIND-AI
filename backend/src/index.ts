import express from 'express';
import https from 'https';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/documents.routes';
import aiRoutes from './routes/ai.routes';
import folderRoutes from './routes/folders.routes';

config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;


if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Render Free Tier sleep prevention
    const SELF_URL = process.env.RENDER_EXTERNAL_URL || 'https://docmind-ai-vmtb.onrender.com';
    setInterval(() => {
      https.get(SELF_URL + '/health', (res) => {
        console.log(`[Self-Ping] Status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error('[Self-Ping] Error:', err.message);
      });
    }, 14 * 60 * 1000); // Ping every 14 minutes
  });
}


export default app;
