'use client'

import { useLayoutEffect } from "react";
import { motion } from "framer-motion";

export default function Modal({
    children,
    handleCloseModal,
}: {
    children: React.ReactNode;
    handleCloseModal: () => void;
}) {
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;

    const backdropVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants = isMobile
        ? {
            initial: { y: "100%" },
            animate: { y: 0 },
            exit: { y: "100%" },
        }
        : {
            initial: { scale: 0.6, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.6, opacity: 0 },
        };

    useLayoutEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    return (
        <motion.div
            onClick={handleCloseModal}
            className="flex fixed inset-0 z-50 items-end md:items-center justify-center bg-black/50"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
        >
            <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full h-[80%] no-scrollbar md:h-auto md:max-w-xl rounded-t-4xl md:rounded-2xl md:p-6 shadow-lg overflow-y-auto"
                variants={modalVariants}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
