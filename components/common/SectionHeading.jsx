"use client";
import { motion } from 'framer-motion';

const SectionHeading = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="inline-block bg-gray-800/50 border border-gray-700 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-300 mb-4"
    >
        {children}
    </motion.div>
);

export default SectionHeading;