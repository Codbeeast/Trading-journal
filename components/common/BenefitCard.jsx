"use client";
import { motion } from 'framer-motion';

const BenefitCard = ({ title, description, icon }) => (
    <motion.div
        className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-gray-800 text-left"
        whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.3)" }}
        transition={{ type: 'spring', stiffness: 300 }}
    >
        <div className="w-12 h-12 bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-blue-500">
            {icon}
        </div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-gray-400">{description}</p>
    </motion.div>
);

export default BenefitCard;