import { useState, useCallback, useEffect } from 'react';
import { simulationEngine, type SimulationMetrics } from '../lib/simulation-engine';
import type { MiningConfiguration, LogEntry, ChartDataPoint, HardwareInfo, PoolInfo } from '../types/mining';

export function useSimulation() {
  const [isActive, setIsActive] = useState(false);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    hashrate: 0,
    shares: { accepted: 0, rejected: 0 },
    balance: 0,
    dailyEarnings: 0,
    temperature: 65,
    powerConsumption: 0,
    efficiency: 0,
    uptime: 0
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hashrateHistory, setHashrateHistory] = useState<ChartDataPoint[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<ChartDataPoint[]>([]);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);

  useEffect(() => {
    // Set up simulation engine callbacks
    simulationEngine.setCallbacks({
      onMetricsUpdate: (newMetrics: SimulationMetrics) => {
        setMetrics(newMetrics);
        setHardwareInfo(simulationEngine.getSimulatedHardware());
        setPoolInfo(simulationEngine.getSimulatedPoolInfo());
      },
      onLogMessage: (log: LogEntry) => {
        setLogs(prevLogs => {
          const newLogs = [...prevLogs, log];
          // Keep only last 100 logs
          return newLogs.slice(-100);
        });
      },
      onHashrateUpdate: (dataPoint: ChartDataPoint) => {
        setHashrateHistory(prev => {
          const newHistory = [...prev, dataPoint];
          // Keep only last 50 data points
          return newHistory.slice(-50);
        });
      },
      onEarningsUpdate: (dataPoint: ChartDataPoint) => {
        setEarningsHistory(prev => {
          const newHistory = [...prev, dataPoint];
          // Keep only last 50 data points
          return newHistory.slice(-50);
        });
      }
    });

    // Initialize with current state
    setIsActive(simulationEngine.isSimulationActive());
    setMetrics(simulationEngine.getMetrics());
    setHardwareInfo(simulationEngine.getSimulatedHardware());
    setPoolInfo(simulationEngine.getSimulatedPoolInfo());
  }, []);

  const startSimulation = useCallback(async (config: MiningConfiguration) => {
    try {
      await simulationEngine.startSimulation(config);
      setIsActive(true);
      return true;
    } catch (error) {
      console.error('Failed to start simulation:', error);
      return false;
    }
  }, []);

  const stopSimulation = useCallback(async () => {
    try {
      await simulationEngine.stopSimulation();
      setIsActive(false);
      return true;
    } catch (error) {
      console.error('Failed to stop simulation:', error);
      return false;
    }
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const formatUptime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isActive,
    metrics,
    logs,
    hashrateHistory,
    earningsHistory,
    hardwareInfo,
    poolInfo,
    
    // Actions
    startSimulation,
    stopSimulation,
    clearLogs,
    
    // Utilities
    formatUptime,
    
    // Computed values
    connectionStatus: isActive ? 'connected' : 'disconnected',
    totalShares: metrics.shares.accepted + metrics.shares.rejected,
    shareAcceptanceRate: metrics.shares.accepted + metrics.shares.rejected > 0 
      ? (metrics.shares.accepted / (metrics.shares.accepted + metrics.shares.rejected)) * 100 
      : 0,
    networkHashrate: poolInfo?.networkHashrate || '0 H/s',
    networkDifficulty: poolInfo?.difficulty || '0'
  };
}