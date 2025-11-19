import { FileText, Calendar } from 'lucide-react';

function RequestCard({ request, onClick }) {
  const getStatusIcon = (status) => {
    const statusLower = status ? status.toLowerCase() : '';
    switch (statusLower) {
      case 'approved':
        return <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>;
      case 'completed':
        return <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>;
      case 'pending':
        return <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">○</span></div>;
      case 'rejected':
        return <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✗</span></div>;
      default:
        return <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">○</span></div>;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status ? status.toLowerCase() : '';
    switch (statusLower) {
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'completed':
        return 'text-blue-700 bg-blue-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'rejected':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

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
          {getStatusIcon(request.status)}
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(request.status)} shadow-sm`}>
            {request.status}
          </span>
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