import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

let toastId = 0;

const useAppStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        /* ─── Wallet ─────────────────────────────────────────────── */
        wallet: {
          connected:   false,
          address:     null,
          chainId:     null,
          chainName:   null,
          balance:     '0',
          provider:    null,
        },
        connectWallet: async () => {
          if (typeof window === 'undefined' || !window.ethereum) {
            get().addToast({ type: 'error', title: 'No Wallet Found', message: 'Please install MetaMask or a compatible wallet.' });
            return;
          }
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);
            const CHAIN_NAMES = {
              1: 'Ethereum', 137: 'Polygon', 56: 'BSC', 43114: 'Avalanche', 31337: 'Hardhat',
            };
            set({
              wallet: {
                connected: true,
                address:   accounts[0],
                chainId,
                chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
                balance:   '0',
                provider:  window.ethereum,
              },
            });
            get().addToast({ type: 'success', title: 'Wallet Connected', message: `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)} connected` });
          } catch (err) {
            get().addToast({ type: 'error', title: 'Connection Failed', message: err.message });
          }
        },
        disconnectWallet: () => {
          set({ wallet: { connected: false, address: null, chainId: null, chainName: null, balance: '0', provider: null } });
          get().addToast({ type: 'info', message: 'Wallet disconnected' });
        },

        /* ─── Toasts ─────────────────────────────────────────────── */
        toasts: [],
        addToast: ({ type = 'info', title, message, duration = 4000 }) => {
          const id = ++toastId;
          set((state) => ({ toasts: [...state.toasts, { id, type, title, message, duration }] }));
        },
        removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

        /* ─── UI State ───────────────────────────────────────────── */
        sidebarOpen: false,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        searchQuery: '',
        setSearchQuery: (q) => set({ searchQuery: q }),

        /* ─── System Health ──────────────────────────────────────── */
        systemHealth: {
          treasury:   100,
          enft:        98,
          governance: 100,
          technical:   99,
          currency:    97,
          butterfly:  100,
        },
        updateHealth: (system, value) =>
          set((state) => ({ systemHealth: { ...state.systemHealth, [system]: value } })),

        /* ─── Vault Stats ────────────────────────────────────────── */
        vaultStats: {
          tripleStack:  { balance: '17T',  dailyYield: '0.37T', totalYield: '12.5T', health: 100 },
          fourStack:    { balance: '14T',  dailyYield: '0.31T', totalYield: '9.8T',  health: 100 },
          enftVault:    { balance: '8.5T', dailyYield: '0.19T', totalYield: '5.1T',  health: 98  },
          inheritance:  { balance: '11T',  dailyYield: '0.24T', totalYield: '7.7T',  health: 99  },
        },

        /* ─── ENFT Stats ─────────────────────────────────────────── */
        enftStats: {
          totalMinted:   12847,
          genesis:        1000,
          military:       4200,
          cosmic:         3647,
          heritage:       2500,
          inheritance:    1500,
        },

        /* ─── Governance ─────────────────────────────────────────── */
        activeProposals: [
          { id: 'GOV-001', title: 'Zone Redistribution: North America Prime Dome', votes: { yes: 9, no: 2, abstain: 1 }, status: 'active', deadline: '2026-03-05' },
          { id: 'GOV-002', title: 'BLEU Sovereign ENFT mint cap increase to 500K', votes: { yes: 11, no: 0, abstain: 1 }, status: 'passed',  deadline: '2026-02-25' },
          { id: 'GOV-003', title: 'Butterfly Protocol v2.0 architecture upgrade',  votes: { yes: 7,  no: 3, abstain: 2 }, status: 'active', deadline: '2026-03-10' },
        ],
      }),
      {
        name: 'ev0lverse-store',
        partialize: (state) => ({
          wallet:    state.wallet,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);

export default useAppStore;
