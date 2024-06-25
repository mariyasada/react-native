import { makeAutoObservable } from 'mobx';

class WalletStore {
  bitcoinWalletAddress: string = '';
  polygonWalletAddress: string = '';
  error: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  setWalletAddress(network: 'bitcoin' | 'polygon', address: string) {
    if (network === 'bitcoin') {
      this.bitcoinWalletAddress = address;
    } else if (network === 'polygon') {
      this.polygonWalletAddress = address;
    }
  }

  setError(error: string) {
    this.error = error;
  }
}

export const walletStore = new WalletStore();
