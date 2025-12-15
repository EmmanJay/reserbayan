import { FileText } from 'lucide-react';
import { StatusBadge } from '@/app/components/ui/status-badge';

function RequestsList({ requests, onRequestClick }) {


  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Document requests list">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" scope="col">Document</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" scope="col">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" scope="col">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => (
              <tr
                key={request.requestId}
                onClick={() => onRequestClick(request)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                role="row"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRequestClick(request); } }}
                aria-label={`View details for ${request.documentName} request`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg p-2 w-8 h-8 flex-shrink-0 flex items-center justify-center shadow-md">
                      <FileText className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{request.documentName}</div>
                      <div className="text-sm text-gray-500">ID: #{request.requestId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={request.status} size="sm" />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(request.submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RequestsList;