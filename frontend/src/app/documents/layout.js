'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  Grid3X3,
  Home,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';

const categoryStyles = {
  'Financial Assistance': { icon: Banknote },
  Residency: { icon: Home },
  Clearance: { icon: ShieldCheck },
  'Permits & Tax': { icon: BriefcaseBusiness },
  'Infrastructure & Zoning': { icon: Building2 },
};

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'time-asc', label: 'Fastest processing' },
  { value: 'requirements-asc', label: 'Fewest requirements' },
];

const processingFilters = [
  { value: 'All', label: 'Any timeline' },
  { value: 'quick', label: 'Same day' },
  { value: 'multi-day', label: 'Multi-day' },
  { value: 'variable', label: 'Variable' },
];

function getCategoryIcon(category) {
  return categoryStyles[category]?.icon || FileText;
}

function getProcessingMinutes(processingTime = '') {
  const normalizedProcessingTime = processingTime.toLowerCase().replace(/\s+/g, ' ').trim();

  if (!normalizedProcessingTime || normalizedProcessingTime.includes('varies')) {
    return Number.POSITIVE_INFINITY;
  }

  const numbers = normalizedProcessingTime.match(/\d+/g)?.map(Number) || [];
  const highestNumber = numbers.length ? Math.max(...numbers) : 0;

  if (normalizedProcessingTime.includes('working day') || normalizedProcessingTime.includes('day')) {
    return highestNumber * 24 * 60;
  }

  if (normalizedProcessingTime.includes('hour')) {
    return highestNumber * 60;
  }

  return highestNumber;
}

function getProcessingBucket(processingTime = '') {
  if (processingTime.toLowerCase().includes('varies')) {
    return 'variable';
  }

  return getProcessingMinutes(processingTime) <= 24 * 60 ? 'quick' : 'multi-day';
}

function sortDocuments(documents, sortBy) {
  return [...documents].sort((firstDocument, secondDocument) => {
    if (sortBy === 'name-asc') {
      return firstDocument.name.localeCompare(secondDocument.name);
    }

    if (sortBy === 'name-desc') {
      return secondDocument.name.localeCompare(firstDocument.name);
    }

    if (sortBy === 'time-asc') {
      return getProcessingMinutes(firstDocument.details?.processingTime) - getProcessingMinutes(secondDocument.details?.processingTime);
    }

    if (sortBy === 'requirements-asc') {
      return (firstDocument.details?.requirements?.length || 0) - (secondDocument.details?.requirements?.length || 0);
    }

    return 0;
  });
}

