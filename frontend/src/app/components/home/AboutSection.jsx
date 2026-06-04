'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import {
  ArrowRight,
  Building2,
  CheckCircle,
  ClipboardCheck,
  Clock,
  FileText,
  ShieldCheck,
  Users,
} from 'lucide-react';

const fadeUpProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
};

const serviceSteps = [
  {
    icon: FileText,
    title: 'Browse documents',
    text: 'Find the barangay document you need from one organized catalog.',
  },
  {
    icon: ClipboardCheck,
    title: 'Check requirements',
    text: 'Review required details before starting your online request.',
  },
  {
    icon: Clock,
    title: 'Submit online',
    text: 'Send your request and supporting files through a secure form.',
  },
  {
    icon: CheckCircle,
    title: 'Track progress',
    text: 'Monitor status updates from submission through release.',
  },
];

const purposeCards = [
  {
    icon: ShieldCheck,
    title: 'Vision',
    text: 'A barangay service experience where residents can access essential documents with clarity, fairness, and confidence.',
  },
  {
    icon: Building2,
    title: 'Mission',
    text: 'To support local governance with reliable digital processing that reduces queues and keeps residents informed.',
  },
];

function MotifBackground() {
  const motifRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: motifRef,
    offset: ['start end', 'end start'],
  });
  const motifY = useTransform(scrollYProgress, [0, 1], ['-18px', '24px']);

  return (
    <div ref={motifRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        style={{ y: motifY }}
        className="absolute -right-16 top-14 h-56 w-56 rounded-full bg-[#d8def2]/35 blur-3xl"
      />
      <motion.div
        style={{ y: motifY }}
        className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#d8def2]/60 blur-3xl"
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,37,102,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(30,37,102,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />
    </div>
  );
}

function HorizontalImageCarousel({ images }) {
  const carouselRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: carouselRef,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0.08, 0.92], ['0%', '-190%']);

  return (
    <section ref={carouselRef} className="relative overflow-hidden bg-slate-50 py-10 md:py-12">
      <MotifBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8">
        <motion.div className="mb-7 flex flex-col gap-2 md:flex-row md:items-end md:justify-between" {...fadeUpProps}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f84c0]">Document Gallery</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#122361] md:text-3xl">
              Official documents, easier to review
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-600">
            A quick preview of common barangay documents residents can request through ReserBayan.
          </p>
        </motion.div>

        <motion.div
          className="flex gap-4"
          style={{ x }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="w-[58%] flex-shrink-0 sm:w-[42%] lg:w-[29%]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#d8def2] bg-white shadow-[0_8px_20px_rgba(18,35,97,0.10)]">
                <Image
                  src={src}
                  alt={`Document preview ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 58vw, (max-width: 1024px) 42vw, 29vw"
                  className="object-cover object-top"
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
    '/documents/barangay-business-permit.png',
    '/documents/barangay-certificate.png',
    '/documents/first-time-jobseeker.png',
    '/documents/certificate-of-indigency.png',
    '/documents/barangay-clearance.png',
    '/documents/barangay-certificate.png',
    '/documents/certificate-of-indigency.png',
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-[family-name:var(--font-inter)] text-slate-900">
      <section className="relative overflow-hidden px-5 pb-10 pt-24 md:px-8 md:pb-12 md:pt-28">
        <MotifBackground />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <motion.div
            className="rounded-[2rem] border border-[#d8def2] bg-white/90 p-6 shadow-[0_8px_20px_rgba(18,35,97,0.10)] backdrop-blur md:p-8"
            {...fadeUpProps}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8def2] bg-[#eef3ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#243b8e]">
              <ShieldCheck className="h-4 w-4" />
              Barangay Digital Services
            </div>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-[#122361] md:text-5xl">
              About ReserBayan
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              ReserBayan helps residents request barangay documents through a secure and transparent online process built for practical local service delivery.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Online requests', 'Submit anytime'],
                ['Clear tracking', 'Know each status'],
                ['Secure records', 'Protected files'],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-[#122361]">{label}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/documents">
                <Button className="h-11 rounded-full bg-[#243b8e] px-6 text-sm font-bold text-white shadow-sm shadow-[#00114e]/15 hover:bg-[#122361]">
                  View Documents
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent('showSignUp'))}
                className="h-11 rounded-full border border-[#d8def2] bg-white px-6 text-sm font-bold text-[#122361] shadow-sm hover:bg-[#eef3ff]"
              >
                Create Resident Account
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-[2rem] border border-[#d8def2] bg-gradient-to-br from-[#10235F] via-[#1E5FA8] to-[#2f84c0] p-6 text-white shadow-[0_8px_20px_rgba(18,35,97,0.10)] md:p-7"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/15" />
            <div className="absolute right-8 top-10 h-20 w-20 rounded-full border border-white/15" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d8def2]">Service Snapshot</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Digital Barangay Service</h2>
                </div>
                <div className="rounded-2xl bg-white/15 p-3">
                  <Building2 className="h-7 w-7" />
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  { icon: Users, label: 'Resident-focused', text: 'Designed for accessible public service' },
                  { icon: FileText, label: 'Document-ready', text: 'Requirements and status in one place' },
                  { icon: ShieldCheck, label: 'Accountable flow', text: 'Clear tracking from request to release' },
                ].map(({ icon: Icon, label, text }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#122361]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{label}</p>
                      <p className="text-xs leading-5 text-[#eef3ff]">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-6xl">
          <motion.div className="mb-6 max-w-2xl" {...fadeUpProps}>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f84c0]">How It Works</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#122361] md:text-3xl">
              A shorter path from request to release
            </h2>
          </motion.div>

          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
          >
            {serviceSteps.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                variants={staggerItem}
                className="group rounded-2xl border border-[#d8def2] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(18,35,97,0.10)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#243b8e] transition-colors group-hover:bg-[#243b8e] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-300">0{index + 1}</span>
                </div>
                <h3 className="text-base font-extrabold text-[#122361]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <HorizontalImageCarousel images={carouselImages} />

      <section className="relative overflow-hidden px-5 py-10 md:px-8 md:py-12">
        <MotifBackground />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <motion.div {...fadeUpProps}>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2f84c0]">Our Purpose</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#122361] md:text-3xl">
              Built for residents and accountable service
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The platform supports local offices with a cleaner request flow while helping residents understand what to prepare and when to expect updates.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-4 md:grid-cols-2"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {purposeCards.map(({ icon: Icon, title, text }) => (
              <motion.div key={title} variants={staggerItem} className="rounded-2xl border border-[#d8def2] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#243b8e] to-[#2f84c0] text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#122361]">{title}</h3>
                </div>
                <p className="text-sm leading-6 text-slate-600">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-12 md:px-8 md:pb-14">
        <motion.div
          className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[1.75rem] border border-[#d8def2] bg-white p-5 shadow-[0_8px_20px_rgba(18,35,97,0.10)] md:flex-row md:items-center md:justify-between md:p-6"
          {...fadeUpProps}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f84c0]">Start Here</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#122361]">Ready to request a document?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Browse available services, review requirements, and begin with a resident account.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/documents">
              <Button className="h-11 rounded-full bg-[#243b8e] px-6 text-sm font-bold text-white hover:bg-[#122361]">
                View Documents
              </Button>
            </Link>
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('showSignUp'))}
              className="h-11 rounded-full bg-slate-100 px-6 text-sm font-bold text-[#122361] hover:bg-[#eef3ff]"
            >
              Sign Up
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
