'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ClipboardList,
  FileText,
  Grid3X3,
  LayoutList,
  Search,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  Tags,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useRequests } from '@/hooks/useRequests';
import RequestCard from '@/app/components/requests/RequestCard';
import RequestModal from '@/app/components/requests/RequestModal';
import RequestsList from '@/app/components/requests/RequestsList';

const statusKeys = ['pending', 'approved', 'completed', 'rejected', 'cancelled'];

const sortOptions = [
  { value: 'submittedAt', label: 'Date' },
  { value: 'status', label: 'Status' },
  { value: 'documentName', label: 'Document' },
];

function CustomDropdown({ icon: Icon, options, value, onChange, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

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
        className={`flex h-[3.25rem] w-full items-center gap-3 rounded-2xl border bg-white px-4 text-left text-sm font-bold text-slate-700 outline-none transition-all ${
          isOpen
            ? 'border-[#2f84c0] ring-4 ring-[#d8def2]'
            : 'border-slate-200 hover:border-[#c2cbea]'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[120] overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
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
                    ? 'bg-gradient-to-r from-[#243b8e] to-[#2f84c0] text-white shadow-sm'
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

export default function RequestsPage() {
  const { user } = useUser();
  const { requests, loading, cancelRequest, refetchRequests } = useRequests(user);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const router = useRouter();

  const handleRequestClick = useCallback((request) => {
    setSelectedRequest(request);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const statusOptions = useMemo(() => {
    const counts = statusKeys.reduce((accumulator, status) => {
      accumulator[status] = requests.filter((request) => request.status?.toLowerCase() === status).length;
      return accumulator;
    }, {});

    return [
      { value: 'all', label: `All Requests (${requests.length})` },
      { value: 'pending', label: `Pending (${counts.pending || 0})` },
      { value: 'approved', label: `Approved (${counts.approved || 0})` },
      { value: 'completed', label: `Completed (${counts.completed || 0})` },
      { value: 'rejected', label: `Rejected (${counts.rejected || 0})` },
      { value: 'cancelled', label: `Cancelled (${counts.cancelled || 0})` },
    ];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    return requests
      .filter((request) => selectedStatus === 'all' || request.status?.toLowerCase() === selectedStatus)
      .filter((request) => {
        if (!normalizedSearchTerm) return true;

        return [
          request.documentName,
          request.details,
          request.requestId?.toString(),
          request.status,
        ].filter(Boolean).join(' ').toLowerCase().includes(normalizedSearchTerm);
      })
      .sort((firstRequest, secondRequest) => {
        const getSortValue = (request) => {
          if (sortBy === 'submittedAt') {
            const dateValue = new Date(request.submittedAt).getTime();
            return Number.isNaN(dateValue) ? 0 : dateValue;
          }
          if (sortBy === 'status') {
            return request.status?.toLowerCase() || '';
          }
          return request.documentName?.toLowerCase() || '';
        };

        const firstValue = getSortValue(firstRequest);
        const secondValue = getSortValue(secondRequest);

        if (firstValue === secondValue) return 0;
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        return firstValue > secondValue ? sortDirection : -sortDirection;
      });
  }, [requests, searchTerm, selectedStatus, sortBy, sortOrder]);

  const activeFiltersCount = [selectedStatus !== 'all', searchTerm.trim() !== ''].filter(Boolean).length;
  const hasNoRequests = requests.length === 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-8 pt-24" role="status" aria-live="polite">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d8def2] border-b-[#243b8e]" aria-hidden="true" />
          <p className="mt-4 font-medium text-slate-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.main
      className="min-h-screen overflow-hidden bg-[#FAFAFA] px-4 pb-16 pt-24 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl">
        <motion.section
          className="sticky top-1 z-20 mt-4 rounded-3xl border border-white/80 bg-white/90 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_230px_180px_auto_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="search-requests"
                type="text"
                placeholder="Search by document, purpose, or request ID..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-[3.25rem] w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#2f84c0] focus:bg-white focus:ring-4 focus:ring-[#d8def2]"
                aria-describedby="search-help"
              />
              <span id="search-help" className="sr-only">Search by document name, purpose, status, or request ID</span>
            </label>

            <CustomDropdown
              icon={Tags}
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              ariaLabel="Filter requests by status"
            />

            <CustomDropdown
              icon={SlidersHorizontal}
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              ariaLabel="Sort requests"
            />

            <button
              type="button"
              onClick={() => setSortOrder((currentOrder) => currentOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex h-[3.25rem] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-[#122361] shadow-sm transition-all hover:border-[#9eaddd] hover:bg-[#eef3ff] focus:outline-none focus:ring-4 focus:ring-[#d8def2]"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
            </button>

            <div className="grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#122361] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-pressed={viewMode === 'grid'}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-[#122361] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-pressed={viewMode === 'list'}
              >
                <LayoutList className="h-4 w-4" />
                List
              </button>
            </div>
          </div>
        </motion.section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
              }}
              className="text-left text-sm font-bold text-[#122361] hover:text-[#00114e] sm:text-right"
            >
              Clear {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {filteredRequests.length === 0 ? (
          <motion.div
            className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/85 p-12 text-center shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <FileText className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
            <h3 className="mt-4 text-xl font-bold text-slate-800">
              {hasNoRequests ? 'No requests yet' : 'No requests found'}
            </h3>
            <p className="mt-2 text-slate-500">
              {hasNoRequests
                ? "You haven't submitted any document requests yet."
                : 'Try a different keyword or status filter.'}
            </p>
            {hasNoRequests && (
              <button
                type="button"
                onClick={() => router.push('/documents')}
                className="mt-6 rounded-2xl bg-[#243b8e] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#122361] focus:outline-none focus:ring-4 focus:ring-[#d8def2]"
              >
                Browse Documents
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className={viewMode === 'grid'
              ? 'mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
              : 'mt-5 space-y-2.5'}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: 'easeOut' }}
          >
            {viewMode === 'grid' ? (
              filteredRequests.map((request) => (
                <RequestCard key={request.requestId} request={request} onClick={handleRequestClick} />
              ))
            ) : (
              <RequestsList requests={filteredRequests} onRequestClick={handleRequestClick} />
            )}
          </motion.div>
        )}

        {selectedRequest && (
          <RequestModal
            request={selectedRequest}
            user={user}
            onClose={handleCloseModal}
            cancelRequest={cancelRequest}
            onUpdateRequest={refetchRequests}
            onReRequest={refetchRequests}
          />
        )}
      </div>
    </motion.main>
  );
}
