import { useEffect } from 'react';
import useAppStore from '../store/useAppStore';

/**
 * Wallet connection hook. Automatically listens for account and chain changes.
 */
const useWallet = () => {
  const { wallet, connectWallet, disconnectWallet, addToast } = useAppStore();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        useAppStore.setState((state) => ({
          wallet: { ...state.wallet, address: accounts[0] },
        }));
        addToast({ type: 'info', title: 'Account Changed', message: `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` });
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const chainId = parseInt(chainIdHex, 16);
      const CHAIN_NAMES = { 1: 'Ethereum', 137: 'Polygon', 56: 'BSC', 43114: 'Avalanche', 31337: 'Hardhat' };
      useAppStore.setState((state) => ({
        wallet: { ...state.wallet, chainId, chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}` },
      }));
      addToast({ type: 'info', title: 'Network Changed', message: CHAIN_NAMES[chainId] || `Chain ${chainId}` });
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet, addToast]);

  return { wallet, connectWallet, disconnectWallet };
};

export default useWallet;
