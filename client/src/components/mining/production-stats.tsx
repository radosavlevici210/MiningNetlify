import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, TrendingUp, DollarSign, Clock, Cpu } from 'lucide-react';

interface ProductionStatsProps {
  isActive: boolean;
  hashrate: number;
  totalShares: number;
  acceptedShares: number;
  rejectedShares: number;
  uptime: number;
  earnings: number;
  powerConsumption: number;
  efficiency: number;
  networkDifficulty: string;
}

export function ProductionStats({
  isActive,
  hashrate,
  totalShares,
  acceptedShares,
  rejectedShares,
  uptime,
  earnings,
  powerConsumption,
  efficiency,
  networkDifficulty
}: ProductionStatsProps) {
  const formatHashrate = (rate: number) => {
    if (rate >= 1000000000) return `${(rate / 1000000000).toFixed(2)} GH/s`;
    if (rate >= 1000000) return `${(rate / 1000000).toFixed(2)} MH/s`;
    if (rate >= 1000) return `${(rate / 1000).toFixed(1)} KH/s`;
    return `${rate.toFixed(0)} H/s`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const acceptanceRate = totalShares > 0 ? ((acceptedShares / totalShares) * 100).toFixed(1) : '0.0';
  const rejectionRate = totalShares > 0 ? ((rejectedShares / totalShares) * 100).toFixed(1) : '0.0';

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Production Statistics</span>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-600 text-white" : "bg-gray-600 text-white"}
          >
            {isActive ? "MINING" : "IDLE"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Hashrate */}
          <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <div className="flex items-center justify-center mb-2">
              <Cpu className="w-4 h-4 text-blue-400 mr-1" />
              <span className="text-sm text-blue-400">Hashrate</span>
            </div>
            <div className="text-xl font-bold text-blue-300">
              {formatHashrate(hashrate)}
            </div>
          </div>

          {/* Shares */}
          <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/30">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-sm text-green-400">Accepted</span>
            </div>
            <div className="text-xl font-bold text-green-300">
              {acceptedShares}
            </div>
            <div className="text-xs text-green-400">
              {acceptanceRate}% rate
            </div>
          </div>

          {/* Rejected Shares */}
          <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-500/30">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-red-400 mr-1" />
              <span className="text-sm text-red-400">Rejected</span>
            </div>
            <div className="text-xl font-bold text-red-300">
              {rejectedShares}
            </div>
            <div className="text-xs text-red-400">
              {rejectionRate}% rate
            </div>
          </div>

          {/* Earnings */}
          <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm text-yellow-400">Earnings</span>
            </div>
            <div className="text-xl font-bold text-yellow-300">
              {earnings.toFixed(4)} ETC
            </div>
          </div>

          {/* Uptime */}
          <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-purple-400 mr-1" />
              <span className="text-sm text-purple-400">Uptime</span>
            </div>
            <div className="text-lg font-bold text-purple-300">
              {formatUptime(uptime)}
            </div>
          </div>

          {/* Power Consumption */}
          <div className="text-center p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-4 h-4 text-orange-400 mr-1" />
              <span className="text-sm text-orange-400">Power</span>
            </div>
            <div className="text-lg font-bold text-orange-300">
              {powerConsumption}W
            </div>
          </div>

          {/* Efficiency */}
          <div className="text-center p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-teal-400 mr-1" />
              <span className="text-sm text-teal-400">Efficiency</span>
            </div>
            <div className="text-lg font-bold text-teal-300">
              {efficiency.toFixed(1)}%
            </div>
          </div>

          {/* Network Difficulty */}
          <div className="text-center p-4 bg-pink-900/20 rounded-lg border border-pink-500/30">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-pink-400 mr-1" />
              <span className="text-sm text-pink-400">Difficulty</span>
            </div>
            <div className="text-sm font-bold text-pink-300">
              {networkDifficulty}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}