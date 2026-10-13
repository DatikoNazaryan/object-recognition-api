import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'node:path';

import authRoutes from './routes/auth.routes.js';
import recognitionRoutes from './routes/recognition.routes.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'))

app.get('/', (_req, res) => {
  res.json({
    message: 'Object Recognition API is running',
  });
});
app.use('/api/auth', authRoutes,);
app.use('/api/recognitions', recognitionRoutes,);
app.use('/uploads',
  express.static(path.resolve('uploads'),),
);

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `🚀 Server running on http://0.0.0.0:${PORT}`,
    );
  },
);