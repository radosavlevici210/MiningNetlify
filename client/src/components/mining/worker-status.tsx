import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cpu, Zap, TrendingUp, Clock } from 'lucide-react';

interface WorkerInfo {
  id: number;
  status: 'active' | 'idle' | 'error';
  hashrate: number;
  shares: number;
  uptime: number;
  efficiency: number;
  temperature?: number;
}

interface WorkerStatusProps {
  workers: WorkerInfo[];
  totalHashrate: number;
  activeWorkers: number;
}

export function WorkerStatus({ workers, totalHashrate, activeWorkers }: WorkerStatusProps) {
  const formatHashrate = (rate: number) => {
    if (rate > 1000000) return `${(rate / 1000000).toFixed(1)} MH/s`;
    if (rate > 1000) return `${(rate / 1000).toFixed(1)} KH/s`;
    return `${rate.toFixed(0)} H/s`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <span>Production Workers ({activeWorkers} Active)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatHashrate(totalHashrate)}
            </div>
            <div className="text-sm text-gray-400">Total Hashrate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{activeWorkers}</div>
            <div className="text-sm text-gray-400">Active Workers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {workers.reduce((sum, w) => sum + w.shares, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Shares</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {workers.length > 0 ? (workers.reduce((sum, w) => sum + w.efficiency, 0) / workers.length).toFixed(2) : '0.00'}%
            </div>
            <div className="text-sm text-gray-400">Avg Efficiency</div>
          </div>
        </div>

        {/* Worker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className={`p-3 rounded-lg border ${
                worker.status === 'active'
                  ? 'bg-green-900/20 border-green-500/30'
                  : worker.status === 'error'
                  ? 'bg-red-900/20 border-red-500/30'
                  : 'bg-gray-800/50 border-gray-600/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Worker {worker.id}</span>
                <Badge
                  variant={worker.status === 'active' ? 'default' : 'secondary'}
                  className={
                    worker.status === 'active'
                      ? 'bg-green-600 text-white'
                      : worker.status === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-white'
                  }
                >
                  {worker.status}
                </Badge>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Rate:</span>
                  <span className="text-green-400 font-mono">
                    {formatHashrate(worker.hashrate)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Shares:</span>
                  <span className="text-yellow-400 font-mono">{worker.shares}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Uptime:</span>
                  <span className="text-blue-400 font-mono">
                    {formatUptime(worker.uptime)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Efficiency:</span>
                  <span className="text-purple-400 font-mono">
                    {worker.efficiency.toFixed(2)}%
                  </span>
                </div>

                {worker.temperature && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Temp:</span>
                    <span
                      className={`font-mono ${
                        worker.temperature > 80
                          ? 'text-red-400'
                          : worker.temperature > 70
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}
                    >
                      {worker.temperature}°C
                    </span>
                  </div>
                )}
              </div>

              {/* Performance Bar */}
              <div className="mt-2">
                <Progress
                  value={Math.min((worker.hashrate / (totalHashrate / workers.length)) * 100, 100)}
                  className="h-1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add more workers if needed */}
        {workers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Cpu className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No workers active</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}