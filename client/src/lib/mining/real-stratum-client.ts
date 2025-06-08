import { MiningJob, StratumMessage } from '@/types/mining';

export class RealStratumClient {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private callbacks: {
    onJob?: (job: MiningJob) => void;
    onShare?: (accepted: boolean, error?: any) => void;
    onError?: (error: string) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  } = {};

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('Stratum WebSocket connected');
        this.callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: StratumMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse stratum message:', error);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('Stratum WebSocket disconnected');
        this.callbacks.onDisconnect?.();
      };

      this.ws.onerror = (error) => {
        console.error('Stratum WebSocket error:', error);
        this.callbacks.onError?.('WebSocket connection error');
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.callbacks.onError?.('Failed to initialize connection');
    }
  }

  setCallbacks(callbacks: {
    onJob?: (job: MiningJob) => void;
    onShare?: (accepted: boolean, error?: any) => void;
    onError?: (error: string) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  connect(poolUrl: string, walletAddress: string, workerName: string) {
    if (this.ws && this.isConnected) {
      // Send pool connection request
      this.send({
        method: 'connect',
        params: [poolUrl, walletAddress, workerName]
      });
    }
  }

  submitShare(share: any) {
    if (this.ws && this.isConnected) {
      this.send({
        method: 'submit_share',
        params: [share]
      });
    }
  }

  private send(message: StratumMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(message: StratumMessage) {
    switch (message.method) {
      case 'job':
        if (message.params && message.params[0]) {
          const job: MiningJob = message.params[0];
          this.callbacks.onJob?.(job);
        }
        break;
      
      case 'share_result':
        if (message.params) {
          const [accepted, error] = message.params;
          this.callbacks.onShare?.(accepted, error);
        }
        break;
      
      case 'error':
        this.callbacks.onError?.(message.error || 'Unknown stratum error');
        break;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  getConnectionStatus() {
    return this.isConnected ? 'connected' : 'disconnected';
  }
}