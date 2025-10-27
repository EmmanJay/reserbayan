import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import Footer from '@/components/home/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
