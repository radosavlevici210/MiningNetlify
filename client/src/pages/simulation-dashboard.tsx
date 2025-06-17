import { MiningHeader } from '../components/mining/mining-header';
import { MiningControls } from '../components/mining/mining-controls';
import { PerformanceMetrics } from '../components/mining/performance-metrics';
import { ProductionStats } from '../components/mining/production-stats';
import { HardwareMonitoring } from '../components/mining/hardware-monitoring';
import { PoolConfiguration } from '../components/mining/pool-configuration';
import { PerformanceCharts } from '../components/mining/performance-charts';
import { MiningLogs } from '../components/mining/mining-logs';
import { useSimulation } from '../hooks/use-simulation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { PlayCircle, StopCircle, Activity } from 'lucide-react';

export default function SimulationDashboard() {
  const {
    isActive,
    metrics,
    logs,
    hashrateHistory,
    earningsHistory,
    hardwareInfo,
    poolInfo,
    startSimulation,
    stopSimulation,
    clearLogs,
    formatUptime,
    connectionStatus,
    totalShares,
    shareAcceptanceRate,
    networkHashrate,
    networkDifficulty
  } = useSimulation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-400" />
              Mining Simulation Dashboard
            </h1>
            <p className="text-slate-300 mt-1">
              Safe cryptocurrency mining simulation environment
            </p>
          </div>
          <Badge 
            variant={isActive ? "default" : "secondary"} 
            className={`px-4 py-2 text-sm font-medium ${
              isActive 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
            }`}
          >
            {isActive ? (
              <>
                <PlayCircle className="w-4 h-4 mr-1" />
                Simulation Active
              </>
            ) : (
              <>
                <StopCircle className="w-4 h-4 mr-1" />
                Simulation Stopped
              </>
            )}
          </Badge>
        </div>

        {/* Simulation Info Card */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Simulation Mode
            </CardTitle>
            <CardDescription className="text-blue-300">
              This is a safe simulation environment. No real cryptocurrency mining or financial transactions occur.
              All data shown represents simulated mining activity for educational and testing purposes.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Mining Status Header */}
        <MiningHeader 
          connectionStatus={connectionStatus as any}
          networkHashrate={networkHashrate}
        />

        {/* Mining Controls */}
        <MiningControls
          isActive={isActive}
          connectionStatus={connectionStatus}
          uptime={metrics.uptime}
          onStart={startSimulation}
          onStop={stopSimulation}
          formatUptime={formatUptime}
        />

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceMetrics
            hashrate={metrics.hashrate}
            shares={metrics.shares}
            balance={metrics.balance}
            dailyEarnings={metrics.dailyEarnings}
            temperature={metrics.temperature}
          />
          
          <ProductionStats
            isActive={isActive}
            hashrate={metrics.hashrate}
            totalShares={totalShares}
            acceptedShares={metrics.shares.accepted}
            rejectedShares={metrics.shares.rejected}
            uptime={metrics.uptime}
            earnings={metrics.balance}
            powerConsumption={metrics.powerConsumption}
            efficiency={metrics.efficiency}
            networkDifficulty={networkDifficulty}
          />
        </div>

        {/* Hardware and Pool Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HardwareMonitoring hardwareInfo={hardwareInfo} />
          <PoolConfiguration poolInfo={poolInfo} isConnected={isActive} />
        </div>

        {/* Performance Charts */}
        <PerformanceCharts
          hashrateHistory={hashrateHistory}
          earningsHistory={earningsHistory}
        />

        {/* Mining Logs */}
        <MiningLogs logs={logs} onClearLogs={clearLogs} />
      </div>
    </div>
  );
}