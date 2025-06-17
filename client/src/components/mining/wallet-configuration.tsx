import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { walletManager } from '@/lib/wallet-manager';

interface WalletConfigurationProps {
  currentWallet: string;
  onWalletChange: (address: string) => void;
  isConnected: boolean;
}

export function WalletConfiguration({ currentWallet, onWalletChange, isConnected }: WalletConfigurationProps) {
  const [newWallet, setNewWallet] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const handleWalletUpdate = () => {
    if (!newWallet) return;

    if (walletManager.validateWallet(newWallet)) {
      walletManager.setMainWallet(newWallet);
      onWalletChange(newWallet);
      setNewWallet('');
      setShowInput(false);
      setValidationMessage('Wallet updated successfully');
      setTimeout(() => setValidationMessage(''), 3000);
    } else {
      setValidationMessage('Invalid wallet address format. Please enter a valid Ethereum address.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateNewWallet = () => {
    // In production, this would integrate with Web3 to generate a new wallet
    const randomWallet = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setNewWallet(randomWallet);
  };

  return (
    <Card className="bg-mining-card border-mining-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-mining-text">
          <Wallet className="h-5 w-5" />
          Mining Wallet Configuration
        </CardTitle>
        <CardDescription className="text-mining-muted">
          Configure your Ethereum Classic wallet for mining rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Wallet Display */}
        <div className="space-y-2">
          <Label className="text-mining-text">Current Mining Wallet</Label>
          <div className="flex items-center gap-2 p-3 bg-mining-bg rounded-lg border border-mining-border">
            <div className="font-mono text-sm text-mining-text flex-1 break-all">
              {currentWallet}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(currentWallet)}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Connected and mining</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">Ready to mine</span>
              </>
            )}
          </div>
        </div>

        {/* Wallet Actions */}
        {!showInput ? (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowInput(true)}
              variant="outline"
              className="flex-1"
            >
              Change Wallet
            </Button>
            <Button
              onClick={generateNewWallet}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Generate New
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new-wallet" className="text-mining-text">
                New Wallet Address
              </Label>
              <Input
                id="new-wallet"
                value={newWallet}
                onChange={(e) => setNewWallet(e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b8D4C3C71c7f2eB5F4"
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleWalletUpdate}
                disabled={!newWallet}
                className="flex-1"
              >
                Update Wallet
              </Button>
              <Button
                onClick={() => {
                  setShowInput(false);
                  setNewWallet('');
                  setValidationMessage('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Validation Message */}
        {validationMessage && (
          <Alert className={validationMessage.includes('successfully') ? 
            'bg-green-900/20 border-green-500/30' : 
            'bg-red-900/20 border-red-500/30'
          }>
            <AlertDescription className={
              validationMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'
            }>
              {validationMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Wallet Information */}
        <div className="space-y-2">
          <Label className="text-mining-text">Wallet Information</Label>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-mining-muted">Network</div>
              <Badge variant="secondary">Ethereum Classic</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-mining-muted">Chain ID</div>
              <Badge variant="secondary">61</Badge>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Alert className="bg-blue-900/20 border-blue-500/30">
          <AlertCircle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-400">
            <strong>Important:</strong> Make sure you own this wallet address. All mining rewards will be sent directly to this address. Double-check the address before starting mining.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}