import { MiningState, MiningStats, LogEntry, ChartDataPoint } from '@/types/mining';

class MiningStateManager {
  private state: MiningState = {
    isActive: false,
    connectionStatus: 'disconnected',
    currentHashrate: 0,
    shares: {
      accepted: 0,
      rejected: 0
    },
    balance: 0,
    uptime: 0,
    currentChain: 'etc',
    startTime: null
  };

  private stats: MiningStats = {
    hashrate: 0,
    sharesAccepted: 0,
    sharesRejected: 0,
    earnings: 0,
    uptime: 0,
    temperature: 0,
    powerConsumption: 0
  };

  private logs: LogEntry[] = [];
  private hashrateHistory: ChartDataPoint[] = [];
  private earningsHistory: ChartDataPoint[] = [];
  private listeners: ((state: MiningState) => void)[] = [];

  constructor() {
    this.initializeHistory();
  }

  private initializeHistory() {
    const now = Date.now();
    for (let i = 19; i >= 0; i--) {
      this.hashrateHistory.push({
        timestamp: now - (i * 60000), // 1 minute intervals
        value: 0
      });
      this.earningsHistory.push({
        timestamp: now - (i * 60000),
        value: 0
      });
    }
  }

  subscribe(listener: (state: MiningState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): MiningState {
    return { ...this.state };
  }

  getStats(): MiningStats {
    return { ...this.stats };
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getHashrateHistory(): ChartDataPoint[] {
    return [...this.hashrateHistory];
  }

  getEarningsHistory(): ChartDataPoint[] {
    return [...this.earningsHistory];
  }

  updateState(updates: Partial<MiningState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  updateStats(updates: Partial<MiningStats>) {
    this.stats = { ...this.stats, ...updates };
    
    // Update history if hashrate changed
    if (updates.hashrate !== undefined) {
      this.addHashrateDataPoint(updates.hashrate);
    }
    
    // Update earnings history if earnings changed
    if (updates.earnings !== undefined) {
      this.addEarningsDataPoint(updates.earnings);
    }
  }

  addLog(entry: Omit<LogEntry, 'timestamp'>) {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    
    // Keep only last 100 entries
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }

  private addHashrateDataPoint(hashrate: number) {
    const now = Date.now();
    this.hashrateHistory.push({
      timestamp: now,
      value: hashrate
    });
    
    // Keep only last 20 data points
    if (this.hashrateHistory.length > 20) {
      this.hashrateHistory = this.hashrateHistory.slice(-20);
    }
  }

  private addEarningsDataPoint(earnings: number) {
    const now = Date.now();
    this.earningsHistory.push({
      timestamp: now,
      value: earnings
    });
    
    // Keep only last 20 data points
    if (this.earningsHistory.length > 20) {
      this.earningsHistory = this.earningsHistory.slice(-20);
    }
  }

  startMining() {
    this.updateState({
      isActive: true,
      startTime: Date.now(),
      connectionStatus: 'connecting'
    });
    
    this.addLog({
      level: 'info',
      source: 'SYSTEM',
      message: 'Mining session started'
    });
  }

  stopMining() {
    this.updateState({
      isActive: false,
      startTime: null,
      connectionStatus: 'disconnected'
    });
    
    this.addLog({
      level: 'info',
      source: 'SYSTEM',
      message: 'Mining session stopped'
    });
  }

  incrementShares(accepted: boolean) {
    if (accepted) {
      this.state.shares.accepted++;
      this.stats.sharesAccepted++;
      this.addLog({
        level: 'success',
        source: 'POOL',
        message: `Share accepted! Total: ${this.state.shares.accepted}`
      });
    } else {
      this.state.shares.rejected++;
      this.stats.sharesRejected++;
      this.addLog({
        level: 'error',
        source: 'POOL',
        message: `Share rejected. Total rejected: ${this.state.shares.rejected}`
      });
    }
    
    this.notify();
  }

  updateUptime() {
    if (this.state.startTime) {
      const uptime = Math.floor((Date.now() - this.state.startTime) / 1000);
      this.updateState({ uptime });
      this.updateStats({ uptime });
    }
  }

  reset() {
    this.state = {
      isActive: false,
      connectionStatus: 'disconnected',
      currentHashrate: 0,
      shares: {
        accepted: 0,
        rejected: 0
      },
      balance: 0,
      uptime: 0,
      currentChain: 'etc',
      startTime: null
    };
    
    this.stats = {
      hashrate: 0,
      sharesAccepted: 0,
      sharesRejected: 0,
      earnings: 0,
      uptime: 0,
      temperature: 0,
      powerConsumption: 0
    };
    
    this.logs = [];
    this.initializeHistory();
    this.notify();
  }

  clearLogs() {
    this.logs = [];
    this.addLog({
      level: 'info',
      source: 'SYSTEM',
      message: 'Mining logs cleared'
    });
  }
}

export const miningStateManager = new MiningStateManager();
