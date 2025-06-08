import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import express from 'express';
import { storage } from '../../server/storage';

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

// Mining configuration routes
app.get('/api/mining/configurations', async (req, res) => {
  try {
    const configs = await storage.getAllMiningConfigurations();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mining configurations' });
  }
});

app.post('/api/mining/configurations', async (req, res) => {
  try {
    const config = await storage.createMiningConfiguration(req.body);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mining configuration' });
  }
});

app.get('/api/mining/stats', async (req, res) => {
  try {
    const stats = await storage.getMiningStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mining stats' });
  }
});

app.post('/api/mining/stats', async (req, res) => {
  try {
    const stats = await storage.createMiningStats(req.body);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mining stats' });
  }
});

// Pool connection routes
app.get('/api/pools', async (req, res) => {
  try {
    const pools = await storage.getPoolConnections();
    res.json(pools);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pool connections' });
  }
});

app.post('/api/pools', async (req, res) => {
  try {
    const pool = await storage.createPoolConnection(req.body);
    res.json(pool);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pool connection' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const { path, httpMethod, headers, body, queryStringParameters } = event;
    
    // Handle OPTIONS requests for CORS
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: ''
      };
    }

    return new Promise((resolve, reject) => {
      // Create mock request and response objects
      const req = {
        method: httpMethod,
        url: path,
        headers: headers || {},
        body: body ? JSON.parse(body) : undefined,
        query: queryStringParameters || {},
        params: {}
      };

      let statusCode = 200;
      let responseHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      };
      let responseBody = '';

      const res = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          responseBody = JSON.stringify(data);
          resolve({
            statusCode,
            headers: responseHeaders,
            body: responseBody
          });
          return res;
        },
        send: (data: any) => {
          responseBody = typeof data === 'string' ? data : JSON.stringify(data);
          resolve({
            statusCode,
            headers: responseHeaders,
            body: responseBody
          });
          return res;
        },
        sendStatus: (code: number) => {
          statusCode = code;
          resolve({
            statusCode,
            headers: responseHeaders,
            body: ''
          });
          return res;
        },
        header: (name: string, value: string) => {
          responseHeaders = { ...responseHeaders, [name]: value };
          return res;
        },
        end: () => {
          resolve({
            statusCode,
            headers: responseHeaders,
            body: responseBody
          });
          return res;
        }
      };

      // Route the request through our handlers
      if (path === '/api/health' && httpMethod === 'GET') {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
      } else if (path === '/api/mining/configurations' && httpMethod === 'GET') {
        storage.getAllMiningConfigurations()
          .then(configs => res.json(configs))
          .catch(error => res.status(500).json({ error: 'Failed to fetch mining configurations' }));
      } else if (path === '/api/mining/configurations' && httpMethod === 'POST') {
        storage.createMiningConfiguration(req.body)
          .then(config => res.json(config))
          .catch(error => res.status(500).json({ error: 'Failed to create mining configuration' }));
      } else if (path === '/api/mining/stats' && httpMethod === 'GET') {
        storage.getMiningStats()
          .then(stats => res.json(stats))
          .catch(error => res.status(500).json({ error: 'Failed to fetch mining stats' }));
      } else if (path === '/api/mining/stats' && httpMethod === 'POST') {
        storage.createMiningStats(req.body)
          .then(stats => res.json(stats))
          .catch(error => res.status(500).json({ error: 'Failed to create mining stats' }));
      } else if (path === '/api/pools' && httpMethod === 'GET') {
        storage.getPoolConnections()
          .then(pools => res.json(pools))
          .catch(error => res.status(500).json({ error: 'Failed to fetch pool connections' }));
      } else if (path === '/api/pools' && httpMethod === 'POST') {
        storage.createPoolConnection(req.body)
          .then(pool => res.json(pool))
          .catch(error => res.status(500).json({ error: 'Failed to create pool connection' }));
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    });

  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Function execution error' })
    };
  }
};