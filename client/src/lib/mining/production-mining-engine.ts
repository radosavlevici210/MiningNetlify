import { EthashResult, MiningJob } from '@/types/mining';
import { RealStratumClient } from './real-stratum-client';

export class ProductionMiningEngine {
  private workers: Worker[] = [];
  private stratumClient: RealStratumClient | null = null;
  private isActive = false;
  private currentJob: MiningJob | null = null;
  private hashCount = 0;
  private startTime = 0;
  private totalShares = { accepted: 0, rejected: 0 };
  private performanceInterval: number | null = null;
  
  private callbacks: {
    onHashrate?: (hashrate: number) => void;
    onShare?: (accepted: boolean, share: any) => void;
    onJob?: (job: MiningJob) => void;
    onError?: (error: string) => void;
    onStats?: (stats: any) => void;
  } = {};

  constructor() {
    this.initializeEngine();
  }

  private async initializeEngine() {
    try {
      if (typeof WebAssembly === 'undefined') {
        throw new Error('WebAssembly not supported in this browser');
      }

      this.startPerformanceMonitoring();
      console.log('Production mining engine initialized');
    } catch (error) {
      console.error('Failed to initialize mining engine:', error);
      this.callbacks.onError?.(`Engine initialization failed: ${error}`);
    }
  }

  setCallbacks(callbacks: {
    onHashrate?: (hashrate: number) => void;
    onShare?: (accepted: boolean, share: any) => void;
    onJob?: (job: MiningJob) => void;
    onError?: (error: string) => void;
    onStats?: (stats: any) => void;
  }) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  async startMining(config: {
    walletAddress: string;
    poolUrl: string;
    workerName: string;
    chain: string;
    intensity: number;
    threadCount: number;
  }) {
    try {
      this.validateConfig(config);
      
      if (this.isActive) {
        throw new Error('Mining is already active');
      }

      this.isActive = true;
      this.startTime = Date.now();
      this.hashCount = 0;
      this.totalShares = { accepted: 0, rejected: 0 };

      // Initialize Stratum client
      this.stratumClient = new RealStratumClient();
      this.stratumClient.setCallbacks({
        onJob: (job) => {
          this.currentJob = job;
          this.updateWorkersWithJob(job);
          this.callbacks.onJob?.(job);
        },
        onShare: (accepted, error) => {
          if (accepted) {
            this.totalShares.accepted++;
          } else {
            this.totalShares.rejected++;
          }
          this.callbacks.onShare?.(accepted, error);
        },
        onError: (error) => {
          this.callbacks.onError?.(error);
        }
      });
      
      this.stratumClient.connect(config.poolUrl, config.walletAddress, config.workerName);

      // Start workers
      await this.startWorkers(config.threadCount, config.intensity);

      console.log(`Mining started with ${config.threadCount} workers on ${config.chain}`);
      
    } catch (error) {
      this.isActive = false;
      console.error('Failed to start mining:', error);
      this.callbacks.onError?.(`Failed to start mining: ${error}`);
      throw error;
    }
  }

  private validateConfig(config: any) {
    if (!config.walletAddress || !config.poolUrl || !config.workerName) {
      throw new Error('Missing required configuration: wallet address, pool URL, or worker name');
    }
    if (config.threadCount < 1 || config.threadCount > 16) {
      throw new Error('Thread count must be between 1 and 16');
    }
    if (config.intensity < 1 || config.intensity > 10) {
      throw new Error('Intensity must be between 1 and 10');
    }
  }

  private async startWorkers(threadCount: number, intensity: number): Promise<void> {
    const workerPromises = [];

    for (let i = 0; i < threadCount; i++) {
      try {
        const worker = new Worker('/workers/production-mining-worker.js');
        
        worker.onmessage = (event) => {
          this.handleWorkerMessage(event.data, i);
        };

        worker.onerror = (error) => {
          console.error(`Worker ${i} error:`, error);
          this.callbacks.onError?.(`Worker ${i} error: ${error.message}`);
        };

        if (this.currentJob) {
          worker.postMessage({
            type: 'start',
            job: this.currentJob,
            workerId: i,
            intensity
          });
        }

        this.workers.push(worker);
      } catch (error) {
        console.error(`Failed to start worker ${i}:`, error);
      }
    }
  }

  private handleWorkerMessage(data: any, workerId: number) {
    switch (data.type) {
      case 'hash_found':
        this.hashCount += data.hashCount || 1;
        if (data.result && data.result.meetsTarget) {
          this.handleShare(data.result);
        }
        break;
      
      case 'error':
        console.error(`Worker ${workerId} error:`, data.error);
        this.callbacks.onError?.(data.error);
        break;
      
      case 'hashrate':
        // Individual worker hashrate update
        break;
      
      default:
        console.log(`Unknown message from worker ${workerId}:`, data);
    }
  }

  private handleShare(shareData: any) {
    if (this.stratumClient) {
      this.stratumClient.submitShare(shareData);
    }
  }

  private updateWorkersWithJob(job: MiningJob) {
    this.workers.forEach((worker, index) => {
      worker.postMessage({
        type: 'new_job',
        job,
        workerId: index
      });
    });
  }

  private startPerformanceMonitoring() {
    this.performanceInterval = window.setInterval(() => {
      if (this.isActive) {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const avgHashrate = this.hashCount / Math.max(uptime, 1);
        
        this.callbacks.onHashrate?.(avgHashrate);
        this.callbacks.onStats?.({
          uptime,
          hashrate: avgHashrate,
          shares: this.totalShares,
          workers: this.workers.length
        });
      }
    }, 2000);
  }

  stopMining() {
    try {
      this.isActive = false;
      
      this.stopWorkers();
      
      if (this.stratumClient) {
        this.stratumClient.disconnect();
        this.stratumClient = null;
      }

      if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
        this.performanceInterval = null;
      }

      console.log('Mining stopped');
    } catch (error) {
      console.error('Error stopping mining:', error);
      this.callbacks.onError?.(`Error stopping mining: ${error}`);
    }
  }

  private stopWorkers() {
    this.workers.forEach((worker, index) => {
      try {
        worker.postMessage({ type: 'stop' });
        worker.terminate();
      } catch (error) {
        console.error(`Error stopping worker ${index}:`, error);
      }
    });
    this.workers = [];
  }

  isRunning(): boolean {
    return this.isActive;
  }

  getHashrate(): number {
    if (!this.isActive || this.startTime === 0) return 0;
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return this.hashCount / Math.max(uptime, 1);
  }

  getStats() {
    const uptime = this.isActive ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    return {
      isActive: this.isActive,
      uptime,
      hashrate: this.getHashrate(),
      hashCount: this.hashCount,
      shares: { ...this.totalShares },
      workers: this.workers.length,
      connectionStatus: this.stratumClient?.getConnectionStatus() || 'disconnected'
    };
  }

  getCurrentJob(): MiningJob | null {
    return this.currentJob;
  }

  updateIntensity(intensity: number) {
    this.workers.forEach(worker => {
      worker.postMessage({
        type: 'update_intensity',
        intensity
      });
    });
  }

  destroy() {
    this.stopMining();
    this.callbacks = {};
  }
}