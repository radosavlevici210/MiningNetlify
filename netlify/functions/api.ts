import { Handler } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize routes without HTTP server for serverless
registerRoutes(app).then(() => {
  console.log('API routes initialized for Netlify Functions');
}).catch(error => {
  console.error('Failed to initialize API routes:', error);
});

export const handler: Handler = serverless(app);