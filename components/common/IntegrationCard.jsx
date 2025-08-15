"use client";
import { motion } from 'framer-motion';

const IntegrationCard = ({ text, position, icon, delay }) => (
    <motion.div
        className={`absolute ${position} w-48 md:w-56 group`}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
        <div className="relative p-[1px] rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/30 to-purple-500/30 group-hover:from-blue-500/60 group-hover:to-purple-500/60 transition-all duration-300">
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-[11px] p-4 text-center h-full w-full">
                <motion.div
                    className="w-10 h-10 bg-gray-800/50 rounded-lg mb-3 mx-auto flex items-center justify-center text-blue-500 border border-white/10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    {icon}
                </motion.div>
                <p className="text-sm text-gray-300">{text}</p>
            </div>
        </div>
    </motion.div>
);

export default IntegrationCard;