function CustomDropdown({ icon: Icon, options, value, onChange, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-[100]">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={`flex h-11 w-full items-center gap-2.5 rounded-2xl border px-3 text-left text-sm font-bold text-slate-700 transition-all ${
          isOpen
            ? 'border-[#2f84c0] bg-white ring-4 ring-[#d8def2]'
            : 'border-slate-200 bg-slate-50/90 hover:border-[#c2cbea] hover:bg-white'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0 text-[#2f84c0]" />
        <span className="min-w-0 flex-1 truncate">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-[120] overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#243b8e] to-[#2f84c0] text-white'
                    : 'text-slate-700 hover:bg-[#eef3ff] hover:text-[#122361]'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocumentSidebar({ isOpen, onClose }) {
  const { documentsData } = useDocumentTypes();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'All');
  const [processingFilter, setProcessingFilter] = useState(() => searchParams.get('timeline') || 'All');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'recommended');

  const categories = useMemo(() => [
    'All',
    ...new Set(documentsData.map((doc) => doc.details?.category).filter(Boolean)),
  ], [documentsData]);
  const categoryOptions = useMemo(() => categories.map((category) => ({
    value: category,
    label: category === 'All' ? 'All categories' : category,
  })), [categories]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearchQuery = searchQuery.toLowerCase().trim();
    const documents = documentsData.filter((doc) => {
      const searchableText = [
        doc.name,
        doc.shortDescription,
        doc.details?.category,
        doc.details?.processingTime,
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = !normalizedSearchQuery || searchableText.includes(normalizedSearchQuery);
      const matchesCategory = selectedCategory === 'All' || doc.details?.category === selectedCategory;
      const matchesProcessing = processingFilter === 'All' || getProcessingBucket(doc.details?.processingTime) === processingFilter;

      return matchesSearch && matchesCategory && matchesProcessing;
    });

    return sortDocuments(documents, sortBy);
  }, [documentsData, processingFilter, searchQuery, selectedCategory, sortBy]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (processingFilter !== 'All') params.set('timeline', processingFilter);
    if (sortBy !== 'recommended') params.set('sort', sortBy);

    return params.toString();
  }, [processingFilter, searchQuery, selectedCategory, sortBy]);

  const backHref = queryString ? `/documents?${queryString}` : '/documents';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.nav
        className={`border-r border-slate-200/80 bg-white/95 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 ${
          isOpen
            ? 'fixed left-0 top-18 z-50 h-[calc(100vh-4.5rem)] w-80 translate-x-0 lg:static lg:z-auto lg:h-auto lg:w-[22rem] lg:translate-x-0'
            : 'hidden lg:block lg:w-[22rem] lg:shrink-0'
        }`}
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Link
          href={backHref}
          onClick={onClose}
          className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#243b8e] to-[#2f84c0] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(36,59,142,0.14)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(36,59,142,0.14)]"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Documents
          </span>
          <Grid3X3 className="h-4 w-4 opacity-80" />
        </Link>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/90 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#2f84c0] focus:bg-white focus:ring-4 focus:ring-[#d8def2]"
            />
          </label>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <CustomDropdown
              icon={Tags}
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              ariaLabel="Filter documents by category"
            />
            <CustomDropdown
              icon={Filter}
              options={processingFilters}
              value={processingFilter}
              onChange={setProcessingFilter}
              ariaLabel="Filter documents by timeline"
            />
            <CustomDropdown
              icon={SlidersHorizontal}
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              ariaLabel="Sort documents"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wide text-slate-400">
          <span>{filteredDocuments.length} documents</span>
          <span>Filtered list</span>
        </div>

        <ul className="mt-2 h-[calc(100vh-23rem)] space-y-2 overflow-y-auto pr-1">
          {filteredDocuments.map((doc) => {
            const isActive = pathname === `/documents/${doc.id}`;
            const CategoryIcon = getCategoryIcon(doc.details?.category);
            const requirementsCount = doc.details?.requirements?.length || 0;
            const href = queryString ? `/documents/${doc.id}?${queryString}` : `/documents/${doc.id}`;

            return (
              <li key={doc.id}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                    isActive
                      ? 'border-[#9eaddd] bg-[#243b8e] text-white shadow-[0_8px_18px_rgba(36,59,142,0.14)]'
                      : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#c2cbea] hover:bg-[#eef3ff]'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isActive ? 'bg-white/15 text-white' : 'bg-[#eef3ff] text-[#122361]'
                  }`}>
                    <CategoryIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-[family-name:var(--font-montserrat)] text-sm font-extrabold">{doc.name}</span>
                    <span className={`mt-0.5 flex items-center gap-2 text-xs ${
                      isActive ? 'text-[#eef3ff]' : 'text-slate-500'
                    }`}>
                      <Clock3 className="h-3.5 w-3.5" />
                      {doc.details?.processingTime || 'TBD'}
                      <FileCheck2 className="h-3.5 w-3.5" />
                      {requirementsCount}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </>
  );
}

function DocumentsLayoutContent({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isDetailPage = pathname.startsWith('/documents/') && pathname !== '/documents';

  if (isDetailPage) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA] pt-18">
        <DocumentSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className={`fixed left-4 top-20 z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 lg:hidden ${isMobileSidebarOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
          >
            <PanelLeftOpen className="h-6 w-6" />
          </button>

          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return children;
}

export default function DocumentsLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] pt-18">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d8def2] border-b-[#243b8e]" />
          <p className="mt-4 font-medium text-slate-600">Loading documents...</p>
        </div>
      </div>
    }>
      <DocumentsLayoutContent>{children}</DocumentsLayoutContent>
    </Suspense>
  );
}
