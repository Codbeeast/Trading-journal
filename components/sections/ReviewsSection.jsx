"use client";
import { motion } from 'framer-motion';
import SectionHeading from '../common/SectionHeading';
import ReviewCard from '../common/ReviewCard';

const ReviewsSection = () => {
    const reviews = [
        { review: '"Saves me so much time analyzing charts. Let the AI do the heavy lifting."', author: 'Alex jonas', role: 'Trader', avatar: 'https://framerusercontent.com/images/ETgoVdeITLLIYCHTFNeVuZDMyQY.png' },
        { review: '"Forenotes has been a game-changer for my consistency. Highly recommend!"', author: 'John Robert', role: 'Trader', avatar: 'https://framerusercontent.com/images/QmmaDSjXyuZNNDsZdt23lDVXI.png' },
        { review: '"Good tool to validate my own ideas before pulling the trigger."', author: 'jack hanma', role: 'JK Finance', avatar: 'https://framerusercontent.com/images/7qBFv2WmuOwj4qUFS7XUzQSFL4.jpg' },
        { review: '"The insights are scarily accurate. It\'s like having a trading mentor."', author: 'Samantha Bee', role: 'Day Trader', avatar: 'https://framerusercontent.com/images/0zuVQ2JmvxEtdnpdOq5FtRJxmNY.png' },
        { review: '"I finally understand my emotional triggers thanks to this journal."', author: 'Mike Chen', role: 'Swing Trader', avatar: 'https://framerusercontent.com/images/7qBFv2WmuOwj4qUFS7XUzQSFL4.jpg' },
        { review: '"The UI is clean and intuitive. A joy to use every day."', author: 'Isabelle Rossi', role: 'Forex Trader', avatar: 'https://framerusercontent.com/images/Z9Z59ZjzMfqaMdHGgXmijuQ8hAw.jpg' },
    ];

    return (
        <section className="py-20 text-center px-4">
            <SectionHeading>WALL OF LOVE</SectionHeading>
            <h2 className="text-4xl md:text-5xl font-bold mb-3.5 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Loved by Traders</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-12">Here's what people worldwide are saying about us</p>
            <motion.div
                className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.1 }}
            >
                {reviews.map((review, i) => (
                    <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <ReviewCard {...review} />
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default ReviewsSection;