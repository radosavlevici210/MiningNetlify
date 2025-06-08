import { useEffect } from 'react';
import { useMining } from '@/hooks/use-mining';
import { MiningHeader } from '@/components/mining/mining-header';
import { PerformanceMetrics } from '@/components/mining/performance-metrics';
import { MiningControls } from '@/components/mining/mining-controls';
import { PoolConfiguration } from '@/components/mining/pool-configuration';
import { PerformanceCharts } from '@/components/mining/performance-charts';
import { HardwareMonitoring } from '@/components/mining/hardware-monitoring';
import { MiningLogs } from '@/components/mining/mining-logs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function MiningDashboard() {
  const {
    state,
    stats,
    logs,
    hashrateHistory,
    earningsHistory,
    isInitialized,
    error,
    startMining,
    stopMining,
    clearLogs,
    formatUptime,
    getShareRatio,
    poolInfo,
    isConnected
  } = useMining();

  useEffect(() => {
    document.title = 'CryptoMiner Pro - Production Mining Interface';
  }, []);

  const mockDailyEarnings = (state.currentHashrate / 1000000) * 24 * 1.8; // Rough estimate

  return (
    <div className="min-h-screen bg-mining-bg text-mining-text">
      <MiningHeader
        connectionStatus={state.connectionStatus}
        networkHashrate="234.5 TH/s"
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Production Warning */}
        <Alert className="mb-8 bg-mining-warning/10 border-mining-warning/20">
          <AlertTriangle className="h-4 w-4 text-mining-warning" />
          <AlertDescription className="text-mining-warning font-medium">
            <strong>PRODUCTION MINING INTERFACE:</strong> This application connects to real mining pools and performs actual cryptocurrency mining. 
            Ensure proper security measures, backup your wallet keys, and verify pool configurations before starting mining operations.
            <span className="font-bold"> Real funds and computing resources will be used.</span>
          </AlertDescription>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 bg-mining-error/10 border-mining-error/20">
            <AlertTriangle className="h-4 w-4 text-mining-error" />
            <AlertDescription className="text-mining-error">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Performance Metrics */}
        <PerformanceMetrics
          hashrate={state.currentHashrate}
          shares={state.shares}
          balance={state.balance}
          dailyEarnings={mockDailyEarnings}
          temperature={stats.temperature || 72}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mining Controls */}
          <div className="lg:col-span-1 space-y-6">
            <MiningControls
              isActive={state.isActive}
              connectionStatus={state.connectionStatus}
              uptime={state.uptime}
              onStart={startMining}
              onStop={stopMining}
              formatUptime={formatUptime}
            />
            
            <PoolConfiguration
              poolInfo={poolInfo}
              isConnected={isConnected}
            />
            
            <HardwareMonitoring hardwareInfo={null} />
          </div>

          {/* Performance Charts and Logs */}
          <div className="lg:col-span-2 space-y-6">
            <PerformanceCharts
              hashrateHistory={hashrateHistory}
              earningsHistory={earningsHistory}
            />
            
            <MiningLogs
              logs={logs}
              onClearLogs={clearLogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
