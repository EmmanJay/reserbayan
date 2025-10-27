import Image from 'next/image';
import { Check } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-[#FAF9F6] pt-32 pb-20 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Text Content */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-[#1E2566] to-[#2F87C3] bg-clip-text text-transparent">
            Streamlined Document Requests for Every Residents
          </h1>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl">
            Experience hassle-free government document processing with <span className="font-semibold">ReserBayan</span>. <span className="font-semibold">Quick</span>, <span className="font-semibold">secure</span> and designed for the community.
          </p>

          <p className="text-base text-gray-600 font-medium leading-relaxed">
            Documents such as <span className="font-semibold text-[#1E2566]">Cedula</span>, <span className="font-semibold text-[#1E2566]">Barangay Certificate</span>, <span className="font-semibold text-[#1E2566]">Certificate of Indigency</span> and many more!
          </p>

          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <Check className="text-[#1CC88A] w-5 h-5" />
              <span className="text-gray-800 font-medium">On the day - 24 hours processing time</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="text-[#1CC88A] w-5 h-5" />
              <span className="text-gray-800 font-medium">Real time status checking</span>
            </li>
          </ul>

          <button className="bg-[#004AAD] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#003A88] transition-colors">
            Start requesting now!
          </button>
        </div>

        {/* Right Column - Image Section */}
        <div className="relative">
          <div className="flex justify-center items-end mt-5">
            <Image
              src="/documents/certificate-of-indigency.png"
              alt="Certificate of Indigency"
              className="w-[220px] md:w-[260px] -mr-35 rounded-xl shadow-lg z-10 transition-transform hover:scale-105"
              width={260}
              height={340}
            />
            <Image
              src="/documents/first-time-jobseeker.png"
              alt="First Time Job Seeker"
              className="w-[260px] md:w-[300px] -mr-35 rounded-xl shadow-xl z-20 transition-transform hover:scale-105"
              width={300}
              height={380}
            />
            <Image
              src="/documents/barangay-clearance.png"
              alt="Barangay Clearance"
              className="w-[300px] md:w-[360px] rounded-xl shadow-2xl z-30 transition-transform hover:scale-105"
              width={360}
              height={440}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}