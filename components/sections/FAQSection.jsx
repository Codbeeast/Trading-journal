import SectionHeading from '../common/SectionHeading';
import FAQItem from '../common/FAQItem';

const FAQSection = () => (
    <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                <SectionHeading>FAQ'S SECTION</SectionHeading>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Some Common FAQ's</h2>
                <p className="text-gray-400">Get answers to your questions and learn about our platform</p>
            </div>
            <div className="space-y-4">
                <FAQItem
                    question="What is Forenotes?"
                    answer="Discover the power of Artificial Intelligence in trading. Our platform uses smart algorithms and real-time data to give you deep, accurate insights. Make faster, smarter decisions, reduce risks, and boost your trading profits with the help of AI."
                    isOpenDefault={true}
                />
                <FAQItem
                    question="Can I access Forenotes on mobile?"
                    answer="Yes, Forenotes is fully optimized for both desktop and mobile, ensuring a seamless experience everywhere."
                />
                <FAQItem
                    question="Is Forenotes secure?"
                    answer="Yes, Forenotes uses top-tier encryption, multi-layer security, and solutions to keep your assets safe."
                />
                <FAQItem
                    question="Do I need to verify my identity?"
                    answer="Yes, for security and compliance, identity verification is required for certain transactions."
                />
                <FAQItem
                    question="How can I contact support?"
                    answer="Our support team is available 24/7. Reach out via chat or email for any assistance."
                />
            </div>
        </div>
    </section>
);

export default FAQSection;