import { FileText, Calendar, XCircle } from 'lucide-react';

function RequestModal({ request, user, onClose }) {
  if (!request) return null;

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

  return (
    <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" aria-hidden="true" />
              </div>
              <h2 id="modal-title" className="font-montserrat font-bold text-2xl text-blue-900">
                Request Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
              aria-label="Close modal"
            >
              <XCircle className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(request.status)}
                <div>
                  <p className="text-sm text-blue-700 font-medium">Current Status</p>
                  <p className="text-lg font-bold text-blue-900">{request.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Request ID</p>
                <p className="text-lg font-bold text-blue-900">#{request.requestId}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  Document Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Document Name</p>
                    <p className="text-gray-900 font-semibold">{request.documentName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Document ID</p>
                    <p className="text-gray-900">{request.documentId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true"></div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Submitted</p>
                      <p className="text-xs text-green-600">{new Date(request.submittedAt).toLocaleString('en-US')}</p>
                    </div>
                  </div>
                  {request.updatedAt && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" aria-hidden="true"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Last Updated</p>
                        <p className="text-xs text-blue-600">{new Date(request.updatedAt).toLocaleString('en-US')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Purpose & Details</h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{request.details}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4">Additional Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm"><span className="font-medium">Resident ID:</span> {user?.residentId}</p>
                  <p className="text-sm"><span className="font-medium">Submitted Date:</span> {new Date(request.submittedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestModal;