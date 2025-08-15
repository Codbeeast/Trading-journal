import { CheckCircle, XCircle } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import ComparisonItem from '../common/ComparisonItem';

const ComparisonSection = () => (
    <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
                <SectionHeading>COMPARISON</SectionHeading>
                <h2 className="text-4xl md:text-5xl font-bold mb-3.5 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Why Forenotes Stands Out</h2>
                <p className="text-gray-400">See how we compare against others in performance, growth</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-gray-800">
                    <h3 className="text-2xl font-bold mb-6 text-center">Forenotes</h3>
                    <ul className="space-y-4">
                        <ComparisonItem text="Effortless & Fast Trading" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
                        <ComparisonItem text="Highly scalable & flexible" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
                        <ComparisonItem text="Advanced dashboard control" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
                        <ComparisonItem text="Built-in AI-driven analytics" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
                        <ComparisonItem text="User-friendly & intuitive design" icon={<CheckCircle className="w-5 h-5 text-blue-400" />} />
                    </ul>
                </div>
                <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-gray-800">
                    <h3 className="text-2xl font-bold mb-6 text-center">Others</h3>
                    <ul className="space-y-4">
                        <ComparisonItem text="Tiresome" icon={<XCircle className="w-5 h-5 text-red-500" />} />
                        <ComparisonItem text="Rigid and non-scalable" icon={<XCircle className="w-5 h-5 text-red-500" />} />
                        <ComparisonItem text="Basic dashboard functionalities" icon={<XCircle className="w-5 h-5 text-red-500" />} />
                        <ComparisonItem text="Lack of advanced analytics" icon={<XCircle className="w-5 h-5 text-red-500" />} />
                        <ComparisonItem text="Outdated and complex interfaces" icon={<XCircle className="w-5 h-5 text-red-500" />} />
                    </ul>
                </div>
            </div>
        </div>
    </section>
);

export default ComparisonSection;