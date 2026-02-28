import useAppStore from '../store/useAppStore';

/**
 * Convenience hook for triggering toast notifications.
 *
 * @example
 * const toast = useToast();
 * toast.success('Mint complete!', 'Your ENFT has been minted successfully.');
 * toast.error('Tx failed', err.message);
 */
const useToast = () => {
  const { addToast } = useAppStore();

  return {
    success: (message, title) => addToast({ type: 'success', title, message }),
    error:   (message, title) => addToast({ type: 'error',   title, message }),
    warning: (message, title) => addToast({ type: 'warning', title, message }),
    info:    (message, title) => addToast({ type: 'info',    title, message }),
    custom:  (opts)           => addToast(opts),
  };
};

export default useToast;
