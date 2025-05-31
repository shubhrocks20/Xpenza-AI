import { createRoot } from 'react-dom/client'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes.tsx';
import { AuthProvider } from './components/AuthContext.tsx';
import { Toaster } from 'sonner';

const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>

    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>

      <RouterProvider router={router} />
      </AuthProvider>

      
  
    </GoogleOAuthProvider>
    <Toaster />
    </QueryClientProvider>

)
