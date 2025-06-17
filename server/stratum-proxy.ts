import { WebSocketServer, WebSocket } from 'ws';
import { createConnection, Socket } from 'net';
import { Server } from 'http';

export class StratumProxy {
  private wss: WebSocketServer;
  private activeConnections = new Map<WebSocket, Socket>();
  private poolJobs = new Map<WebSocket, any>();
  private minerStats = new Map<WebSocket, any>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/stratum-proxy'
    });

    this.wss.on('connection', (ws, req) => {
      this.handleWebSocketConnection(ws, req);
    });

    console.log('Production Stratum Proxy initialized - ready for real pool connections');
  }

  private handleWebSocketConnection(ws: WebSocket, req: any) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const poolHost = url.searchParams.get('host') || 'etc.2miners.com';
    const poolPort = parseInt(url.searchParams.get('port') || '1010');
    const walletAddress = url.searchParams.get('wallet') || '0x557E3d20c04e425D2e534cc296f893204D72d5BA';

    // Initialize miner stats
    this.minerStats.set(ws, {
      hashrate: 0,
      shares: { accepted: 0, rejected: 0 },
      difficulty: 1000000000,
      connected: false,
      wallet: walletAddress
    });

    console.log(`Establishing production connection to ${poolHost}:${poolPort} for wallet ${walletAddress}`);

    // Create TCP connection to real mining pool
    const poolSocket = createConnection({
      host: poolHost,
      port: poolPort,
      timeout: 30000,
      keepAlive: true
    });

    poolSocket.on('connect', () => {
      console.log(`Production mining connection established: ${poolHost}:${poolPort}`);
      this.activeConnections.set(ws, poolSocket);
      
      const stats = this.minerStats.get(ws);
      if (stats) {
        stats.connected = true;
      }

      // Send mining.subscribe request
      const subscribeMsg = {
        id: 1,
        method: 'mining.subscribe',
        params: ['EtcMiner/1.0', null]
      };
      poolSocket.write(JSON.stringify(subscribeMsg) + '\n');

      // Send mining.authorize with wallet
      const authorizeMsg = {
        id: 2,
        method: 'mining.authorize',
        params: [walletAddress, '']
      };
      poolSocket.write(JSON.stringify(authorizeMsg) + '\n');
    });

    poolSocket.on('data', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          const messages = data.toString().trim().split('\n');
          
          for (const message of messages) {
            if (!message) continue;
            
            try {
              const parsed = JSON.parse(message);
              
              // Handle mining.notify (new job)
              if (parsed.method === 'mining.notify') {
                const job = {
                  jobId: parsed.params[0],
                  headerHash: parsed.params[1],
                  target: parsed.params[6] || '0x00000000ffff0000000000000000000000000000000000000000000000000000',
                  difficulty: parsed.params[7] || '1000000000',
                  blockNumber: parseInt(parsed.params[8] || '18000000'),
                  timestamp: Date.now()
                };
                
                this.poolJobs.set(ws, job);
                
                // Forward enhanced job to client
                ws.send(JSON.stringify({
                  type: 'job',
                  data: job
                }));
              }
              
              // Handle mining.set_difficulty
              else if (parsed.method === 'mining.set_difficulty') {
                const stats = this.minerStats.get(ws);
                if (stats) {
                  stats.difficulty = parsed.params[0];
                }
                
                ws.send(JSON.stringify({
                  type: 'difficulty',
                  data: { difficulty: parsed.params[0] }
                }));
              }
              
              // Handle subscription response
              else if (parsed.id === 1 && parsed.result) {
                ws.send(JSON.stringify({
                  type: 'subscribed',
                  data: { extraNonce1: parsed.result[1], extraNonce2Size: parsed.result[2] }
                }));
              }
              
              // Handle authorization response
              else if (parsed.id === 2) {
                const authorized = parsed.result === true;
                ws.send(JSON.stringify({
                  type: 'authorized',
                  data: { authorized, wallet: walletAddress }
                }));
                
                if (authorized) {
                  console.log(`Wallet ${walletAddress} authorized for production mining`);
                }
              }
              
              // Forward raw stratum message
              ws.send(message);
              
            } catch (parseError) {
              // Forward non-JSON messages as-is
              ws.send(message);
            }
          }
        } catch (error) {
          console.error('Error processing pool data:', error);
        }
      }
    });

    poolSocket.on('error', (error) => {
      console.error(`Pool connection error for ${poolHost}:${poolPort}:`, error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1011, `Pool connection failed: ${error.message}`);
      }
    });

    poolSocket.on('close', () => {
      console.log(`Pool connection closed: ${poolHost}:${poolPort}`);
      this.activeConnections.delete(ws);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Pool connection closed');
      }
    });

    ws.on('message', (data) => {
      try {
        const message = data.toString();
        
        // Handle client mining messages
        try {
          const parsed = JSON.parse(message);
          
          // Handle share submission
          if (parsed.method === 'mining.submit') {
            const stats = this.minerStats.get(ws);
            if (stats) {
              // Forward share to pool for real submission
              poolSocket.write(message + '\n');
              
              // Track share statistics
              console.log(`Share submitted from wallet ${stats.wallet}: ${parsed.params[1]}`);
            }
          }
          // Handle hashrate reporting
          else if (parsed.type === 'hashrate') {
            const stats = this.minerStats.get(ws);
            if (stats) {
              stats.hashrate = parsed.data.rate;
            }
          }
          // Forward all other messages to pool
          else {
            poolSocket.write(message + '\n');
          }
        } catch (parseError) {
          // Forward non-JSON messages directly
          poolSocket.write(message + '\n');
        }
      } catch (error) {
        console.error('Error forwarding websocket data:', error);
        ws.close(1011, 'Failed to forward message');
      }
    });

    ws.on('close', () => {
      const socket = this.activeConnections.get(ws);
      if (socket) {
        socket.destroy();
        this.activeConnections.delete(ws);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      const socket = this.activeConnections.get(ws);
      if (socket) {
        socket.destroy();
        this.activeConnections.delete(ws);
      }
    });
  }

  getActiveConnections(): number {
    return this.activeConnections.size;
  }

  close() {
    this.activeConnections.forEach((socket, ws) => {
      socket.destroy();
      ws.close();
    });
    this.activeConnections.clear();
    this.wss.close();
  }
}