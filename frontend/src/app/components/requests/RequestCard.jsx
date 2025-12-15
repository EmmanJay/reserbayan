import { FileText, Calendar } from 'lucide-react';
import { StatusBadge } from '@/app/components/ui/status-badge';

function RequestCard({ request, onClick }) {


  return (
    <div
      onClick={() => onClick(request)}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden relative"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(request); } }}
      aria-label={`View details for ${request.documentName} request`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg p-2 w-10 h-10 flex-shrink-0 flex items-center justify-center shadow-md transition-all duration-200 ease-in-out group-hover:bg-gradient-to-r group-hover:from-[#0B1D4E] group-hover:to-[#1E2566]">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-montserrat font-bold text-lg text-blue-900 group-hover:text-blue-800 transition-colors line-clamp-1">
                {request.documentName}
              </h3>
              <p className="text-sm text-gray-500 font-medium">ID: #{request.requestId}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <StatusBadge status={request.status} size="md" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
            <span className="text-sm font-medium">
              {new Date(request.submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestCard;