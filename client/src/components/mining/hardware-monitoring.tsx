import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, Zap, Thermometer, MemoryStick } from 'lucide-react';
import { HardwareInfo } from '@/types/mining';

interface HardwareMonitoringProps {
  hardwareInfo: HardwareInfo | null;
}

export function HardwareMonitoring({ hardwareInfo }: HardwareMonitoringProps) {
  // Mock hardware data for demonstration
  const mockHardware: HardwareInfo = {
    gpus: [
      {
        id: 0,
        name: 'RTX 3080',
        temperature: 72,
        power: 245,
        memory: { used: 8.2, total: 10 },
        hashrate: 89.5,
        status: 'active'
      },
      {
        id: 1,
        name: 'RTX 3080',
        temperature: 74,
        power: 240,
        memory: { used: 8.1, total: 10 },
        hashrate: 88.2,
        status: 'active'
      }
    ],
    totalPower: 485,
    efficiency: 0.37
  };

  const hardware = hardwareInfo || mockHardware;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-mining-success';
      case 'idle':
        return 'bg-mining-warning';
      case 'error':
        return 'bg-mining-error';
      default:
        return 'bg-gray-500';
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 80) return 'text-mining-error';
    if (temp > 70) return 'text-mining-warning';
    return 'text-mining-success';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-mining-surface border-mining-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-mining-text">
            <Cpu className="w-5 h-5" />
            <span>Hardware Monitoring</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hardware.gpus.map((gpu) => (
            <div key={gpu.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(gpu.status)}`}></div>
                  <span className="font-medium text-mining-text">
                    GPU {gpu.id}: {gpu.name}
                  </span>
                </div>
                <span className={`font-mono text-sm ${getTemperatureColor(gpu.temperature)}`}>
                  {gpu.temperature}°C
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                <div>
                  <p className="text-mining-text-secondary">Power</p>
                  <p className="font-mono text-mining-text">{gpu.power}W</p>
                </div>
                <div>
                  <p className="text-mining-text-secondary">Memory</p>
                  <p className="font-mono text-mining-text">
                    {gpu.memory.used.toFixed(1)}/{gpu.memory.total}GB
                  </p>
                </div>
                <div>
                  <p className="text-mining-text-secondary">Hashrate</p>
                  <p className="font-mono text-mining-success">{gpu.hashrate} MH/s</p>
                </div>
                <div>
                  <p className="text-mining-text-secondary">Efficiency</p>
                  <p className="font-mono text-mining-text">
                    {(gpu.hashrate / gpu.power).toFixed(2)} MH/W
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-mining-text-secondary">Memory Usage</span>
                  <span className="text-mining-text">
                    {((gpu.memory.used / gpu.memory.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(gpu.memory.used / gpu.memory.total) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-mining-surface border-mining-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-mining-text">
            <Zap className="w-5 h-5" />
            <span>Power & Efficiency</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-mining-warning" />
              </div>
              <p className="text-2xl font-bold font-mono text-mining-warning">
                {hardware.totalPower}W
              </p>
              <p className="text-mining-text-secondary text-sm">Total Power</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MemoryStick className="w-6 h-6 text-mining-success" />
              </div>
              <p className="text-2xl font-bold font-mono text-mining-success">
                {hardware.efficiency.toFixed(2)}
              </p>
              <p className="text-mining-text-secondary text-sm">MH/W Efficiency</p>
            </div>
          </div>

          <div className="border-t border-mining-border pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-mining-text-secondary">Daily Power Cost</span>
                <span className="font-mono text-mining-error">$2.33</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mining-text-secondary">Est. Daily Profit</span>
                <span className="font-mono text-mining-success">$8.45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mining-text-secondary">ROI Estimate</span>
                <span className="font-mono text-mining-text-secondary">847 days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
