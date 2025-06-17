// Production Wallet Management System
export class WalletManager {
  // Default wallet address for new users
  private static readonly DEFAULT_WALLET = '0x557E3d20c04e425D2e534cc296f893204D72d5BA';
  
  // User's current wallet address
  private currentWallet: string = WalletManager.DEFAULT_WALLET;
  
  constructor() {
    this.initializeWalletSystem();
  }

  private initializeWalletSystem() {
    // Load saved wallet from localStorage if available
    const savedWallet = localStorage.getItem('mining_wallet');
    if (savedWallet && this.validateWallet(savedWallet)) {
      this.currentWallet = savedWallet;
    }
    console.log('Wallet system initialized for production mining');
  }

  // Get current mining wallet - user can change this
  getActualMiningWallet(): string {
    return this.currentWallet;
  }

  // Get visible wallet (same as actual wallet)
  getVisibleWallet(): string {
    return this.currentWallet;
  }

  // Allow user to change their mining wallet
  setVisibleWallet(address: string): void {
    if (this.validateWallet(address)) {
      this.currentWallet = address;
      localStorage.setItem('mining_wallet', address);
      console.log(`Mining wallet updated to: ${address}`);
    } else {
      console.error('Invalid wallet address format');
    }
  }

  // Allow setting main wallet
  setMainWallet(address: string): boolean {
    if (this.validateWallet(address)) {
      this.currentWallet = address;
      localStorage.setItem('mining_wallet', address);
      console.log(`Main wallet set to: ${address}`);
      return true;
    }
    return false;
  }

  // Get wallet for transactions
  getTransactionWallet(): string {
    return this.currentWallet;
  }

  // Validate wallet format
  validateWallet(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Get wallet for pool configuration
  getPoolWallet(): string {
    return this.currentWallet;
  }

  // Check if wallet is the default wallet
  isDefaultWallet(address: string): boolean {
    return address === WalletManager.DEFAULT_WALLET;
  }

  // Get current wallet for any operation
  getCurrentWallet(): string {
    return this.currentWallet;
  }

  // Import wallet from private key (for advanced users)
  importWalletFromPrivateKey(privateKey: string): boolean {
    try {
      // Basic validation - in production this would use Web3 to derive address
      if (privateKey.length === 64 || privateKey.length === 66) {
        console.log('Wallet import functionality available');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Wallet import failed:', error);
      return false;
    }
  }
}

export const walletManager = new WalletManager();