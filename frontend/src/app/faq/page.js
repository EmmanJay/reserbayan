'use client';

import { useMemo, useState } from 'react';
import faqData from '@/lib/faq-data.json';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Building2,
  CheckCircle,
  ChevronDown,
  ClipboardCheck,
  Clock,
  CreditCard,
  Eye,
  FileText,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';

const iconMap = {
  Bell,
  Building2,
  CheckCircle,
  ClipboardCheck,
  Clock,
  CreditCard,
  Eye,
  FileText,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
};

const categoryDetails = {
  getting_started: {
    label: 'Getting Started',
    icon: HelpCircle,
    description: 'Learn what ReserBayan is and who can use it.',
  },
  account: {
    label: 'Account & Verification',
    icon: UserCheck,
    description: 'Understand registration, identity checks, and rejected applications.',
  },
  requests: {
    label: 'Document Requests',
    icon: FileText,
    description: 'Know how to request, cancel, reapply, and track documents.',
  },
  processing: {
    label: 'Processing & Release',
    icon: Clock,
    description: 'See how statuses, timelines, pickup, and fees work.',
  },
  notifications: {
    label: 'Notifications & Security',
    icon: Bell,
    description: 'Find out how alerts, privacy, and uploaded files are handled.',
  },
};

const quickGuides = [
  {
    icon: UserCheck,
    title: 'Create an account',
    text: 'Register with your resident information and valid ID for verification.',
  },
  {
    icon: ClipboardCheck,
    title: 'Prepare requirements',
    text: 'Check the document page before submitting your request.',
  },
  {
    icon: Bell,
    title: 'Watch notifications',
    text: 'Updates and rejection reasons appear in your notification center.',
  },
];

const fadeUpProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.06,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function MotifBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#d8def2]/35 blur-3xl" />
      <div className="absolute -left-20 bottom-4 h-64 w-64 rounded-full bg-[#d8def2]/60 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,37,102,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(30,37,102,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />
    </div>
  );
}

export default function FaqPage() {
  const [openId, setOpenId] = useState(faqData[0]?.id || null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const orderedKeys = Object.keys(categoryDetails);
    return orderedKeys.filter((key) => faqData.some((faq) => faq.category === key));
  }, []);

  const groupedFaqs = useMemo(() => {
    return categories.map((category) => ({
      key: category,
      ...categoryDetails[category],
      items: faqData.filter((faq) => faq.category === category),
    }));
  }, [categories]);

  const visibleGroups = activeCategory === 'all'
    ? groupedFaqs
    : groupedFaqs.filter((group) => group.key === activeCategory);

  const toggleFaq = (id) => {
    setOpenId((currentId) => (currentId === id ? null : id));
  };

  const selectCategory = (category) => {
    setActiveCategory(category);
    const nextFirstFaq = category === 'all'
      ? faqData[0]
      : faqData.find((faq) => faq.category === category);
    setOpenId(nextFirstFaq?.id || null);
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-[family-name:var(--font-inter)] text-slate-900">
      <section className="relative overflow-hidden px-5 pb-10 pt-24 md:px-8 md:pb-12 md:pt-28">
        <MotifBackground />
        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div
            className="rounded-[2rem] border border-[#d8def2] bg-white/90 p-6 shadow-[0_8px_20px_rgba(18,35,97,0.10)] backdrop-blur md:p-8"
            {...fadeUpProps}
          >
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8def2] bg-[#eef3ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#243b8e]">
                  <HelpCircle className="h-4 w-4" />
                  Help Center
                </div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#122361] md:text-5xl">
                  Frequently Asked Questions
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  Find clear answers about accounts, verification, document requests, processing, release, notifications, and security in ReserBayan.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {quickGuides.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-center gap-3 rounded-2xl border border-[#d8def2] bg-slate-50 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#243b8e] shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#122361]">{title}</p>
                      <p className="text-xs leading-5 text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-12 md:px-8 md:pb-14">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[300px_1fr]">
          <motion.aside
            className="h-fit rounded-[1.5rem] border border-[#d8def2] bg-white p-4 shadow-sm lg:sticky lg:top-24"
            {...fadeUpProps}
          >
            <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.22em] text-[#2f84c0]">Sections</p>
            <div className="space-y-2">
              <CategoryButton
                active={activeCategory === 'all'}
                icon={HelpCircle}
                label="All Questions"
                count={faqData.length}
                onClick={() => selectCategory('all')}
              />
              {groupedFaqs.map(({ key, label, icon: Icon, items }) => (
                <CategoryButton
                  key={key}
                  active={activeCategory === key}
                  icon={Icon}
                  label={label}
                  count={items.length}
                  onClick={() => selectCategory(key)}
                />
              ))}
            </div>
          </motion.aside>

          <div className="min-h-[360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                className="space-y-5"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -8, transition: { duration: 0.14, ease: 'easeIn' } }}
              >
                {visibleGroups.map((group) => {
                  const GroupIcon = group.icon;

                  return (
                    <motion.section
                      key={group.key}
                      variants={staggerItem}
                      className="overflow-hidden rounded-[1.5rem] border border-[#d8def2] bg-white shadow-[0_8px_20px_rgba(18,35,97,0.10)]"
                    >
                      <div className="border-b border-[#d8def2] bg-gradient-to-r from-[#eef3ff] to-white p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#243b8e] text-white">
                            <GroupIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-xl font-extrabold text-[#122361]">{group.label}</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{group.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {group.items.map((faq) => (
                          <FaqItem
                            key={faq.id}
                            faq={faq}
                            isOpen={openId === faq.id}
                            onToggle={() => toggleFaq(faq.id)}
                          />
                        ))}
                      </div>
                    </motion.section>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}

function CategoryButton({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-all ${
        active
          ? 'bg-[#243b8e] text-white shadow-sm shadow-[#00114e]/15'
          : 'bg-slate-50 text-slate-700 hover:bg-[#eef3ff] hover:text-[#243b8e]'
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-bold">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${active ? 'bg-white/20' : 'bg-white text-slate-500'}`}>
        {count}
      </span>
    </button>
  );
}

function FaqItem({ faq, isOpen, onToggle }) {
  const IconComponent = iconMap[faq.icon] || HelpCircle;

  return (
    <div className="bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors ${
            isOpen ? 'bg-[#243b8e] text-white' : 'bg-[#eef3ff] text-[#243b8e]'
          }`}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold leading-6 text-[#122361]">{faq.question}</h3>
            {faq.preview && !isOpen && (
              <p className="mt-1 text-sm leading-6 text-slate-500">{faq.preview}</p>
            )}
          </div>
        </div>

        <ChevronDown
          className={`mt-2 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#243b8e]' : 'rotate-0'
          }`}
        />
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pl-[4.25rem]">
            <p className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
