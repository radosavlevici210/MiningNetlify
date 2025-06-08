import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, Plus } from 'lucide-react';
import { PoolInfo } from '@/types/mining';

interface PoolConfigurationProps {
  poolInfo: PoolInfo | null;
  isConnected: boolean;
}

export function PoolConfiguration({ poolInfo, isConnected }: PoolConfigurationProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-mining-success/20 text-mining-success">Online</Badge>;
      case 'connecting':
        return <Badge className="bg-mining-warning/20 text-mining-warning">Connecting</Badge>;
      case 'offline':
        return <Badge className="bg-mining-error/20 text-mining-error">Offline</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-500">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-mining-surface border-mining-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-mining-text">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5" />
            <span>Pool Configuration</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="border-mining-border text-mining-text hover:bg-mining-border"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pool
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {poolInfo ? (
          <>
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-mining-success' : 'bg-mining-error'}`}></div>
                <div>
                  <div className="font-medium text-mining-text">{poolInfo.name}</div>
                  <div className="text-sm text-mining-text-secondary font-mono">{poolInfo.url}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-mining-text">{poolInfo.latency}ms</div>
                <div className="text-sm text-mining-text-secondary">latency</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-mining-text-secondary">Status:</span>
                {getStatusBadge(poolInfo.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-mining-text-secondary">Difficulty:</span>
                <span className="text-mining-text font-mono text-sm">{poolInfo.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mining-text-secondary">Block Height:</span>
                <span className="text-mining-text font-mono text-sm">{poolInfo.blockHeight.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mining-text-secondary">Network Hash:</span>
                <span className="text-mining-text font-mono text-sm">{poolInfo.networkHashrate}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Network className="w-12 h-12 text-mining-text-secondary mx-auto mb-4" />
            <p className="text-mining-text-secondary">No pool configured</p>
            <p className="text-sm text-mining-text-secondary mt-2">
              Configure a mining pool to start mining
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
