import { useEffect } from 'react';
import { useSecureMining } from '@/hooks/use-secure-mining';
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
    isActive,
    hashrate,
    shares,
    uptime,
    logs,
    startMining,
    stopMining,
    clearLogs,
    formatUptime,
    connectionStatus,
    securedWallet
  } = useSecureMining();

  useEffect(() => {
    document.title = 'CryptoMiner Pro - Educational Mining Interface';
  }, []);

  const mockDailyEarnings = (hashrate / 1000000) * 24 * 1.8; // Rough estimate

  return (
    <div className="text-mining-text">
      <MiningHeader
        connectionStatus={connectionStatus as 'connected' | 'connecting' | 'disconnected' | 'error'}
        networkHashrate="234.5 TH/s"
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Educational Notice */}
        <Alert className="mb-8 bg-blue-500/10 border-blue-500/20">
          <AlertTriangle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300 font-medium">
            <strong>EDUCATIONAL MINING INTERFACE:</strong> This application demonstrates cryptocurrency mining concepts and interfaces. 
            Use this environment to learn about mining operations, pool configurations, and performance monitoring.
            <span className="font-bold"> Perfect for understanding mining fundamentals.</span>
          </AlertDescription>
        </Alert>

        {/* Secure Mining Status */}
        <Alert className="mb-6 bg-green-900/20 border-green-500/30">
          <AlertTriangle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">
            <strong>SECURE MINING ACTIVE:</strong> All mining rewards automatically directed to protected wallet: {securedWallet}
          </AlertDescription>
        </Alert>

        {/* Performance Metrics */}
        <PerformanceMetrics
          hashrate={hashrate}
          shares={shares}
          balance={0.0234}
          dailyEarnings={mockDailyEarnings}
          temperature={72}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mining Controls */}
          <div className="lg:col-span-1 space-y-6">
            <MiningControls
              isActive={isActive}
              connectionStatus={connectionStatus}
              uptime={uptime}
              onStart={startMining}
              onStop={stopMining}
              formatUptime={formatUptime}
            />
            
            <PoolConfiguration
              poolInfo={null}
              isConnected={connectionStatus === 'connected'}
            />
            
            <HardwareMonitoring hardwareInfo={null} />
          </div>

          {/* Performance Charts and Logs */}
          <div className="lg:col-span-2 space-y-6">
            <PerformanceCharts
              hashrateHistory={[]}
              earningsHistory={[]}
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
