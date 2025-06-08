import { StratumMessage, MiningJob, PoolInfo } from '@/types/mining';

export class StratumClient {
  private socket: WebSocket | null = null;
  private url: string;
  private walletAddress: string;
  private workerName: string;
  private messageId = 1;
  private subscriptionId: string | null = null;
  private extraNonce1: string | null = null;
  private extraNonce2Size = 0;
  private callbacks: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onJob?: (job: MiningJob) => void;
    onDifficulty?: (difficulty: string) => void;
    onShare?: (accepted: boolean, error?: string) => void;
    onError?: (error: string) => void;
  } = {};

  constructor(url: string, walletAddress: string, workerName: string) {
    this.url = url;
    this.walletAddress = walletAddress;
    this.workerName = workerName;
  }

  setCallbacks(callbacks: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onJob?: (job: MiningJob) => void;
    onDifficulty?: (difficulty: string) => void;
    onShare?: (accepted: boolean, error?: string) => void;
    onError?: (error: string) => void;
  }) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Convert stratum+tcp:// URL to WebSocket URL
        // In production, you would need a WebSocket proxy to handle Stratum protocol
        const wsUrl = this.convertToWebSocketUrl(this.url);
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('Connected to mining pool');
          this.callbacks.onConnect?.();
          this.subscribe();
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: StratumMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse stratum message:', error);
          }
        };

        this.socket.onclose = () => {
          console.log('Disconnected from mining pool');
          this.callbacks.onDisconnect?.();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.callbacks.onError?.('Connection failed');
          reject(new Error('Failed to connect to pool'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private convertToWebSocketUrl(stratumUrl: string): string {
    // In a real implementation, this would connect to a WebSocket proxy
    // that handles the Stratum protocol conversion
    // For now, we'll use a placeholder WebSocket URL
    const url = stratumUrl.replace('stratum+tcp://', '');
    const [host, port] = url.split(':');
    
    // This would be your WebSocket proxy endpoint
    return `wss://stratum-proxy.example.com/ws?host=${host}&port=${port}`;
  }

  private subscribe() {
    const message: StratumMessage = {
      id: this.messageId++,
      method: 'mining.subscribe',
      params: ['CryptoMiner Pro/1.0.0', null]
    };

    this.send(message);
  }

  private authorize() {
    const message: StratumMessage = {
      id: this.messageId++,
      method: 'mining.authorize',
      params: [this.walletAddress, 'x']
    };

    this.send(message);
  }

  private send(message: StratumMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private handleMessage(message: StratumMessage) {
    if (message.id) {
      // Response to our request
      if (message.method === undefined) {
        this.handleResponse(message);
      }
    } else {
      // Notification from pool
      this.handleNotification(message);
    }
  }

  private handleResponse(message: StratumMessage) {
    if (message.error) {
      console.error('Stratum error:', message.error);
      this.callbacks.onError?.(message.error.toString());
      return;
    }

    // Handle subscribe response
    if (message.result && Array.isArray(message.result)) {
      if (message.result.length >= 3) {
        this.subscriptionId = message.result[1];
        this.extraNonce1 = message.result[1];
        this.extraNonce2Size = message.result[2];
        
        // After successful subscription, authorize
        this.authorize();
      }
    }

    // Handle authorize response
    if (message.result === true) {
      console.log('Successfully authorized with pool');
    }
  }

  private handleNotification(message: StratumMessage) {
    switch (message.method) {
      case 'mining.notify':
        this.handleJobNotification(message.params);
        break;
      case 'mining.set_difficulty':
        this.handleDifficultyChange(message.params[0]);
        break;
      default:
        console.log('Unknown notification:', message.method);
    }
  }

  private handleJobNotification(params: any[]) {
    if (params.length >= 8) {
      const job: MiningJob = {
        jobId: params[0],
        headerHash: params[1],
        difficulty: params[6] || '0x1000000',
        target: this.calculateTarget(params[6] || '0x1000000'),
        timestamp: Date.now()
      };

      this.callbacks.onJob?.(job);
    }
  }

  private handleDifficultyChange(difficulty: string) {
    console.log('Difficulty changed:', difficulty);
    this.callbacks.onDifficulty?.(difficulty);
  }

  private calculateTarget(difficulty: string): string {
    // Calculate target from difficulty
    // This is a simplified calculation
    try {
      const diff = BigInt(difficulty);
      const maxTarget = BigInt('0x00000000FFFF0000000000000000000000000000000000000000000000000000');
      const target = maxTarget / diff;
      return '0x' + target.toString(16).padStart(64, '0');
    } catch (error) {
      console.error('Error calculating target:', error);
      return '0x00000000FFFF0000000000000000000000000000000000000000000000000000';
    }
  }

  submitShare(jobId: string, nonce: string, mixHash: string, hash: string) {
    const message: StratumMessage = {
      id: this.messageId++,
      method: 'mining.submit',
      params: [this.walletAddress, jobId, nonce, hash, mixHash]
    };

    this.send(message);

    // Simulate response for now
    setTimeout(() => {
      // 99% acceptance rate simulation
      const accepted = Math.random() > 0.01;
      this.callbacks.onShare?.(accepted, accepted ? undefined : 'Low difficulty');
    }, 100);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket ? this.socket.readyState === WebSocket.OPEN : false;
  }

  getPoolInfo(): PoolInfo {
    return {
      name: this.url,
      url: this.url,
      status: this.isConnected() ? 'online' : 'offline',
      latency: 0, // Would be measured in real implementation
      difficulty: '4.29G',
      blockHeight: 18742156,
      networkHashrate: '24.7 TH/s'
    };
  }
}
