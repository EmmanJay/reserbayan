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

  if (statusLower === 'pending') {
    return {
      bar: 'from-amber-400 via-orange-400 to-yellow-400',
      glow: 'from-amber-50 to-orange-50',
      icon: 'from-amber-500 to-orange-500',
    };
  }
  if (statusLower === 'approved') {
    return {
      bar: 'from-emerald-500 via-green-500 to-teal-400',
      glow: 'from-emerald-50 to-green-50',
      icon: 'from-emerald-600 to-green-500',
    };
  }
  if (statusLower === 'rejected' || statusLower === 'declined') {
    return {
      bar: 'from-red-500 via-rose-500 to-red-400',
      glow: 'from-red-50 to-rose-50',
      icon: 'from-red-600 to-rose-500',
    };
  }
  if (statusLower === 'completed') {
    return {
      bar: 'from-[#243b8e] via-[#2f84c0] to-[#2f84c0]',
      glow: 'from-[#eef3ff] to-[#eef3ff]',
      icon: 'from-[#243b8e] to-[#2f84c0]',
    };
  }
  if (statusLower === 'cancelled') {
    return {
      bar: 'from-slate-500 via-gray-500 to-slate-400',
      glow: 'from-slate-50 to-gray-50',
      icon: 'from-slate-600 to-gray-500',
    };
  }

  return {
    bar: 'from-[#243b8e] via-[#2f84c0] to-[#2f84c0]',
    glow: 'from-[#eef3ff] to-[#eef3ff]',
    icon: 'from-[#122361] to-[#2f84c0]',
  };
};

function RequestCard({ request, onClick }) {
  const attachmentCount = getAttachmentCount(request);
  const accent = getStatusAccent(request.status);

  return (
    <button
      type="button"
      onClick={() => onClick(request)}
      className="group relative flex h-full min-h-[12rem] w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 pt-5 text-left shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9eaddd] hover:shadow-[0_8px_18px_rgba(36,59,142,0.14)] focus:outline-none focus:ring-4 focus:ring-[#d8def2]"
      aria-label={`View details for ${request.documentName} request`}
    >
      <div className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${accent.bar}`} />
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[3.5rem] bg-gradient-to-br ${accent.glow} opacity-90 transition-transform duration-300 group-hover:scale-110`} />

      <div className="relative z-10 min-h-[4.75rem] pr-28">
        <StatusBadge status={request.status} size="sm" className="absolute right-0 top-0 shrink-0 px-2.5" />

        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3.5">
          <div className={`mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r ${accent.icon} text-white shadow-sm shadow-slate-300/60`}>
            <FileText className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 break-words text-lg font-extrabold leading-tight text-[#122361] [overflow-wrap:anywhere]">
              {request.documentName || 'Untitled Request'}
            </h3>

            <p className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-extrabold text-slate-500 ring-1 ring-slate-100">
              <Hash className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">Request {request.requestId}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 rounded-2xl bg-slate-50/80 px-3 py-2.5 ring-1 ring-slate-100">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-slate-400">Purpose</p>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-700">
          {request.details || 'No purpose or details provided.'}
        </p>
      </div>

      <div className="relative z-10 mt-3 grid grid-cols-3 gap-2 text-[0.7rem] font-bold text-slate-600">
        <div className="rounded-xl bg-slate-50 px-2.5 py-2 ring-1 ring-slate-100">
          <span className="mb-0.5 flex items-center gap-1 text-slate-400">
            <Calendar className="h-3 w-3 text-[#243b8e]" aria-hidden="true" />
            Submitted
          </span>
          <p className="truncate text-slate-700">{formatDate(request.submittedAt)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-2.5 py-2 ring-1 ring-slate-100">
          <span className="mb-0.5 flex items-center gap-1 text-slate-400">
            <Clock3 className="h-3 w-3 text-emerald-600" aria-hidden="true" />
            Updated
          </span>
          <p className="truncate text-slate-700">{formatDate(request.updatedAt)}</p>
        </div>
        <div className="rounded-xl bg-[#eef3ff] px-2.5 py-2 text-[#122361] ring-1 ring-[#d8def2]">
          <span className="mb-0.5 flex items-center gap-1 text-[#2f84c0]">
            <Paperclip className="h-3 w-3" aria-hidden="true" />
            Files
          </span>
          <p>{attachmentCount}</p>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-end pt-2">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#122361] transition-colors group-hover:text-[#00114e]">
          View details
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

export default RequestCard;
