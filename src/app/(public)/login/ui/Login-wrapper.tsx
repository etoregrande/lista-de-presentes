'use client'

import { useState } from 'react'
import { LoginForm } from './Login-form'
import { ForgotPasswordForm } from './Forgot-password-form'
import { AnimatePresence, motion } from 'framer-motion'

export function LoginWrapper() {
    const [forgotPassword, setForgotPassword] = useState<boolean>(false)

    return (
        <div className="flex flex-col space-y-4 justify-center px-4 h-screen max-w-sm mx-auto">
            <motion.div
                layout
                className="flex flex-col items-center space-y-4"
                transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.h1
                        key={forgotPassword ? 'title-forgot' : 'title-login'}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-center"
                    >
                        {!forgotPassword ? 'Fazer login' : 'Recuperar senha'}
                    </motion.h1>
                </AnimatePresence>

                <motion.div
                    layout
                    className='flex flex-col gap-4 sm:min-w-80 bg-white p-8 shadow-2xl rounded-sm'
                    transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={forgotPassword ? 'forgot' : 'login'}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {forgotPassword ? (
                                <ForgotPasswordForm setForgotPassword={setForgotPassword} />
                            ) : (
                                <LoginForm setForgotPassword={setForgotPassword} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    )
}
