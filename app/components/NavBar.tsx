'use client'

import Login from './auth/Login'
import Logout from "./auth/Logout";
import { useAuth } from "../context/AuthorizationProvider";


export default function NavBar() {
    const {user, loading} = useAuth();

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <div className="text-lg font-bold">My App</div>
            <ul className="flex space-x-4">
            <li>
                <a href="/" className="hover:underline">Home</a>
            </li>
            {user ? <li><Logout /></li> : <li><Login /></li>}
            </ul>
        </nav>
    );
}