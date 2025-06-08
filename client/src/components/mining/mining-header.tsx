import { Cpu, Wifi, WifiOff, Activity } from 'lucide-react';

interface MiningHeaderProps {
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  networkHashrate: string;
}

export function MiningHeader({ connectionStatus, networkHashrate }: MiningHeaderProps) {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-mining-success" />;
      case 'connecting':
        return <Activity className="w-4 h-4 text-mining-warning animate-pulse" />;
      case 'disconnected':
      case 'error':
        return <WifiOff className="w-4 h-4 text-mining-error" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-mining-success';
      case 'connecting':
        return 'text-mining-warning';
      case 'disconnected':
      case 'error':
        return 'text-mining-error';
    }
  };

  return (
    <header className="bg-mining-surface border-b border-mining-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-8 h-8 text-mining-primary" />
            <div>
              <h1 className="text-2xl font-bold text-mining-text">CryptoMiner Pro</h1>
              <p className="text-mining-text-secondary text-sm">Production Mining Interface</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-mining-text-secondary">Network Hashrate</p>
            <p className="font-mono text-sm text-mining-text">{networkHashrate}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
