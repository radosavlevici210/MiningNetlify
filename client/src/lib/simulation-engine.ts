import type { MiningConfiguration, LogEntry, ChartDataPoint, HardwareInfo, PoolInfo, GPUInfo } from '../types/mining';

export interface SimulationMetrics {
  hashrate: number;
  shares: {
    accepted: number;
    rejected: number;
  };
  balance: number;
  dailyEarnings: number;
  temperature: number;
  powerConsumption: number;
  efficiency: number;
  uptime: number;
}

export class SimulationEngine {
  private isActive = false;
  private startTime = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private metrics: SimulationMetrics = {
    hashrate: 0,
    shares: { accepted: 0, rejected: 0 },
    balance: 0,
    dailyEarnings: 0,
    temperature: 65,
    powerConsumption: 0,
    efficiency: 0,
    uptime: 0
  };

  private callbacks: {
    onMetricsUpdate?: (metrics: SimulationMetrics) => void;
    onLogMessage?: (log: LogEntry) => void;
    onHashrateUpdate?: (data: ChartDataPoint) => void;
    onEarningsUpdate?: (data: ChartDataPoint) => void;
  } = {};

  private baseHashrate = 0;
  private targetHashrate = 0;
  private rampUpSpeed = 0;

  constructor() {
    this.initializeSimulation();
  }

  private initializeSimulation() {
    // Initialize with realistic baseline values
    this.metrics = {
      hashrate: 0,
      shares: { accepted: 0, rejected: 0 },
      balance: 0.00142857, // Small initial balance
      dailyEarnings: 0,
      temperature: 45 + Math.random() * 10, // 45-55°C idle temp
      powerConsumption: 50 + Math.random() * 20, // 50-70W idle
      efficiency: 0,
      uptime: 0
    };
  }

  setCallbacks(callbacks: any) {
    this.callbacks = callbacks;
  }

  async startSimulation(config: MiningConfiguration) {
    if (this.isActive) {
      await this.stopSimulation();
    }

    this.isActive = true;
    this.startTime = Date.now();
    
    // Calculate target hashrate based on configuration
    this.calculateTargetHashrate(config);
    
    this.log('info', 'Simulation', `Starting simulation mining for ${config.chain.toUpperCase()}`);
    this.log('info', 'Pool', `Connecting to simulation pool: ${config.poolUrl}`);
    this.log('success', 'Connection', 'Connected to simulation mining pool');
    this.log('info', 'Worker', `Initializing ${config.threadCount} simulation workers`);
    this.log('success', 'Mining', 'Simulation mining started successfully');

    // Start the simulation loop
    this.intervalId = setInterval(() => {
      this.updateSimulation(config);
    }, 1000); // Update every second

    return true;
  }

  private calculateTargetHashrate(config: MiningConfiguration) {
    // Base hashrate calculation based on configuration
    const baseRate = 25.0; // Base MH/s
    const intensityMultiplier = config.intensity / 10;
    const threadMultiplier = Math.sqrt(config.threadCount) / 2;
    
    this.targetHashrate = baseRate * intensityMultiplier * threadMultiplier;
    this.baseHashrate = this.targetHashrate * 0.8; // Start at 80% of target
    this.rampUpSpeed = (this.targetHashrate - this.baseHashrate) / 30; // Ramp up over 30 seconds
  }

