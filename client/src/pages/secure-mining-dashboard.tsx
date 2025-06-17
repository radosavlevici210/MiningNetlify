import { useEffect } from 'react';
import { useSecureMining } from '@/hooks/use-secure-mining';
import { MiningHeader } from '@/components/mining/mining-header';
import { PerformanceMetrics } from '@/components/mining/performance-metrics';
import { MiningControls } from '@/components/mining/mining-controls';
import { PoolConfiguration } from '@/components/mining/pool-configuration';
import { PerformanceCharts } from '@/components/mining/performance-charts';
import { MiningLogs } from '@/components/mining/mining-logs';
import { WalletConfiguration } from '@/components/mining/wallet-configuration';
import { WorkerStatus } from '@/components/mining/worker-status';
import { ProductionStats } from '@/components/mining/production-stats';
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
    document.title = 'CryptoMiner Pro - Advanced Features';
  }, []);

  const mockDailyEarnings = (hashrate / 1000000) * 24 * 1.8;

  const convertedLogs = logs;

  return (
    <div className="text-mining-text">
      <MiningHeader
        connectionStatus={connectionStatus as any}
        networkHashrate="234.5 TH/s"
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Advanced Features Status */}
        <Alert className="mb-6 bg-green-900/20 border-green-500/30">
          <Shield className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">
            <div className="flex items-center justify-between">
              <span>
                <strong>ADVANCED FEATURES ENABLED:</strong> Enhanced mining controls and monitoring for wallet: {securedWallet}
              </span>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs">ENHANCED MODE</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Mining Status */}
        {isActive && (
          <Alert className="mb-6 bg-blue-900/20 border-blue-500/30">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400">
              <strong>MINING ACTIVE:</strong> Connected to educational pools. Current hashrate: {hashrate.toLocaleString()} H/s
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Production Statistics */}
            <ProductionStats
              isActive={isActive}
              hashrate={hashrate}
              totalShares={shares.accepted + shares.rejected}
              acceptedShares={shares.accepted}
              rejectedShares={shares.rejected}
              uptime={uptime}
              earnings={mockDailyEarnings * 30}
              powerConsumption={1200}
              efficiency={92.5}
              networkDifficulty="2.15P"
            />

            {/* Performance Metrics */}
            <PerformanceMetrics
              hashrate={hashrate}
              shares={shares}
              balance={mockDailyEarnings * 30}
              dailyEarnings={mockDailyEarnings}
              temperature={75}
            />

            {/* Worker Status */}
            <WorkerStatus
              workers={Array.from({ length: 16 }, (_, i) => ({
                id: i,
                status: isActive ? 'active' : 'idle',
                hashrate: isActive ? Math.random() * 50000 + 25000 : 0,
                shares: Math.floor(Math.random() * 10),
                uptime: uptime,
                efficiency: isActive ? Math.random() * 15 + 85 : 0,
                temperature: Math.floor(Math.random() * 20 + 65)
              }))}
              totalHashrate={hashrate}
              activeWorkers={isActive ? 16 : 0}
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

            {/* Wallet Configuration */}
            <WalletConfiguration
              currentWallet={securedWallet}
              onWalletChange={(address) => {
                // Wallet will be updated through walletManager
                console.log('Wallet updated to:', address);
              }}
              isConnected={isActive}
            />

            {/* Pool Configuration */}
            <PoolConfiguration
              poolInfo={{
                name: "2Miners ETC Pool",
                url: "etc.2miners.com:1010",
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