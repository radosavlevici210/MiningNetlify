import { WebSocketServer, WebSocket } from 'ws';
import { createConnection, Socket } from 'net';
import { Server } from 'http';

export class StratumProxy {
  private wss: WebSocketServer;
  private activeConnections = new Map<WebSocket, Socket>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/stratum-proxy'
    });

    this.wss.on('connection', (ws, req) => {
      this.handleWebSocketConnection(ws, req);
    });
  }

  private handleWebSocketConnection(ws: WebSocket, req: any) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const poolHost = url.searchParams.get('host');
    const poolPort = parseInt(url.searchParams.get('port') || '4444');

    if (!poolHost || !poolPort) {
      ws.close(1002, 'Invalid pool parameters');
      return;
    }

    // Create TCP connection to real mining pool
    const poolSocket = createConnection({
      host: poolHost,
      port: poolPort,
      timeout: 10000
    });

    poolSocket.on('connect', () => {
      console.log(`Connected to pool: ${poolHost}:${poolPort}`);
      this.activeConnections.set(ws, poolSocket);
    });

    poolSocket.on('data', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          // Forward stratum data from pool to websocket
          ws.send(data.toString());
        } catch (error) {
          console.error('Error forwarding pool data:', error);
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
        // Forward stratum messages from websocket to pool
        const message = data.toString();
        poolSocket.write(message + '\n');
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