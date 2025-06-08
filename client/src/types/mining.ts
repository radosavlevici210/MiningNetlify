export interface MiningState {
  isActive: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  currentHashrate: number;
  shares: {
    accepted: number;
    rejected: number;
  };
  balance: number;
  uptime: number;
  currentChain: string;
  startTime: number | null;
}

export interface MiningConfiguration {
  walletAddress: string;
  poolUrl: string;
  workerName: string;
  chain: string;
  intensity: number;
  threadCount: number;
}

export interface PoolInfo {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'connecting';
  latency: number;
  difficulty: string;
  blockHeight: number;
  networkHashrate: string;
}

export interface HardwareInfo {
  gpus: GPUInfo[];
  totalPower: number;
  efficiency: number;
}

export interface GPUInfo {
  id: number;
  name: string;
  temperature: number;
  power: number;
  memory: {
    used: number;
    total: number;
  };
  hashrate: number;
  status: 'active' | 'idle' | 'error';
}

export interface MiningJob {
  jobId: string;
  headerHash: string;
  difficulty: string;
  target: string;
  timestamp: number;
}

export interface Share {
  nonce: string;
  mixHash: string;
  hash: string;
  difficulty: string;
  timestamp: number;
}

export interface MiningStats {
  hashrate: number;
  sharesAccepted: number;
  sharesRejected: number;
  earnings: number;
  uptime: number;
  temperature: number;
  powerConsumption: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  source: string;
  message: string;
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export interface EarningsData {
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
}

export type SupportedChain = 'etc' | 'ethw' | 'etf' | 'ergo';

export interface ChainConfig {
  id: SupportedChain;
  name: string;
  symbol: string;
  algorithm: string;
  defaultPools: string[];
  blockTime: number;
  difficulty: string;
}

export interface StratumMessage {
  id?: number;
  method: string;
  params: any[];
  result?: any;
  error?: any;
}

export interface EthashResult {
  mixHash: string;
  result: string;
  meetsTarget: boolean;
}
