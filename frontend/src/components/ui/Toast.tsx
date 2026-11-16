// Toast wrapper around react-hot-toast
import toast, { Toaster } from 'react-hot-toast';
export { toast };

export const FoodMateToaster = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3500,
      style: {
        background: '#fff',
        color: '#46564E',
        borderRadius: '14px',
        boxShadow: '0 4px 24px rgba(70,86,78,0.12)',
        padding: '12px 16px',
        fontSize: '14px',
      },
      success: {
        iconTheme: { primary: '#BFE8D5', secondary: '#46564E' },
      },
      error: {
        iconTheme: { primary: '#fca5a5', secondary: '#fff' },
      },
    }}
  />
);
