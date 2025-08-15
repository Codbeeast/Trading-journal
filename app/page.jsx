"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GridBeamBackground from '@/components/GridBeamBackground';
import HeroSection from '@/components/sections/HeroSection';
import TrustedBySection from '@/components/sections/TrustedBySection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import FounderNoteSection from '@/components/sections/FounderNoteSection';
import IntegrationsSection from '@/components/sections/IntegrationsSection';
import ComparisonSection from '@/components/sections/ComparisonSection';
import PricingSection from '@/components/sections/PricingSection';
import FAQSection from '@/components/sections/FAQSection';
import CTASection from '@/components/sections/CTASection';

const Page = () => {
    return (
        <div className="text-white font-sans min-h-screen relative">
            {/* Background component */}
            <GridBeamBackground />
            
            {/* Navigation */}
            <Navbar />
            
            {/* Main content with proper z-index */}
            <main className="overflow-hidden mt-5 relative z-10">
                {/* Hero Section */}
                <HeroSection />

                {/* Trusted By Section */}
                <TrustedBySection />

                {/* Features Section */}
                <FeaturesSection />

                {/* Benefits Section */}
                <BenefitsSection />

                {/* Reviews Section */}
                <ReviewsSection />

                {/* Founder's Note Section */}
                <FounderNoteSection />

                {/* Integrations Section */}
                <IntegrationsSection />

                {/* Comparison Section */}
                <ComparisonSection />

                {/* Pricing Section */}
                <PricingSection />

                {/* FAQ Section */}
                <FAQSection />

                {/* CTA Section */}
                <CTASection />
            </main>
            
            {/* Footer with proper z-index */}
            <div className="relative z-10">
                <Footer />
            </div>
        </div>
    );
};

export default Page;