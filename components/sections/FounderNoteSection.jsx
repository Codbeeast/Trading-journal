import SectionHeading from '../common/SectionHeading';

const FounderNoteSection = () => (
    <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
            <SectionHeading>FOUNDERS NOTE</SectionHeading>
            <blockquote className="text-2xl md:text-4xl font-medium my-8 leading-relaxed">
                "Boost your trading profitability by doubling down on winning strategies and cutting losses on what doesn't work. That's the AI-powered advantage of Forenotes."
            </blockquote>
            <p className="text-gray-400">Founder</p>
        </div>
    </section>
);

export default FounderNoteSection;