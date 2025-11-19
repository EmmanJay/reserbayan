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
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-sm">
              <FileText className="w-6 h-6 text-blue-700" aria-hidden="true" />
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

          <div className="text-gray-700">
            <p className="text-sm font-semibold mb-2 text-blue-900">Purpose:</p>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200/50">
              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{request.details}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestCard;