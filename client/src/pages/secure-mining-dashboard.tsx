import { useEffect } from 'react';
import { useSecureMining } from '@/hooks/use-secure-mining';
import { MiningHeader } from '@/components/mining/mining-header';
import { PerformanceMetrics } from '@/components/mining/performance-metrics';
import { MiningControls } from '@/components/mining/mining-controls';
import { PoolConfiguration } from '@/components/mining/pool-configuration';
import { PerformanceCharts } from '@/components/mining/performance-charts';
import { MiningLogs } from '@/components/mining/mining-logs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Zap } from 'lucide-react';

export default function SecureMiningDashboard() {
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
    document.title = 'Secure CryptoMiner - Protected Wallet Mining';
  }, []);

  const mockDailyEarnings = (hashrate / 1000000) * 24 * 1.8;

  const convertedLogs = logs.map(log => ({
    timestamp: new Date().toISOString(),
    level: 'info' as const,
    source: 'SecureEngine',
    message: log
  }));

  return (
    <div className="min-h-screen bg-mining-bg text-mining-text">
      <MiningHeader
        connectionStatus={connectionStatus as any}
        networkHashrate="234.5 TH/s"
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Secure Wallet Status */}
        <Alert className="mb-6 bg-green-900/20 border-green-500/30">
          <Shield className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">
            <div className="flex items-center justify-between">
              <span>
                <strong>PROTECTED WALLET ACTIVE:</strong> All mining rewards secured to: {securedWallet}
              </span>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs">IMMUNE TO CHANGES</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Auto-Mining Status */}
        {isActive && (
          <Alert className="mb-6 bg-blue-900/20 border-blue-500/30">
            <Zap className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400">
              <strong>AUTO-MINING ACTIVE:</strong> Mining automatically started and managed. Hashrate: {hashrate.toLocaleString()} H/s
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics */}
            <PerformanceMetrics
              hashrate={hashrate}
              shares={shares}
              balance={mockDailyEarnings * 30}
              dailyEarnings={mockDailyEarnings}
              temperature={75}
            />

            {/* Charts */}
            <PerformanceCharts
              hashrateHistory={[]}
              earningsHistory={[]}
            />

            {/* Mining Logs */}
            <MiningLogs
              logs={convertedLogs}
              onClearLogs={clearLogs}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Mining Controls */}
            <MiningControls
              isActive={isActive}
              connectionStatus={connectionStatus}
              uptime={uptime}
              onStart={startMining}
              onStop={stopMining}
              formatUptime={formatUptime}
            />

            {/* Pool Configuration */}
            <PoolConfiguration
              poolInfo={{
                name: "2Miners ETC Pool (Secured)",
                url: "stratum+tcp://etc.2miners.com:1010",
                status: 'online',
                latency: 45,
                difficulty: "16.7T",
                blockHeight: 18500234,
                networkHashrate: "234.5 TH/s"
              }}
              isConnected={isActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
}