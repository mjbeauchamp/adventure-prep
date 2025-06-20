'use client'

import Login from "./auth/Login";
import LogoutButton from "./auth/LogoutButton";
import { useAuth } from "./auth/AuthorizationProvider";


export default function NavBar() {
    const {user, displayName} = useAuth();

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <div className="text-lg font-bold">My App</div>
            <ul className="flex space-x-4">
            <li>
                <a href="/" className="hover:underline">Home</a>
            </li>
            {user ? 
                <span>
                    {displayName ? <span>Welcome, {displayName}!</span> : <span>Welcome!</span>}
                    <li><LogoutButton /></li>
                </span> : 
                <li><Login /></li>}
            </ul>
        </nav>
    );
}