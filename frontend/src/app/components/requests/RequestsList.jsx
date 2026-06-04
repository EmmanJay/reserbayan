import { ArrowRight, Calendar, Clock3, FileText, Hash, Paperclip } from 'lucide-react';
import { StatusBadge } from '@/app/components/ui/status-badge';

const formatDate = (dateValue) => {
  if (!dateValue) return 'Not updated yet';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getAttachmentCount = (request) => {
  if (typeof request.attachmentCount === 'number') return request.attachmentCount;
  return request.attachments?.length || 0;
};

const getStatusAccent = (status) => {
  const statusLower = status?.toLowerCase() || '';

  if (statusLower === 'pending') return 'from-amber-400 to-orange-400';
  if (statusLower === 'approved') return 'from-emerald-500 to-green-500';
  if (statusLower === 'rejected' || statusLower === 'declined') return 'from-red-500 to-rose-500';
  if (statusLower === 'completed') return 'from-blue-600 to-sky-500';
  if (statusLower === 'cancelled') return 'from-slate-500 to-gray-500';
  return 'from-blue-600 to-sky-500';
};

function RequestsList({ requests, onRequestClick }) {
  return (
    <div className="space-y-2.5" role="list" aria-label="Document requests in list view">
      {requests.map((request) => {
        const attachmentCount = getAttachmentCount(request);
        const accent = getStatusAccent(request.status);

        return (
          <button
            key={request.requestId}
            type="button"
            onClick={() => onRequestClick(request)}
            className="group relative grid w-full gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-4 text-left shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_18px_38px_rgba(37,99,235,0.11)] focus:outline-none focus:ring-4 focus:ring-blue-100 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(18rem,1.4fr)_auto]"
            role="listitem"
            aria-label={`View details for ${request.documentName} request`}
          >
            <div className={`absolute bottom-0 left-0 top-0 w-1.5 bg-gradient-to-b ${accent}`} />

            <div className="ml-1 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r ${accent} text-white shadow-md shadow-slate-300/60`}>
                <FileText className="h-7 w-7" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <h3 className="line-clamp-2 break-words font-montserrat text-lg font-extrabold leading-tight text-[#0F2A6B] [overflow-wrap:anywhere]">
                  {request.documentName || 'Untitled Request'}
                </h3>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
                  <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                    <Hash className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">Request {request.requestId}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                    <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                    {attachmentCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-50/80 px-3.5 py-2.5 ring-1 ring-slate-100 lg:self-center">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-slate-400">Purpose</p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600 lg:line-clamp-1">
                {request.details || 'No purpose or details provided.'}
              </p>
            </div>

            <div className="grid gap-2 lg:min-w-[24rem] lg:grid-rows-[auto_auto] lg:justify-items-end">
              <StatusBadge status={request.status} size="sm" className="shrink-0 px-2.5" />

              <div className="flex w-full flex-wrap items-center justify-between gap-2 lg:justify-end">
                <div className="grid flex-1 grid-cols-1 gap-2 text-[0.72rem] font-bold text-slate-600 sm:grid-cols-2 lg:max-w-[20rem]">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                    <span className="truncate">{formatDate(request.submittedAt)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                    <Clock3 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    <span className="truncate">{formatDate(request.updatedAt)}</span>
                  </span>
                </div>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-all group-hover:bg-blue-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default RequestsList;
