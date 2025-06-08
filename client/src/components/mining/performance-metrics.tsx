import { Activity, DollarSign, Share2, TrendingUp, Thermometer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PerformanceMetricsProps {
  hashrate: number;
  shares: {
    accepted: number;
    rejected: number;
  };
  balance: number;
  dailyEarnings: number;
  temperature: number;
}

export function PerformanceMetrics({ 
  hashrate, 
  shares, 
  balance, 
  dailyEarnings, 
  temperature 
}: PerformanceMetricsProps) {
  const shareRatio = shares.accepted + shares.rejected > 0 
    ? ((shares.accepted / (shares.accepted + shares.rejected)) * 100).toFixed(1)
    : 0;

  const getTemperatureStatus = () => {
    if (temperature > 80) return { color: 'text-mining-error', status: 'Hot' };
    if (temperature > 70) return { color: 'text-mining-warning', status: 'Warm' };
    return { color: 'text-mining-success', status: 'Cool' };
  };

  const tempStatus = getTemperatureStatus();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <Card className="bg-mining-surface border-mining-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-mining-primary" />
              <span className="font-medium text-mining-text-secondary">Hashrate</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-mining-success rounded-full"></div>
              <span className="text-xs text-mining-success">Live</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-mining-primary">
              {hashrate.toFixed(1)} MH/s
            </p>
            <p className="text-mining-text-secondary text-sm">Current rate</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-mining-surface border-mining-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-mining-warning" />
              <span className="font-medium text-mining-text-secondary">Shares</span>
            </div>
            <div className="flex space-x-1">
              <span className="text-xs bg-mining-success/20 text-mining-success px-2 py-1 rounded-full">
                {shares.accepted}
              </span>
              <span className="text-xs bg-mining-error/20 text-mining-error px-2 py-1 rounded-full">
                {shares.rejected}
              </span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-mining-warning">{shareRatio}%</p>
            <p className="text-mining-text-secondary text-sm">Accept ratio</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-mining-surface border-mining-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-mining-success" />
              <span className="font-medium text-mining-text-secondary">Balance</span>
            </div>
            <span className="text-xs bg-mining-success/20 text-mining-success px-2 py-1 rounded-full">
              Pool
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-mining-success">
              {balance.toFixed(5)} ETC
            </p>
            <p className="text-mining-text-secondary text-sm">Unpaid balance</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-mining-surface border-mining-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-mining-success" />
              <span className="font-medium text-mining-text-secondary">Earnings</span>
            </div>
            <span className="text-xs bg-mining-success/20 text-mining-success px-2 py-1 rounded-full">
              24h
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-mining-success">
              ${dailyEarnings.toFixed(2)}
            </p>
            <p className="text-mining-text-secondary text-sm">Daily estimate</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-mining-surface border-mining-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-mining-warning" />
              <span className="font-medium text-mining-text-secondary">Temperature</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${temperature > 80 ? 'bg-mining-error' : temperature > 70 ? 'bg-mining-warning' : 'bg-mining-success'}`}></div>
              <span className={`text-xs ${tempStatus.color}`}>{tempStatus.status}</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-mining-text">
              {temperature.toFixed(0)}°C
            </p>
            <p className="text-mining-text-secondary text-sm">GPU average</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
