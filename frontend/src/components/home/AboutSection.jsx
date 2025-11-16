'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardCheck, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

function HorizontalImageCarousel({ images }) {
  const carouselRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: carouselRef,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '-200%']);

  return (
    <section
      ref={carouselRef}
      className="py-12 md:py-16 bg-gray-50 overflow-hidden relative z-10"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="font-montserrat text-4xl md:text-5xl font-extrabold text-blue-900 text-center mb-12 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} // Fixed y: 0.5 to y: 0
          transition={{ duration: 0.7 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          All Your Documents.
          <br />
          One Secure Platform.
        </motion.h2>

        <motion.div
          className="flex gap-4"
          style={{ x }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {images.map((src, index) => (
            <div key={index} className="flex-shrink-0 w-1/2 md:w-1/3">
              <div className="relative aspect-square bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <Image
                  src={src}
                  alt={`Document preview ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  style={{ objectFit: 'cover', objectPosition: 'top' }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default function AboutSection() {
  const carouselImages = [
    '/documents/certificate-of-indigency.png',
    '/documents/barangay-clearance.png',
    '/documents/first-time-jobseeker.png',
    '/documents/certificate-of-indigency.png',
    '/documents/barangay-clearance.png',
    '/documents/first-time-jobseeker.png',
    '/documents/certificate-of-indigency.png',
    '/documents/barangay-clearance.png',
    '/documents/first-time-jobseeker.png',
  ];



  const fadeUpProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6, ease: 'easeOut' },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-montserrat font-extrabold leading-tight bg-gradient-to-r from-[#1E2566] via-[#2F87C3] to-[#1E2566] bg-clip-text text-transparent mb-8 mt-8 animate-fade-in">
            About ReserBayan
          </h1>
          <motion.p
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed mb-4"
            {...fadeUpProps}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Revolutionizing barangay document requests with digital innovation and community-focused solutions.
          </motion.p>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            <motion.div
              className="space-y-6 flex flex-col justify-center"
              {...fadeUpProps}
            >
              <p className="text-xl leading-relaxed text-neutral-700 dark:text-neutral-300">
                ReserBayan is a cutting-edge online platform designed to streamline the process of requesting essential barangay documents for Filipino residents.
              </p>
              <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                Born from the need to eliminate long queues and bureaucratic hurdles, our system empowers citizens with convenient, secure, and transparent access to government services.
              </p>
              <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                By leveraging digital technology, we bridge the gap between traditional administrative processes and modern expectations, ensuring that every resident can obtain necessary documents efficiently while promoting accountability and accessibility in local governance.
              </p>
            </motion.div>
            
            <motion.div
              className="relative flex items-center"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="bg-gradient-to-br from-[#1E2566] to-[#2F87C3] rounded-2xl p-8 text-white shadow-2xl w-full h-full flex items-center">
                <div className="text-center w-full">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-white" />
                  <h3 className="text-2xl font-bold mb-2">Digital Innovation</h3>
                  <p className="text-gray-200">Transforming traditional processes into modern digital experiences</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-montserrat font-bold text-center mb-16 text-neutral-800"
            {...fadeUpProps}
          >
            How It Works
          </motion.h2>
          
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              variants={staggerItem}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
            >
              <div className="bg-[#004AAD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Browse Documents</h3>
              <p className="text-neutral-600 leading-relaxed">Explore available barangay documents and select what you need.</p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
            >
              <div className="bg-[#004AAD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <ClipboardCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Learn Requirements</h3>
              <p className="text-neutral-600 leading-relaxed">Review the specific requirements and documents needed for your request.</p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
            >
              <div className="bg-[#004AAD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Submit a Request</h3>
              <p className="text-neutral-600 leading-relaxed">Upload required documents and submit your request online.</p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
            >
              <div className="bg-[#004AAD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Track Status</h3>
              <p className="text-neutral-600 leading-relaxed">Monitor your request progress in real-time from submission to completion.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <HorizontalImageCarousel images={carouselImages} />

      {/* Vision & Mission Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUpProps}>
            <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-neutral-800 mb-4">Our Purpose</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">Driving innovation in local governance through technology and community empowerment</p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              variants={staggerItem}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-neutral-800">Vision</h2>
              </div>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                The platform aims to modernize barangay services by making government support accessible to all Filipino residents. We envision a future where digital innovation eliminates barriers, fosters transparency, and promotes efficient processes that serve the community's needs effectively.
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-[#2F87C3] to-[#1E2566] w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-neutral-800">Mission</h2>
              </div>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                To empower citizens through digital processing of barangay documents, providing fast, reliable, and optimized service delivery. We are committed to reducing time spent in physical queues and enhancing the overall experience of accessing essential government services.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-r from-[#0B1D4E] via-[#1E2566] to-[#0B1D4E] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h2
            className="text-4xl md:text-5xl font-montserrat font-bold mb-8"
            {...fadeUpProps}
          >
            Ready to Get Started?
          </motion.h2>
          
          <motion.p
            className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed"
            {...fadeUpProps}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore our collection of barangay documents and experience the convenience of digital processing today.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.div variants={staggerItem}>
              <Link href="/homepage">
                <Button className="bg-gradient-to-r from-[#004AAD] to-[#2F87C3] hover:from-[#003A88] hover:to-[#1E2566] text-white px-10 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  View Documents
                </Button>
                {/* ⭐️⭐️⭐️ THIS IS THE FIX ⭐️⭐️⭐️ */}
                {/* The extra </Button> tag was removed from here */}
              </Link>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent('showSignUp'))}
                className="bg-white text-[#0B1D4E] hover:bg-gray-100 px-10 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white hover:border-gray-200"
              >
                Sign Up
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}