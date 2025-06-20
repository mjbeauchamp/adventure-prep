'use client';

import { useRouter } from 'next/navigation';
import { clientAuth } from '@/lib/firebase/clientApp';
import { useAuth } from './AuthorizationProvider';
import toast, { Toaster } from 'react-hot-toast';

export default function LogoutButton() {
    const { setDisplayName } = useAuth();
    const router = useRouter();
    const showToastError = (message: string) => toast(message, {
        className: 'toast-error',
    });
    const handleLogout = async () => {
        try {
            if (clientAuth) {
                await clientAuth.signOut();
                setDisplayName('');
            }   
            
            // TODO: update this router push so it'll only run if the user logs out on a protected page
            router.push('/');
        } catch (error) {
            console.error("Logout failed:", error);
            showToastError(`There was an error logging out`);
        }
    };

  return (
    <>
        <Toaster />
        <button onClick={handleLogout} className="btn btn-primary">Logout</button>
    </>
  );
}