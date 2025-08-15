"use client";
import { motion } from 'framer-motion';

const AnimatedInfoCard = ({ title, imgSrc, icon, position, delay }) => (
    <motion.div
        className={`absolute ${position} z-10`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.1, zIndex: 20, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)' }}
    >
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-2 flex items-center gap-2">
            <img src={imgSrc} alt={title} className="w-8 h-8 rounded-full" />
            <span className="font-semibold text-sm">{title}</span>
            {icon}
        </div>
    </motion.div>
);

export default AnimatedInfoCard;