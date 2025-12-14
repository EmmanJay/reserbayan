import { useState } from 'react';
import { X, Users, Mail, Phone, MapPin, Calendar, FileText, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ViewDetailsModal({ isOpen, onClose, resident, documentRequest, title = "Details", showActions = false, onApprove, onReject }) {
   const [showPassword, setShowPassword] = useState(false);
   const [expandedImage, setExpandedImage] = useState(null);
   const [expandedAttachment, setExpandedAttachment] = useState(null);

  const actualResident = documentRequest ? {
    residentId: documentRequest.residentId,
    firstName: documentRequest.residentFirstName,
    middleName: documentRequest.residentMiddleName,
    lastName: documentRequest.residentLastName,
    residentEmail: documentRequest.residentEmail,
    phoneNumber: documentRequest.residentPhoneNumber,
    birthdate: documentRequest.residentBirthdate,
    gender: documentRequest.residentGender,
    addressLine1: documentRequest.residentAddressLine1,
    sitio: documentRequest.residentSitio,
    barangay: documentRequest.residentBarangay,
    city: documentRequest.residentCity,
    province: documentRequest.residentProvince,
    region: documentRequest.residentRegion,
    createdAt: documentRequest.residentCreatedAt,
    validIdPath: documentRequest.residentValidIdPath,
  } : resident;

  if (!isOpen || !actualResident) return null;

  // Check if the status is rejected and get rejection reason
  const isRejected = (status) => status?.toLowerCase() === 'rejected';
  const rejectionReason = documentRequest?.rejectionReason || resident?.rejectionReason;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative mx-auto p-2 sm:p-4 max-w-4xl h-full flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg p-2 w-10 h-10 flex-shrink-0 flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 id="modal-title" className="font-montserrat font-bold text-2xl text-blue-900">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Resident Information</p>
                    <p className="text-lg font-bold text-blue-900">
                      {actualResident.firstName && actualResident.lastName && actualResident.firstName !== 'N/A' ? `${actualResident.firstName} ${actualResident.middleName || ''} ${actualResident.lastName}`.trim() : 'Unknown Resident'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">Resident ID</p>
                  <p className="text-lg font-bold text-blue-900">{actualResident.residentId ? `#${actualResident.residentId}` : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Rejection Reason Display */}
            {isRejected(documentRequest?.status || resident?.status) && rejectionReason && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Rejection Reason
                </h3>
                <p className="text-red-800 bg-white p-3 rounded-lg border border-red-200">
                  {rejectionReason}
                </p>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    Personal Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{actualResident.residentEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium text-gray-900">{actualResident.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Birthdate</p>
                        <p className="font-medium text-gray-900">
                          {actualResident.birthdate ? new Date(actualResident.birthdate).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </div>

                    {actualResident.role && (
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="font-medium text-gray-900">{actualResident.role}</p>
                        </div>
                      </div>
                    )}

                    {actualResident.status && (
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className={`font-medium ${
                            isRejected(actualResident.status) ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {actualResident.status}
                            {isRejected(actualResident.status) && ' (Rejected)'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    Address Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Address Line 1</p>
                      <p className="font-medium text-gray-900">{actualResident.addressLine1 || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Sitio</p>
                      <p className="font-medium text-gray-900">{actualResident.sitio || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Barangay</p>
                      <p className="font-medium text-gray-900">{actualResident.barangay || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">City/Municipality</p>
                      <p className="font-medium text-gray-900">{actualResident.city || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Province</p>
                      <p className="font-medium text-gray-900">{actualResident.province || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Region</p>
                      <p className="font-medium text-gray-900">{actualResident.region || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    Additional Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium text-gray-900">
                        {new Date(actualResident.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {actualResident.validIdPath && (
                      <div>
                        <p className="text-sm text-gray-500">Valid ID</p>
                        <div className="mt-2">
                          <img
                            src={`http://localhost:8080/${actualResident.validIdPath.replace(/\\/g, '/')}`}
                            alt="Valid ID"
                            className="w-full h-auto max-h-48 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setExpandedImage(`http://localhost:8080/${actualResident.validIdPath.replace(/\\/g, '/')}`)}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="hidden text-center text-gray-500 py-4">
                            <div className="text-4xl mb-2">📄</div>
                            <p>Unable to load image</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {actualResident.plainPassword && (
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">Password</p>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <p className="font-mono text-gray-900 mt-1">
                          {showPassword ? actualResident.plainPassword : '••••••••'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {documentRequest && (
              <>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Document Request Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Document Type</p>
                      <p className="font-medium text-gray-900">{documentRequest.documentName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Request Details</p>
                      <p className="font-medium text-gray-900">{documentRequest.details || 'No details provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted At</p>
                      <p className="font-medium text-gray-900">
                        {documentRequest.submittedAt ? new Date(documentRequest.submittedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`font-medium ${
                        isRejected(documentRequest.status) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {documentRequest.status || 'N/A'}
                        {isRejected(documentRequest.status) && ' (Rejected)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Requirements Attachments ({documentRequest.attachments?.length || 0})
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {documentRequest.attachments && documentRequest.attachments.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto space-y-3">
                        {documentRequest.attachments.map((attachment, index) => (
                          <div key={attachment.id || index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{attachment.fileName || 'Unnamed file'}</p>
                                <p className="text-xs text-gray-500">{attachment.fileType || 'Unknown type'}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setExpandedAttachment(attachment)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No attachments submitted</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              Close
            </button>
            {showActions && (
              <div className="flex gap-3">
                <button
                  onClick={onReject}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  Reject
                </button>
                <button
                  onClick={onApprove}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-12 right-0 text-gray-700 hover:text-gray-900 text-2xl font-bold z-60 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              ✕
            </button>
            <img
              src={expandedImage}
              alt="Expanded ID"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={() => setExpandedImage(null)}
              style={{ cursor: 'zoom-out' }}
            />
            <p className="text-gray-700 text-center mt-4 text-sm opacity-75 bg-white px-3 py-1 rounded-full shadow-sm">
              Click image or ✕ to close
            </p>
          </div>
        </div>
      )}

      {/* Expanded Attachment Modal */}
      {expandedAttachment && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg max-w-5xl max-h-[90vh] w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{expandedAttachment.fileName || 'Attachment'}</h3>
              <button
                onClick={() => setExpandedAttachment(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-auto">
              {expandedAttachment.fileType?.startsWith('image/') ? (
                <img
                  src={`http://localhost:8080/uploads/${expandedAttachment.filePath?.replace(/\\/g, '/')}`}
                  alt={expandedAttachment.fileName || 'Attachment'}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-600 mb-4">This file type cannot be previewed directly.</p>
                  <a
                    href={`http://localhost:8080/uploads/${expandedAttachment.filePath?.replace(/\\/g, '/')}`}
                    download={expandedAttachment.fileName}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download File
                  </a>
                </div>
              )}
              <div className="hidden text-center py-8">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-gray-600">Unable to load the file.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}