  private updateSimulation(config: MiningConfiguration) {
    if (!this.isActive) return;

    const now = Date.now();
    this.metrics.uptime = Math.floor((now - this.startTime) / 1000);

    // Update hashrate with realistic ramping
    if (this.metrics.hashrate < this.targetHashrate) {
      this.metrics.hashrate = Math.min(
        this.targetHashrate,
        this.metrics.hashrate + this.rampUpSpeed + (Math.random() - 0.5) * 2
      );
    } else {
      // Add realistic variance
      const variance = this.targetHashrate * 0.05; // 5% variance
      this.metrics.hashrate = this.targetHashrate + (Math.random() - 0.5) * variance;
    }

    // Update shares (accept rate ~98%)
    if (Math.random() < 0.02) { // 2% chance per second
      if (Math.random() < 0.98) {
        this.metrics.shares.accepted++;
        this.log('success', 'Share', `Share accepted! Total: ${this.metrics.shares.accepted}`);
      } else {
        this.metrics.shares.rejected++;
        this.log('warning', 'Share', `Share rejected. Total rejected: ${this.metrics.shares.rejected}`);
      }
    }

    // Update temperature based on hashrate
    const targetTemp = 65 + (this.metrics.hashrate / this.targetHashrate) * 25; // 65-90°C
    this.metrics.temperature += (targetTemp - this.metrics.temperature) * 0.1;

    // Update power consumption
    const targetPower = 150 + (this.metrics.hashrate / this.targetHashrate) * 200; // 150-350W
    this.metrics.powerConsumption += (targetPower - this.metrics.powerConsumption) * 0.1;

    // Calculate efficiency (MH/s per Watt)
    this.metrics.efficiency = this.metrics.powerConsumption > 0 
      ? this.metrics.hashrate / this.metrics.powerConsumption * 1000 
      : 0;

    // Update earnings (very simplified calculation)
    const earningsPerSecond = (this.metrics.hashrate / 1000000) * 0.000001; // Simplified
    this.metrics.balance += earningsPerSecond;
    this.metrics.dailyEarnings = earningsPerSecond * 86400; // Projected daily

    // Trigger callbacks
    this.callbacks.onMetricsUpdate?.(this.metrics);
    
    // Add chart data points every 10 seconds
    if (this.metrics.uptime % 10 === 0) {
      this.callbacks.onHashrateUpdate?.({
        timestamp: now,
        value: this.metrics.hashrate
      });
      
      this.callbacks.onEarningsUpdate?.({
        timestamp: now,
        value: this.metrics.balance
      });
    }

    // Random events
    this.simulateRandomEvents();
  }

  private simulateRandomEvents() {
    const random = Math.random();
    
    // Pool difficulty adjustment (rare)
    if (random < 0.001) {
      this.log('info', 'Pool', 'Pool difficulty adjusted');
    }
    
    // New block found (very rare)
    if (random < 0.0005) {
      this.log('success', 'Network', 'New block found on network!');
    }
    
    // Temperature warning (if too hot)
    if (this.metrics.temperature > 85 && random < 0.01) {
      this.log('warning', 'Hardware', `High temperature detected: ${Math.round(this.metrics.temperature)}°C`);
    }
  }

  async stopSimulation() {
    if (!this.isActive) return;

    this.isActive = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.log('info', 'Mining', 'Stopping simulation mining...');
    this.log('success', 'Mining', 'Simulation mining stopped');

    // Reset hashrate gradually
    const resetInterval = setInterval(() => {
      this.metrics.hashrate *= 0.9;
      if (this.metrics.hashrate < 1) {
        this.metrics.hashrate = 0;
        clearInterval(resetInterval);
      }
      this.callbacks.onMetricsUpdate?.(this.metrics);
    }, 100);
  }

  private log(level: 'info' | 'success' | 'warning' | 'error', source: string, message: string) {
    const logEntry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      source,
      message
    };
    this.callbacks.onLogMessage?.(logEntry);
  }

  getMetrics(): SimulationMetrics {
    return { ...this.metrics };
  }

  isSimulationActive(): boolean {
    return this.isActive;
  }

  // Get mock hardware info for simulation
  getSimulatedHardware(): HardwareInfo {
    const gpu: GPUInfo = {
      id: 0,
      name: 'NVIDIA RTX 4090 (Simulated)',
      temperature: Math.round(this.metrics.temperature),
      power: Math.round(this.metrics.powerConsumption),
      memory: {
        used: Math.round(12000 + Math.random() * 8000),
        total: 24576
      },
      hashrate: Math.round(this.metrics.hashrate),
      status: this.isActive ? 'active' : 'idle'
    };

    return {
      gpus: [gpu],
      totalPower: Math.round(this.metrics.powerConsumption),
      efficiency: Math.round(this.metrics.efficiency * 100) / 100
    };
  }

  // Get mock pool info for simulation
  getSimulatedPoolInfo(): PoolInfo {
    return {
      name: 'Simulation Pool',
      url: 'sim://simulation-pool.example.com:4444',
      status: this.isActive ? 'online' : 'offline',
      latency: Math.round(25 + Math.random() * 10),
      difficulty: '4.52T',
      blockHeight: 18500000 + Math.floor(Math.random() * 1000),
      networkHashrate: '180.5 TH/s'
    };
  }
}

export const simulationEngine = new SimulationEngine();