"use client";
import { motion } from 'framer-motion';

const AnimatedSection = ({ children, className = '', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        className={className}
    >
        {children}
    </motion.div>
);

export default AnimatedSection;