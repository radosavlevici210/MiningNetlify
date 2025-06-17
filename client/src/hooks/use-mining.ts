import { useState, useEffect, useCallback } from 'react';
import { miningStateManager } from '@/lib/mining/mining-state';
import { secureMiningEngine } from '@/lib/secure-mining-engine';
import { walletManager } from '@/lib/wallet-manager';
import { MiningState, MiningConfiguration, MiningStats, LogEntry, ChartDataPoint } from '@/types/mining';

export function useMining() {
  const [state, setState] = useState<MiningState>(miningStateManager.getState());
  const [stats, setStats] = useState<MiningStats>(miningStateManager.getStats());
  const [logs, setLogs] = useState<LogEntry[]>(miningStateManager.getLogs());
  const [hashrateHistory, setHashrateHistory] = useState<ChartDataPoint[]>(miningStateManager.getHashrateHistory());
  const [earningsHistory, setEarningsHistory] = useState<ChartDataPoint[]>(miningStateManager.getEarningsHistory());
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoMiningActive, setAutoMiningActive] = useState(false);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribeState = miningStateManager.subscribe('state', setState);
    const unsubscribeStats = miningStateManager.subscribe('stats', setStats);
    const unsubscribeLogs = miningStateManager.subscribe('logs', setLogs);
    const unsubscribeHashrate = miningStateManager.subscribe('hashrateHistory', setHashrateHistory);
    const unsubscribeEarnings = miningStateManager.subscribe('earningsHistory', setEarningsHistory);

    return () => {
      unsubscribeState();
      unsubscribeStats();
      unsubscribeLogs();
      unsubscribeHashrate();
      unsubscribeEarnings();
    };
  }, []);

  // Initialize mining engine
  useEffect(() => {
    if (!isInitialized) {
      miningEngine.setCallbacks({
        onHashrate: (hashrate: number) => {
          miningStateManager.updateHashrate(hashrate);
        },
        onShare: (accepted: boolean, share: any) => {
          miningStateManager.addShare(accepted);
          miningStateManager.addLog(
            accepted ? 'success' : 'warning',
            'Mining',
            accepted ? 'Share accepted' : 'Share rejected'
          );
        },
        onError: (error: string) => {
          miningStateManager.addLog('error', 'Mining', error);
          setError(error);
        },
        onJob: (job: any) => {
          miningStateManager.addLog('info', 'Pool', `New job received: ${job.jobId}`);
        },
        onStats: (stats: any) => {
          miningStateManager.updateStats({
            hashrate: stats.hashrate,
            uptime: stats.uptime,
            temperature: 65,
            powerConsumption: 150
          });
        }
      });
      setIsInitialized(true);
    }

    return () => {
      if (miningEngine) {
        miningEngine.destroy();
      }
    };
  }, [miningEngine, isInitialized]);

  const startMining = useCallback(async (config: MiningConfiguration) => {
    try {
      setError(null);
      miningStateManager.addLog('info', 'System', 'Starting mining...');
      
      await miningEngine.startMining({
        walletAddress: config.walletAddress,
        poolUrl: config.poolUrl,
        workerName: config.workerName,
        chain: config.chain,
        intensity: config.intensity,
        threadCount: config.threadCount
      });

      miningStateManager.updateState({
        isActive: true,
        connectionStatus: 'connected',
        currentChain: config.chain,
        startTime: Date.now()
      });

      // Initialize web3 for blockchain interaction
      try {
        await web3Integration.initialize(config.chain);
      } catch (web3Error) {
        console.warn('Web3 initialization failed:', web3Error);
        miningStateManager.addLog('warning', 'Web3', 'Blockchain integration unavailable');
      }

      miningStateManager.addLog('success', 'System', `Mining started on ${config.chain}`);
      
    } catch (error: any) {
      console.error('Failed to start mining:', error);
      miningStateManager.addLog('error', 'System', `Failed to start mining: ${error.message}`);
      miningStateManager.updateState({
        isActive: false,
        connectionStatus: 'error'
      });
      setError(error.message);
      throw error;
    }
  }, [miningEngine]);

  const stopMining = useCallback(() => {
    try {
      miningEngine.stopMining();
      miningStateManager.updateState({
        isActive: false,
        connectionStatus: 'disconnected',
        startTime: null
      });
      miningStateManager.addLog('info', 'System', 'Mining stopped');
      setError(null);
    } catch (error: any) {
      console.error('Failed to stop mining:', error);
      miningStateManager.addLog('error', 'System', `Failed to stop mining: ${error.message}`);
      setError(error.message);
    }
  }, [miningEngine]);

  const clearLogs = useCallback(() => {
    miningStateManager.clearLogs();
  }, []);

  const formatUptime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }, []);

  const updateIntensity = useCallback((intensity: number) => {
    try {
      miningEngine.updateIntensity(intensity);
      miningStateManager.addLog('info', 'System', `Mining intensity updated to ${intensity}`);
    } catch (error: any) {
      console.error('Failed to update intensity:', error);
      miningStateManager.addLog('error', 'System', `Failed to update intensity: ${error.message}`);
    }
  }, [miningEngine]);

  const getMiningStats = useCallback(() => {
    return miningEngine.getStats();
  }, [miningEngine]);

  const getCurrentJob = useCallback(() => {
    return miningEngine.getCurrentJob();
  }, [miningEngine]);

  const isRunning = useCallback(() => {
    return miningEngine.isRunning();
  }, [miningEngine]);

  const getHashrate = useCallback(() => {
    return miningEngine.getHashrate();
  }, [miningEngine]);

  // Pool information (mock data for now, would be real in production)
  const getPoolInfo = useCallback(() => {
    return {
      name: 'ETC Pool',
      url: 'stratum+tcp://etc-us-east1.nanopool.org:19999',
      status: 'online' as const,
      latency: 45,
      difficulty: '4.295G',
      blockHeight: 18750000,
      networkHashrate: '24.5 TH/s'
    };
  }, []);

  const getConnectionStatus = useCallback(() => {
    return stratumClient?.getConnectionStatus() || state.connectionStatus;
  }, [stratumClient, state.connectionStatus]);

  return {
    // State
    state,
    stats,
    logs,
    hashrateHistory,
    earningsHistory,
    error,
    isInitialized,

    // Actions
    startMining,
    stopMining,
    clearLogs,
    updateIntensity,
    
    // Getters
    getMiningStats,
    getCurrentJob,
    isRunning,
    getHashrate,
    getPoolInfo,
    getConnectionStatus,
    
    // Utilities
    formatUptime
  };
}