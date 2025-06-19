'use client'

import { Description, Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { useState } from 'react'
import GoogleLoginButton from './GoogleBtn';
import EmailSignInBtn from './EmailSignInBtn';
import EmailSignInForm from './EmailSignInForm';
import { RiCloseCircleFill } from "react-icons/ri";
import { IconContext } from "react-icons";

export default function Login() {
  let [isOpen, setIsOpen] = useState(false)
  let [isEmailSignIn, setIsEmailSignIn] = useState(false)

  function closeModal() {
    setIsOpen(false)
    setIsEmailSignIn(false)
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Sign In</button>
      <Dialog 
        open={isOpen}
        onClose={closeModal}
        transition
        className="relative z-50 transition duration-300 ease-out data-closed:opacity-0"
      >
        <DialogBackdrop className="fixed inset-0 bg-green-950" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4 transition duration-300 ease-in-out">
          <DialogPanel className="relative flex flex-col items-center max-w-lg sm:min-w-md space-y-4 border bg-white px-12 pb-14 pt-20 rounded-lg shadow-lg">
            <button onClick={closeModal} className='absolute right-8 top-8' aria-label='Close login dialog'>
                {/* <span className="material-symbols-outlined">cancel</span> */}
                <IconContext.Provider value={{ size: "1.8em", color: "gray" }}>
                  <RiCloseCircleFill />
                </IconContext.Provider>
            </button>
            <DialogTitle className="font-bold">Sign In</DialogTitle>
            {isEmailSignIn ? null : <Description>Welcome! How would you like to start your adventure?</Description>}
            {isEmailSignIn ? <EmailSignInForm closeLoginDialog={closeModal} goBack={() => setIsEmailSignIn(false)}  /> :
              <div className="flex flex-col items-center gap-4 mt-6 w-full">
                <div className="flex gap-4 w-3/4">
                  <GoogleLoginButton closeLoginDialog={closeModal} />
                </div>
                <div className="flex gap-4 w-3/4">
                  <EmailSignInBtn chooseEmailSignIn={() => setIsEmailSignIn(true)} />
                </div>
              </div>
            }
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}