'use client';

import { useState, useEffect } from 'react';
import faqData from '@/lib/faq-data.json';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Clock,
  FileText,
  Eye,
  DollarSign,
  CheckSquare,
  XCircle,
  ChevronDown,
  Loader2, // Added for loading spinner
} from 'lucide-react';

// Map icon names from JSON to actual components
const iconMap = {
  HelpCircle: (props) => <HelpCircle {...props} />,
  Clock: (props) => <Clock {...props} />,
  FileText: (props) => <FileText {...props} />,
  Eye: (props) => <Eye {...props} />,
  DollarSign: (props) => <DollarSign {...props} />,
  CheckSquare: (props) => <CheckSquare {...props} />,
  XCircle: (props) => <XCircle {...props} />,
};

// This is the main component for your FAQ page
export default function FaqPage() {
  const [faqs, setFaqs] = useState([]); // State to hold the fetched data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [openId, setOpenId] = useState(null); // Tracks which FAQ item is open

  useEffect(() => {
    // Load the FAQ data from the imported JSON file
    setFaqs(faqData);
    // Automatically open the first question
    if (faqData.length > 0) {
      setOpenId(faqData[0].id);
    }
    setLoading(false);
  }, []); // Empty dependency array ensures this runs once on mount

  // Toggles the accordion
  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <motion.section
      className="bg-white py-24 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* --- Header --- */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <h2 className="text-4xl pt-10 md:text-5xl font-extrabold text-blue-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Everything you need to know about ReserBayan. Can&apos;t find the answer
            you&apos;re looking for? Feel free to{' '}
            <a href="#" className="font-medium text-[#004AAD] hover:underline">
              chat with our friendly team
            </a>
            .
          </p>
        </motion.div>

        {/* --- FAQ List --- */}
        {loading ? (
          // Show a loading spinner while fetching data
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 text-[#08115c] animate-spin" />
          </div>
        ) : (
          // Once loaded, display the FAQ list
          <div className="border-b border-gray-200">
            {faqs.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => toggleFaq(faq.id)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

// This is the individual accordion item component
function FaqItem({ faq, isOpen, onToggle }) {
  // Get the correct icon component from the map, default to HelpCircle
  const IconComponent = iconMap[faq.icon] || iconMap['HelpCircle'];

  return (
    <div className="border-t border-gray-200">
      {/* --- Question Button --- */}
      <button
        onClick={onToggle}
        className="flex justify-between items-start w-full py-6 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E6EEF9] text-[#004AAD] flex items-center justify-center">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="text-lg font-montserrat font-semibold" style={{ color: '#08115c' }}>
            {faq.question}
          </span>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <ChevronDown
            className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 ease-in-out ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
      </button>

      {/* --- Answer Panel (Animated) --- */}
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-6 pl-12 pr-4">
            <p className="text-base text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}