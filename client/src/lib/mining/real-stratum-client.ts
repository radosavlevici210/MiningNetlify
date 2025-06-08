import { StratumMessage, MiningJob, PoolInfo } from '@/types/mining';

export class RealStratumClient {
  private websocket: WebSocket | null = null;
  private url: string;
  private walletAddress: string;
  private workerName: string;
  private messageId = 1;
  private subscriptionId: string | null = null;
  private extraNonce1: string | null = null;
  private extraNonce2Size = 0;
  private difficulty = 1;
  private currentJob: MiningJob | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private isConnecting = false;
  
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
    if (this.isConnecting || (this.websocket && this.websocket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        // Convert stratum+tcp to WebSocket URL for production proxy
        const wsUrl = this.convertStratumToWebSocket(this.url);
        
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
          console.log('Connected to real mining pool via WebSocket proxy');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.callbacks.onConnect?.();
          this.subscribe();
          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const message: StratumMessage = JSON.parse(event.data);
            this.handleStratumMessage(message);
          } catch (error) {
            console.error('Failed to parse stratum message:', error);
            this.callbacks.onError?.('Invalid message from pool');
          }
        };

        this.websocket.onclose = (event) => {
          console.log('Disconnected from mining pool:', event.code, event.reason);
          this.isConnecting = false;
          this.websocket = null;
          this.callbacks.onDisconnect?.();
          
          // Attempt reconnection if not intentional
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.callbacks.onError?.('Connection to pool failed');
          reject(new Error('Failed to connect to mining pool'));
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private convertStratumToWebSocket(stratumUrl: string): string {
    // Remove stratum+tcp:// prefix
    const cleanUrl = stratumUrl.replace('stratum+tcp://', '').replace('stratum://', '');
    const [host, port] = cleanUrl.split(':');
    
    // For production deployment, use a WebSocket proxy service
    // This would connect to real mining pools through a backend proxy
    const proxyUrl = import.meta.env.VITE_STRATUM_PROXY_URL || 'wss://stratum-proxy.cryptominer.app';
    
    return `${proxyUrl}/connect?host=${encodeURIComponent(host)}&port=${port}&protocol=stratum`;
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, Math.min(this.reconnectAttempts - 1, 4));
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.websocket || this.websocket.readyState === WebSocket.CLOSED) {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  private subscribe() {
    const subscribeMessage: StratumMessage = {
      id: this.messageId++,
      method: 'mining.subscribe',
      params: ['CryptoMiner-Pro/2.0.0', null]
    };

    this.sendMessage(subscribeMessage);
  }

  private authorize() {
    const authorizeMessage: StratumMessage = {
      id: this.messageId++,
      method: 'mining.authorize',
      params: [`${this.walletAddress}.${this.workerName}`, 'x']
    };

    this.sendMessage(authorizeMessage);
  }

  private sendMessage(message: StratumMessage) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  private handleStratumMessage(message: StratumMessage) {
    // Handle responses to our requests
    if (message.id !== undefined) {
      this.handleResponse(message);
    } 
    // Handle notifications from pool
    else if (message.method) {
      this.handleNotification(message);
    }
  }

  private handleResponse(message: StratumMessage) {
    if (message.error) {
      console.error('Stratum error:', message.error);
      this.callbacks.onError?.(Array.isArray(message.error) ? message.error[1] : message.error.toString());
      return;
    }

    // Handle subscription response
    if (message.result && Array.isArray(message.result) && message.result.length >= 2) {
      const [subscriptions, extraNonce1, extraNonce2Size] = message.result;
      this.extraNonce1 = extraNonce1;
      this.extraNonce2Size = extraNonce2Size || 4;
      
      console.log('Mining subscription successful:', { extraNonce1, extraNonce2Size });
      
      // Proceed to authorization
      this.authorize();
    }
    // Handle authorization response
    else if (message.result === true) {
      console.log('Worker authorization successful');
    }
    // Handle share submission response
    else if (message.result !== undefined) {
      const accepted = message.result === true;
      this.callbacks.onShare?.(accepted, accepted ? undefined : 'Share rejected by pool');
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
      case 'mining.set_extranonce':
        this.handleExtraNonceChange(message.params);
        break;
      case 'client.reconnect':
        this.handleReconnectRequest(message.params);
        break;
      default:
        console.log('Unknown stratum notification:', message.method);
    }
  }

  private handleJobNotification(params: any[]) {
    if (params.length < 8) {
      console.warn('Invalid job notification parameters');
      return;
    }

    const [
      jobId,
      prevhash,
      coinb1,
      coinb2,
      merkleTree,
      version,
      nbits,
      ntime,
      cleanJobs
    ] = params;

    // Create proper mining job
    const job: MiningJob = {
      jobId,
      headerHash: this.buildHeaderHash(prevhash, coinb1, coinb2, merkleTree, version, nbits, ntime),
      difficulty: this.difficulty.toString(),
      target: this.calculateTarget(this.difficulty),
      timestamp: Date.now()
    };

    this.currentJob = job;
    
    console.log('New mining job received:', {
      jobId,
      difficulty: this.difficulty,
      cleanJobs: cleanJobs === true
    });

    this.callbacks.onJob?.(job);
  }

  private buildHeaderHash(prevhash: string, coinb1: string, coinb2: string, merkleTree: string[], version: string, nbits: string, ntime: string): string {
    // Build the block header for mining
    // This is a simplified version - real implementation would need proper merkle root calculation
    const extraNonce2 = '00000000'; // This would be incremented by miner
    const coinbase = coinb1 + this.extraNonce1 + extraNonce2 + coinb2;
    
    // Calculate merkle root (simplified)
    let merkleRoot = this.calculateMerkleRoot(coinbase, merkleTree);
    
    // Build header (80 bytes)
    const header = version + prevhash + merkleRoot + ntime + nbits + '00000000'; // nonce placeholder
    
    return header;
  }

  private calculateMerkleRoot(coinbase: string, merkleTree: string[]): string {
    // Simplified merkle root calculation
    // Real implementation would properly hash the coinbase and apply merkle tree
    let hash = coinbase.substring(0, 64);
    
    for (const branch of merkleTree) {
      // Simplified double SHA256
      hash = hash + branch;
      hash = hash.substring(0, 64);
    }
    
    return hash.padEnd(64, '0');
  }

  private handleDifficultyChange(difficulty: number) {
    this.difficulty = difficulty;
    console.log('Pool difficulty changed to:', difficulty);
    this.callbacks.onDifficulty?.(difficulty.toString());
  }

  private handleExtraNonceChange(params: any[]) {
    if (params.length >= 2) {
      this.extraNonce1 = params[0];
      this.extraNonce2Size = params[1];
      console.log('ExtraNonce updated:', { extraNonce1: this.extraNonce1, extraNonce2Size: this.extraNonce2Size });
    }
  }

  private handleReconnectRequest(params: any[]) {
    console.log('Pool requested reconnection');
    this.disconnect();
    
    // Reconnect after a short delay
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  private calculateTarget(difficulty: number): string {
    // Calculate target from difficulty for Ethash
    const maxTarget = BigInt('0x00000000FFFF0000000000000000000000000000000000000000000000000000');
    const target = maxTarget / BigInt(Math.floor(difficulty));
    return '0x' + target.toString(16).padStart(64, '0');
  }

  submitShare(jobId: string, nonce: string, mixHash: string, result: string): void {
    if (!this.currentJob || this.currentJob.jobId !== jobId) {
      console.warn('Attempting to submit share for invalid job');
      return;
    }

    const submitMessage: StratumMessage = {
      id: this.messageId++,
      method: 'mining.submit',
      params: [
        `${this.walletAddress}.${this.workerName}`,
        jobId,
        '00000000', // extraNonce2
        nonce,
        mixHash
      ]
    };

    console.log('Submitting share:', { jobId, nonce: nonce.substring(0, 16) + '...' });
    this.sendMessage(submitMessage);
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close(1000, 'Client disconnect');
      this.websocket = null;
    }
  }

  isConnected(): boolean {
    return this.websocket ? this.websocket.readyState === WebSocket.OPEN : false;
  }

  getPoolInfo(): PoolInfo {
    return {
      name: this.url.split('//')[1] || this.url,
      url: this.url,
      status: this.isConnected() ? 'online' : 'offline',
      latency: 0, // Would be measured in real implementation
      difficulty: this.difficulty.toString(),
      blockHeight: 0, // Would be fetched from pool
      networkHashrate: '0 H/s' // Would be fetched from pool
    };
  }

  getCurrentJob(): MiningJob | null {
    return this.currentJob;
  }

  getDifficulty(): number {
    return this.difficulty;
  }
}