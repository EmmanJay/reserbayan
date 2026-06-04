'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit,
  FileBadge2,
  FileCheck2,
  FileText,
  Filter,
  Grid3X3,
  Home,
  LayoutList,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  Trash2,
  X,
} from 'lucide-react';

const categoryStyles = {
  'Financial Assistance': {
    icon: Banknote,
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
    activeClassName: 'from-blue-600 to-sky-600 text-white shadow-blue-200',
  },
  Residency: {
    icon: Home,
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
    activeClassName: 'from-sky-600 to-blue-700 text-white shadow-sky-200',
  },
  Clearance: {
    icon: ShieldCheck,
    className: 'bg-blue-50 text-blue-800 ring-blue-200',
    activeClassName: 'from-blue-700 to-indigo-800 text-white shadow-blue-200',
  },
  'Permits & Tax': {
    icon: BriefcaseBusiness,
    className: 'bg-sky-50 text-sky-800 ring-sky-200',
    activeClassName: 'from-sky-600 to-cyan-700 text-white shadow-sky-200',
  },
  'Infrastructure & Zoning': {
    icon: Building2,
    className: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
    activeClassName: 'from-indigo-600 to-blue-900 text-white shadow-indigo-200',
  },
};

const sortOptions = [
  { value: 'recent', label: 'Admin default' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'time-asc', label: 'Fastest processing' },
  { value: 'requirements-desc', label: 'Most requirements' },
];

const timelineOptions = [
  { value: 'All', label: 'Any timeline' },
  { value: 'quick', label: 'Same day' },
  { value: 'multi-day', label: 'Multi-day' },
  { value: 'variable', label: 'Variable' },
];

const skipDocumentsAnimationKey = 'reserbayan:skip-documents-animation';

function getCategoryConfig(category) {
  return categoryStyles[category] || {
    icon: FileText,
    className: 'bg-slate-50 text-slate-700 ring-slate-200',
    activeClassName: 'from-slate-700 to-slate-900 text-white shadow-slate-200',
  };
}

function getDocumentTypeId(documentItem) {
  return documentItem.typeId || documentItem.id;
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

function getTimelineBucket(processingTime = '') {
  const normalizedProcessingTime = processingTime.toLowerCase();

  if (normalizedProcessingTime.includes('varies')) {
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

    if (sortBy === 'requirements-desc') {
      return (secondDocument.details?.requirements?.length || 0) - (firstDocument.details?.requirements?.length || 0);
    }

    return 0;
  });
}

function DocumentIcon({ compact = false }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#13286F] to-[#1E88D3] text-white shadow-[0_10px_22px_rgba(30,74,146,0.18)] ${compact ? 'h-11 w-11' : 'h-12 w-12'}`}>
      <div className="absolute inset-1 rounded-xl border border-white/20" />
      <FileBadge2 className={compact ? 'h-5 w-5' : 'h-6 w-6'} strokeWidth={1.8} />
    </div>
  );
}

