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
      // Check for WebAssembly support
      if (typeof WebAssembly === 'undefined') {
        throw new Error('WebAssembly not supported in this browser');
      }

      // Initialize performance monitoring
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
    threadCount: number;
    intensity: number;
  }): Promise<void> {
    try {
      if (this.isActive) {
        throw new Error('Mining is already active');
      }

      // Validate configuration
      this.validateConfig(config);

      // Initialize stratum connection
      this.stratumClient = new RealStratumClient(
        config.poolUrl,
        config.walletAddress,
        config.workerName
      );

      this.stratumClient.setCallbacks({
        onConnect: () => {
          console.log('Connected to mining pool');
        },
        onJob: (job) => {
          this.currentJob = job;
          this.callbacks.onJob?.(job);
          this.updateWorkersWithJob(job);
        },
        onShare: (accepted, error) => {
          if (accepted) {
            this.totalShares.accepted++;
          } else {
            this.totalShares.rejected++;
          }
          this.callbacks.onShare?.(accepted, { accepted, error });
        },
        onError: (error) => {
          console.error('Pool error:', error);
          this.callbacks.onError?.(error);
        }
      });

      // Connect to pool
      await this.stratumClient.connect();

      // Start mining workers
      await this.startWorkers(config.threadCount, config.intensity);

      this.isActive = true;
      this.startTime = Date.now();

      console.log(`Mining started with ${config.threadCount} workers at intensity ${config.intensity}`);

    } catch (error) {
      console.error('Failed to start mining:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private validateConfig(config: any) {
    if (!config.walletAddress || config.walletAddress.length < 20) {
      throw new Error('Valid wallet address required');
    }
    if (!config.poolUrl || !config.poolUrl.includes('://')) {
      throw new Error('Valid pool URL required');
    }
    if (!config.workerName || config.workerName.length < 1) {
      throw new Error('Worker name required');
    }
    if (config.threadCount < 1 || config.threadCount > 32) {
      throw new Error('Thread count must be between 1-32');
    }
    if (config.intensity < 1 || config.intensity > 10) {
      throw new Error('Intensity must be between 1-10');
    }
  }

  private async startWorkers(threadCount: number, intensity: number): Promise<void> {
    // Terminate existing workers
    this.stopWorkers();

    for (let i = 0; i < threadCount; i++) {
      try {
        const worker = new Worker('/workers/mining-worker.js');
        
        worker.onmessage = (event) => {
          this.handleWorkerMessage(event.data, i);
        };

        worker.onerror = (error) => {
          console.error(`Worker ${i} error:`, error);
          this.callbacks.onError?.(error.message);
        };

        // Start worker with current job if available
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
      case 'hashrate':
        this.hashCount += data.data.rate;
        break;
        
      case 'share':
        this.handleShare(data.data);
        break;
        
      case 'error':
        console.error(`Worker ${workerId} error:`, data.data.message);
        this.callbacks.onError?.(data.data.message);
        break;
        
      case 'status':
        console.log(`Worker ${workerId}: ${data.data.message}`);
        break;
    }
  }

  private handleShare(shareData: any) {
    if (!this.stratumClient || !this.currentJob) {
      console.warn('Cannot submit share: no pool connection or job');
      return;
    }

    // Submit share to pool
    this.stratumClient.submitShare(
      this.currentJob.jobId,
      shareData.nonce,
      shareData.mixHash,
      shareData.hash
    );

    console.log('Share submitted:', {
      job: this.currentJob.jobId,
      nonce: shareData.nonce.substring(0, 16) + '...'
    });
  }

  private updateWorkersWithJob(job: MiningJob) {
    this.workers.forEach((worker, index) => {
      worker.postMessage({
        type: 'update_job',
        job
      });
    });
  }

  private startPerformanceMonitoring() {
    setInterval(() => {
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
      
      // Stop workers
      this.stopWorkers();
      
      // Disconnect from pool
      if (this.stratumClient) {
        this.stratumClient.disconnect();
        this.stratumClient = null;
      }

      console.log('Mining stopped');
      
    } catch (error) {
      console.error('Error stopping mining:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : String(error));
    }
  }

  private stopWorkers() {
    this.workers.forEach(worker => {
      worker.postMessage({ type: 'stop' });
      worker.terminate();
    });
    this.workers = [];
  }

  isRunning(): boolean {
    return this.isActive;
  }

  getHashrate(): number {
    if (!this.isActive || !this.startTime) return 0;
    const elapsed = Math.max((Date.now() - this.startTime) / 1000, 1);
    return this.hashCount / elapsed;
  }

  getStats() {
    return {
      isActive: this.isActive,
      uptime: this.isActive ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
      hashrate: this.getHashrate(),
      shares: this.totalShares,
      workers: this.workers.length,
      poolConnected: this.stratumClient?.isConnected() || false
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