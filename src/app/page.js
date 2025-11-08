import HeroSection from '@/components/home/HeroSection';
// You can also add other homepage-specific sections here
// import FeaturesSection from '@/components/home/FeaturesSection';

export default function Home() {
  return (
    // No <div> or <main> needed, layout.js handles it.
    // Just return the sections for the homepage.
    <>
      <HeroSection />
      {/* <FeaturesSection /> */}
    </>
  );
}