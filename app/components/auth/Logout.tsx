'use client';

import { useRouter } from 'next/navigation';
import { clientAuth } from '@/lib/firebase/clientApp';
import { userLogout } from '@/lib/firebase/actions/userLogout'; 
import toast, { Toaster } from 'react-hot-toast';

export default function Logout() {
    const router = useRouter();
    const showToastError = (message: string) => toast(message, {
        className: 'toast-error',
    });
    const handleLogout = async () => {
        try {
            await clientAuth.signOut();

            // After client logout, call the server action to delete the session cookie so 
            // the user is logged out on the server side as well
            await userLogout();
            
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