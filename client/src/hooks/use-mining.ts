import { useState, useEffect, useCallback } from 'react';
import { miningStateManager } from '@/lib/mining/mining-state';
import { ProductionMiningEngine } from '@/lib/mining/production-mining-engine';
import { RealStratumClient } from '@/lib/mining/real-stratum-client';
import { web3Integration } from '@/lib/mining/web3-integration';
import { MiningState, MiningConfiguration, MiningStats, LogEntry, ChartDataPoint } from '@/types/mining';

export function useMining() {
  const [state, setState] = useState<MiningState>(miningStateManager.getState());
  const [stats, setStats] = useState<MiningStats>(miningStateManager.getStats());
  const [logs, setLogs] = useState<LogEntry[]>(miningStateManager.getLogs());
  const [hashrateHistory, setHashrateHistory] = useState<ChartDataPoint[]>(miningStateManager.getHashrateHistory());
  const [earningsHistory, setEarningsHistory] = useState<ChartDataPoint[]>(miningStateManager.getEarningsHistory());
  
  const [miningEngine] = useState(() => new ProductionMiningEngine());
  const [stratumClient, setStratumClient] = useState<RealStratumClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = miningStateManager.subscribe((newState) => {
      setState(newState);
      setStats(miningStateManager.getStats());
      setLogs(miningStateManager.getLogs());
      setHashrateHistory(miningStateManager.getHashrateHistory());
      setEarningsHistory(miningStateManager.getEarningsHistory());
    });

    return unsubscribe;
  }, []);

  // Initialize mining engine
  useEffect(() => {
    const initialize = async () => {
      try {
        if (!ethashEngine.isReady()) {
          miningStateManager.addLog({
            level: 'info',
            source: 'ENGINE',
            message: 'Initializing Ethash mining engine...'
          });
        }

        // Set up engine callbacks
        ethashEngine.setCallbacks({
          onHashrate: (hashrate) => {
            miningStateManager.updateStats({ hashrate });
            miningStateManager.updateState({ currentHashrate: hashrate });
          },
          onShare: (result) => {
            if (stratumClient && result.meetsTarget) {
              // Submit share to pool
              stratumClient.submitShare('current_job', '0x12345', result.mixHash, result.result);
            }
          },
          onError: (error) => {
            setError(error);
            miningStateManager.addLog({
              level: 'error',
              source: 'ENGINE',
              message: error
            });
          }
        });

        setIsInitialized(true);
        miningStateManager.addLog({
          level: 'success',
          source: 'ENGINE',
          message: 'Mining engine initialized successfully'
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        miningStateManager.addLog({
          level: 'error',
          source: 'ENGINE',
          message: `Failed to initialize: ${errorMessage}`
        });
      }
    };

    initialize();
  }, [ethashEngine]);

  // Update uptime
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isActive) {
      interval = setInterval(() => {
        miningStateManager.updateUptime();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isActive]);

  const startMining = useCallback(async (config: MiningConfiguration) => {
    try {
      setError(null);
      
      if (!isInitialized) {
        throw new Error('Mining engine not initialized');
      }

      miningStateManager.startMining();
      
      // Create stratum client
      const client = new StratumClient(config.poolUrl, config.walletAddress, config.workerName);
      
      client.setCallbacks({
        onConnect: () => {
          miningStateManager.updateState({ connectionStatus: 'connected' });
          miningStateManager.addLog({
            level: 'success',
            source: 'POOL',
            message: `Connected to ${config.poolUrl}`
          });
        },
        onDisconnect: () => {
          miningStateManager.updateState({ connectionStatus: 'disconnected' });
          miningStateManager.addLog({
            level: 'warning',
            source: 'POOL',
            message: 'Disconnected from pool'
          });
        },
        onJob: (job) => {
          miningStateManager.addLog({
            level: 'info',
            source: 'POOL',
            message: `New job received: ${job.jobId}`
          });
          
          // Start mining with new job
          ethashEngine.startMining(job, config.threadCount, config.intensity);
        },
        onShare: (accepted, error) => {
          miningStateManager.incrementShares(accepted);
          if (!accepted && error) {
            miningStateManager.addLog({
              level: 'error',
              source: 'POOL',
              message: `Share rejected: ${error}`
            });
          }
        },
        onError: (error) => {
          setError(error);
          miningStateManager.addLog({
            level: 'error',
            source: 'POOL',
            message: error
          });
        }
      });

      await client.connect();
      setStratumClient(client);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      miningStateManager.addLog({
        level: 'error',
        source: 'SYSTEM',
        message: `Failed to start mining: ${errorMessage}`
      });
      miningStateManager.stopMining();
    }
  }, [isInitialized, ethashEngine]);

  const stopMining = useCallback(() => {
    try {
      miningStateManager.stopMining();
      ethashEngine.stopMining();
      
      if (stratumClient) {
        stratumClient.disconnect();
        setStratumClient(null);
      }

      miningStateManager.addLog({
        level: 'info',
        source: 'SYSTEM',
        message: 'Mining stopped successfully'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      miningStateManager.addLog({
        level: 'error',
        source: 'SYSTEM',
        message: `Error stopping mining: ${errorMessage}`
      });
    }
  }, [ethashEngine, stratumClient]);

  const clearLogs = useCallback(() => {
    miningStateManager.clearLogs();
  }, []);

  const getBalance = useCallback(async (address: string) => {
    try {
      const balance = await web3Integration.getBalance(address);
      miningStateManager.updateState({ balance: parseFloat(balance) });
      return balance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const formatUptime = useCallback((seconds: number) => {
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

  const getShareRatio = useCallback(() => {
    const total = state.shares.accepted + state.shares.rejected;
    if (total === 0) return 0;
    return ((state.shares.accepted / total) * 100).toFixed(1);
  }, [state.shares]);

  return {
    // State
    state,
    stats,
    logs,
    hashrateHistory,
    earningsHistory,
    isInitialized,
    error,
    
    // Actions
    startMining,
    stopMining,
    clearLogs,
    getBalance,
    
    // Computed values
    formatUptime,
    getShareRatio,
    
    // Pool info
    poolInfo: stratumClient?.getPoolInfo() || null,
    isConnected: stratumClient?.isConnected() || false
  };
}
