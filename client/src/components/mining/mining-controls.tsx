import { useState } from 'react';
import { Play, Square, Settings, Cpu, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MiningConfiguration } from '@/types/mining';

interface MiningControlsProps {
  isActive: boolean;
  connectionStatus: string;
  uptime: number;
  onStart: (config: MiningConfiguration) => void;
  onStop: () => void;
  formatUptime: (seconds: number) => string;
}

export function MiningControls({ 
  isActive, 
  connectionStatus, 
  uptime, 
  onStart, 
  onStop, 
  formatUptime 
}: MiningControlsProps) {
  const [config, setConfig] = useState<MiningConfiguration>({
    walletAddress: '0x742d35Cc6486C4c1b7fd91Eb01E4A3C8e8A5F28C',
    poolUrl: 'stratum+tcp://etc.2miners.com:1010',
    workerName: 'rig-001',
    chain: 'etc',
    intensity: 7,
    threadCount: 4
  });

  const handleStart = () => {
    onStart(config);
  };

  const getStatusIcon = () => {
    if (isActive) {
      return <Zap className="w-6 h-6 text-mining-success mining-pulse" />;
    }
    return <Play className="w-6 h-6 text-mining-text-secondary" />;
  };

  const getStatusText = () => {
    if (isActive) return 'MINING ACTIVE';
    return 'READY TO MINE';
  };

  const getStatusColor = () => {
    if (isActive) return 'text-mining-success';
    return 'text-mining-text-secondary';
  };

  return (
    <Card className="bg-mining-surface border-mining-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-mining-text">
          <Settings className="w-5 h-5" />
          <span>Mining Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mining Status */}
        <div className="text-center p-4 bg-gray-800 rounded-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-mining-surface rounded-full mb-3">
            {getStatusIcon()}
          </div>
          <p className={`font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          {isActive && (
            <p className="text-xs text-mining-text-secondary mt-1">
              Uptime: {formatUptime(uptime)}
            </p>
          )}
        </div>

        {/* Chain Selection */}
        <div className="space-y-2">
          <Label className="text-mining-text-secondary">Mining Chain</Label>
          <Select 
            value={config.chain} 
            onValueChange={(value) => setConfig({ ...config, chain: value })}
          >
            <SelectTrigger className="bg-gray-800 border-mining-border text-mining-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-mining-border">
              <SelectItem value="etc">Ethereum Classic (ETC)</SelectItem>
              <SelectItem value="ethw">EthereumPoW (ETHW)</SelectItem>
              <SelectItem value="etf">EthereumFair (ETF)</SelectItem>
              <SelectItem value="ergo">Ergo (ERG)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pool URL */}
        <div className="space-y-2">
          <Label className="text-mining-text-secondary">Pool URL</Label>
          <Input
            value={config.poolUrl}
            onChange={(e) => setConfig({ ...config, poolUrl: e.target.value })}
            className="bg-gray-800 border-mining-border text-mining-text font-mono text-sm"
            placeholder="stratum+tcp://pool.example.com:4444"
          />
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <Label className="text-mining-text-secondary">Wallet Address</Label>
          <Input
            value={config.walletAddress}
            onChange={(e) => setConfig({ ...config, walletAddress: e.target.value })}
            className="bg-gray-800 border-mining-border text-mining-text font-mono text-sm"
            placeholder="Your wallet address"
          />
        </div>

        {/* Worker Name */}
        <div className="space-y-2">
          <Label className="text-mining-text-secondary">Worker Name</Label>
          <Input
            value={config.workerName}
            onChange={(e) => setConfig({ ...config, workerName: e.target.value })}
            className="bg-gray-800 border-mining-border text-mining-text"
            placeholder="worker1"
          />
        </div>

        {/* Advanced Settings */}
        <div className="border-t border-mining-border pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-mining-text-secondary">Threads</Label>
              <Input
                type="number"
                min="1"
                max="16"
                value={config.threadCount}
                onChange={(e) => setConfig({ ...config, threadCount: parseInt(e.target.value) || 4 })}
                className="bg-gray-800 border-mining-border text-mining-text"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-mining-text-secondary">Intensity: {config.intensity}</Label>
              <Slider
                value={[config.intensity]}
                onValueChange={(value) => setConfig({ ...config, intensity: value[0] })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleStart}
            disabled={isActive}
            className="bg-mining-success hover:bg-mining-success/90 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
          <Button
            onClick={onStop}
            disabled={!isActive}
            className="bg-mining-error hover:bg-mining-error/90 text-white"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
