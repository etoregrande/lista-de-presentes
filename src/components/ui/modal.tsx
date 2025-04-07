import { motion } from "framer-motion";

export default function Modal(
    { children, handleCloseModal }
        :
        { children: React.ReactNode, handleCloseModal: () => void }
) {
    return (
        <motion.div
            onClick={handleCloseModal}
            className="flex fixed inset-0 z-50 items-center justify-center md:bg-[rgba(0,0,0,0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white md:p-6 md:rounded-2xl shadow-lg w-full md:max-w-xl h-full md:h-auto overflow-y-auto"
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.1 }}
            >
                {children}
            </motion.div>
        </motion.div >
    )
}