function CategoryBadge({ category }) {
  const { icon: CategoryIcon, className } = getCategoryConfig(category);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${className}`}>
      <CategoryIcon className="h-3.5 w-3.5" />
      {category || 'General'}
    </span>
  );
}

function CategoryCornerBadge({ category }) {
  const { icon: CategoryIcon } = getCategoryConfig(category);

  return (
    <span
      title={category || 'General'}
      aria-label={category || 'General'}
      className="absolute left-0 top-0 z-0 inline-flex h-9 w-9 items-start justify-start rounded-br-[2rem] bg-gradient-to-br from-blue-600/10 via-sky-300/10 to-transparent p-2 text-blue-700/45"
    >
      <CategoryIcon className="h-3.5 w-3.5" />
    </span>
  );
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
    <div ref={dropdownRef} className="relative z-[80]">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={`flex h-12 w-full items-center gap-3 rounded-2xl border bg-slate-50/80 px-4 text-left text-sm font-bold text-slate-700 outline-none transition-all ${
          isOpen
            ? 'border-blue-400 bg-white ring-4 ring-blue-100'
            : 'border-slate-200 hover:border-blue-200 hover:bg-white'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[100] overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
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
                className={`flex w-full items-center rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
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

function AdminDocumentCard({ doc, viewMode, onDelete, basePath, deleteMode }) {
  const router = useRouter();
  const documentTypeId = getDocumentTypeId(doc);
  const requirementsCount = doc.details?.requirements?.length || 0;
  const processingTime = doc.details?.processingTime || 'Timeline to be confirmed';
  const previewHref = `${basePath}/documents/${documentTypeId}`;
  const previewTargetHref = deleteMode ? `${previewHref}?edit=true` : previewHref;

  if (viewMode === 'list') {
    return (
      <motion.article
        className="group relative grid cursor-pointer gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_24px_56px_rgba(37,99,235,0.13)] md:grid-cols-[auto_1fr_auto]"
        onClick={() => router.push(previewTargetHref)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="flex items-start gap-3">
          <DocumentIcon compact />
          <div className="md:hidden">
            <CategoryBadge category={doc.details?.category} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 hidden flex-wrap items-center gap-2 md:flex">
            <CategoryBadge category={doc.details?.category} />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
              <Clock3 className="h-3.5 w-3.5 text-blue-600" />
              {processingTime}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {requirementsCount} requirements
            </span>
          </div>
          <h3 className="font-montserrat text-xl font-extrabold uppercase leading-tight text-[#0F2A6B]">
            {doc.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
            {doc.shortDescription || doc.details?.longDescription || 'No description has been provided yet.'}
          </p>
        </div>

        {deleteMode && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(documentTypeId, doc);
            }}
            className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100 transition hover:bg-red-600 hover:text-white"
            aria-label={`Delete ${doc.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </motion.article>
    );
  }

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <article
        onClick={() => router.push(previewTargetHref)}
        className="group relative flex h-full min-h-[9.5rem] cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 pr-7 pl-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_22px_46px_rgba(37,99,235,0.13)]"
      >
        <CategoryCornerBadge category={doc.details?.category} />
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[3.5rem] bg-gradient-to-br from-blue-50 to-sky-100 opacity-80 transition-transform duration-300 group-hover:scale-110" />

        <div className="relative z-10 shrink-0">
          <DocumentIcon />
        </div>

        <div className="relative z-10 min-w-0 flex-1">
          <h3 className="font-montserrat text-base font-extrabold uppercase leading-tight tracking-tight text-[#0F2A6B] sm:text-[1.05rem]">
            {doc.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
            {doc.shortDescription || doc.details?.longDescription || 'No description has been provided yet.'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              <Clock3 className="h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span className="truncate">{processingTime}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
              {requirementsCount} items
            </span>
          </div>
        </div>

        {deleteMode && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(documentTypeId, doc);
            }}
            className="absolute bottom-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100 transition hover:bg-red-600 hover:text-white"
            aria-label={`Delete ${doc.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </article>
    </motion.div>
  );
}

export default function AdminDocumentsPage({ disableEntranceAnimation = false } = {}) {
  const pathname = usePathname();
  const isSuperAdmin = pathname?.startsWith('/superadmin');
  const isAddDocumentRoute = pathname?.endsWith('/documents/add');
  const basePath = isSuperAdmin ? '/superadmin' : '/admin';
  const [skipEntranceAnimation, setSkipEntranceAnimation] = useState(disableEntranceAnimation || isAddDocumentRoute);
  const [documentsData, setDocumentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeline, setSelectedTimeline] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const shouldAnimateEntrance = !skipEntranceAnimation;

  useEffect(() => {
    if (sessionStorage.getItem(skipDocumentsAnimationKey) === 'true') {
      setSkipEntranceAnimation(true);
      sessionStorage.removeItem(skipDocumentsAnimationKey);
    }

    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/document-types', {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocumentsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id, documentItem) => {
    setDeleteTarget({ id, name: documentItem?.name || 'this document' });
    setDeletePassword('');
    setDeleteError('');
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
    setDeletePassword('');
    setDeleteError('');
  };

  const openAddDocumentModal = () => {
    window.dispatchEvent(new CustomEvent('reserbayan:open-add-document-modal', {
      detail: { basePath },
    }));
  };

  const handleDelete = async (event) => {
    event.preventDefault();

    if (!deleteTarget) return;

    if (!deletePassword.trim()) {
      setDeleteError('Please enter the Super Admin password to continue.');
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError('');
      const token = localStorage.getItem('token');

      const verifyResponse = await fetch('http://localhost:8080/api/superadmin/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!verifyResponse.ok) {
        const errorBody = await verifyResponse.json().catch(() => null);
        throw new Error(errorBody?.message || 'Unable to verify the Super Admin password.');
      }

      const verification = await verifyResponse.json();
      if (!verification.valid) {
        setDeleteError(verification.message || 'Incorrect Super Admin password.');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/document-types/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to delete document');

      setDocumentsData((currentDocuments) => currentDocuments.filter((doc) => getDocumentTypeId(doc) !== deleteTarget.id));
      setDeleteTarget(null);
      setDeletePassword('');
      setDeleteError('');
    } catch (err) {
      setDeleteError(err.message || 'Error deleting document.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const categoryOptions = useMemo(() => [
    { value: 'All', label: 'All categories' },
    ...[...new Set(documentsData.map((doc) => doc.details?.category).filter(Boolean))]
      .map((category) => ({ value: category, label: category })),
  ], [documentsData]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearchQuery = searchQuery.toLowerCase().trim();

    const matchingDocuments = documentsData.filter((doc) => {
      const searchableContent = [
        doc.name,
        doc.shortDescription,
        doc.details?.longDescription,
        doc.details?.category,
        doc.details?.processingTime,
        ...(doc.details?.requirements || []),
        ...(doc.details?.uses || []),
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = !normalizedSearchQuery || searchableContent.includes(normalizedSearchQuery);
      const matchesCategory = selectedCategory === 'All' || doc.details?.category === selectedCategory;
      const matchesTimeline = selectedTimeline === 'All' || getTimelineBucket(doc.details?.processingTime) === selectedTimeline;

      return matchesSearch && matchesCategory && matchesTimeline;
    });

    return sortDocuments(matchingDocuments, sortBy);
  }, [documentsData, searchQuery, selectedCategory, selectedTimeline, sortBy]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 px-8 pt-24">
        <div className="rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-b-blue-600" />
          <p className="mt-4 font-medium text-slate-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 px-8 pt-24">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <p className="font-bold text-red-600">Error loading documents</p>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 pb-12 pt-24 sm:px-6 lg:px-8"
      initial={shouldAnimateEntrance ? { opacity: 0, y: 32 } : false}
      animate={shouldAnimateEntrance ? { opacity: 1, y: 0 } : undefined}
      transition={shouldAnimateEntrance ? { duration: 0.45, ease: 'easeOut' } : undefined}
    >
      <div className="mx-auto max-w-[100rem] px-10 py-5">
        <section className="relative z-20 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
          <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_180px_180px_180px_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                suppressHydrationWarning={true}
              />
            </label>
            <CustomDropdown
              icon={Tags}
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              ariaLabel="Filter documents by category"
            />
            <CustomDropdown
              icon={Filter}
              options={timelineOptions}
              value={selectedTimeline}
              onChange={setSelectedTimeline}
              ariaLabel="Filter documents by timeline"
            />
            <CustomDropdown
              icon={SlidersHorizontal}
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              ariaLabel="Sort documents"
            />
            <div className="flex h-12 items-center gap-2">
              <div className="grid h-full min-w-[11.5rem] grid-cols-2 rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold transition ${
                    viewMode === 'grid' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-blue-700'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold transition ${
                    viewMode === 'list' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-blue-700'
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                  List
                </button>
              </div>

              <button
                type="button"
                onClick={openAddDocumentModal}
                className="group relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.2)] transition hover:-translate-y-0.5"
                aria-label="Add a new document"
              >
                <Plus className="h-5 w-5" />
                <span className="pointer-events-none absolute right-0 top-[calc(100%+0.55rem)] z-[120] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  Add a new document
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteMode((currentValue) => !currentValue)}
                className={`group relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 ${
                  deleteMode
                    ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                    : 'bg-white text-blue-700 ring-1 ring-blue-100'
                }`}
                aria-label={deleteMode ? 'Hide document delete controls' : 'Show document delete controls'}
              >
                {deleteMode ? <Check className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                <span className="pointer-events-none absolute right-0 top-[calc(100%+0.55rem)] z-[120] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  {deleteMode ? 'Done editing' : 'Manage documents'}
                </span>
              </button>
            </div>
          </div>
        </section>

       

        {filteredDocuments.length === 0 ? (
          <motion.div
            className="mt-6 rounded-[1.75rem] border border-dashed border-blue-200 bg-white/80 p-12 text-center shadow-[0_16px_44px_rgba(15,23,42,0.07)]"
            initial={shouldAnimateEntrance ? { opacity: 0, y: 20 } : false}
            animate={shouldAnimateEntrance ? { opacity: 1, y: 0 } : undefined}
            transition={shouldAnimateEntrance ? { duration: 0.3, ease: 'easeOut' } : undefined}
          >
            <FileText className="mx-auto h-12 w-12 text-blue-300" />
            <h3 className="mt-4 font-montserrat text-2xl font-extrabold text-[#0F2A6B]">No documents found</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">Try a different search, category, timeline, or sort filter.</p>
          </motion.div>
        ) : (
          <motion.div
            className={viewMode === 'grid'
              ? 'mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
              : 'mt-4 grid gap-3'}
            initial={shouldAnimateEntrance ? { opacity: 0, y: 28 } : false}
            animate={shouldAnimateEntrance ? { opacity: 1, y: 0 } : undefined}
            transition={shouldAnimateEntrance ? { duration: 0.4, delay: 0.1, ease: 'easeOut' } : undefined}
          >
            {filteredDocuments.map((doc) => (
              <AdminDocumentCard
                key={doc.id || doc.typeId}
                doc={doc}
                viewMode={viewMode}
                onDelete={requestDelete}
                basePath={basePath}
                deleteMode={deleteMode}
              />
            ))}
          </motion.div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.form
            onSubmit={handleDelete}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.25)]"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between border-b border-red-100 bg-gradient-to-r from-red-50 to-white p-5">
              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-red-600">Confirm deletion</p>
                  <h2 className="mt-1 font-montserrat text-xl font-extrabold text-slate-900">
                    Delete document type?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Enter the Super Admin password to permanently delete <span className="font-extrabold text-slate-800">{deleteTarget.name}</span>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition hover:text-red-600"
                aria-label="Close delete confirmation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label htmlFor="superadmin-delete-password" className="text-sm font-extrabold text-slate-700">
                  Super Admin Password
                </label>
                <input
                  id="superadmin-delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  placeholder="Enter password to continue"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                  autoFocus
                />
                {deleteError && (
                  <p className="mt-2 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-100">
                    {deleteError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(220,38,38,0.2)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteLoading ? 'Verifying...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      )}
    </motion.div>
  );
}
