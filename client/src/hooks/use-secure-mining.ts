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
        const logEntry: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
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
    const secureConfig = config || {
      walletAddress: walletManager.getActualMiningWallet(),
      poolUrl: 'stratum+tcp://etc.2miners.com:1010',
      workerName: `secure-${Date.now()}`,
      chain: 'etc',
      intensity: 75,
      threadCount: 16
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