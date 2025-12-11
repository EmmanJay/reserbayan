import { useState } from 'react';
import { X, Upload, File, Send } from 'lucide-react';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import NotificationModal from '@/components/NotificationModal';

export default function RequestFormModal({ user, onClose, onSuccess }) {
  const { documentsData } = useDocumentTypes();
  
  const [selectedDocument, setSelectedDocument] = useState('');
  const [formData, setFormData] = useState({ purpose: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [notification, setNotification] = useState(null);

  // Handle File Selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  // Remove File
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // NEW: Custom handler for closing the notification
  const handleNotificationClose = () => {
    // Check if the closing notification was a success message
    const isSuccess = notification?.type === 'success';
    
    // 1. Close the notification popup
    setNotification(null);

    // 2. If it was a successful submission, ONLY THEN close the form and refresh data
    if (isSuccess) {
        if (onSuccess) onSuccess(); 
        onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDocument || !formData.purpose.trim()) {
      setNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please select a document type and provide a purpose for your request.'
      });
      return;
    }

    const document = documentsData.find(doc => doc.id === selectedDocument);
    if (!document) {
      setNotification({
        type: 'error',
        title: 'Invalid Document',
        message: 'The selected document type is invalid.'
      });
      return;
    }

    setSubmitting(true);
    try {
      const dataPayload = {
        documentId: selectedDocument,
        documentName: document.name,
        residentId: user.residentId,
        details: formData.purpose,
      };

      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(dataPayload));
      
      selectedFiles.forEach(file => {
        formDataToSend.append('files', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/document-requests', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}` 
        },
        body: formDataToSend,
      });

      if (response.ok) {
        // FIX: Removed autoClose and setTimeout. 
        // The modal will now stay open until the user interacts with it.
        setNotification({
            type: 'success',
            title: 'Request Submitted',
            message: `Your request for ${document.name} has been successfully submitted.`,
            autoClose: false // Ensure it stays open
        });
      } else {
        const errorText = await response.text();
        setNotification({
            type: 'error',
            title: 'Submission Failed',
            message: errorText || 'We could not process your request at this time. Please try again.'
        });
      }
    } catch (error) {
      console.error(error);
      setNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 relative z-10">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Request a Document</h2>
              <p className="text-gray-600">Fill out the form below to submit your document request</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Document Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Select Document <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDocument}
                onChange={(e) => setSelectedDocument(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              >
                <option value="">Choose a document...</option>
                {documentsData.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Purpose of Request <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                rows="4"
                placeholder="Please describe why you need this document..."
                required
              />
            </div>

            {/* UPLOAD SECTION */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Upload Requirements (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                      <input
                          type="file"
                          id="modal-file-upload"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                      />
                      <label 
                          htmlFor="modal-file-upload" 
                          className="cursor-pointer flex flex-col items-center gap-3 text-gray-500 hover:text-blue-600 transition-colors w-full"
                      >
                          <Upload className="w-10 h-10" />
                          <span className="text-base font-medium">Click to upload files</span>
                          <span className="text-sm text-gray-400">Supported: Images, PDF</span>
                      </label>
                  </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                      {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                                  <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                              </div>
                              <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              >
                                  <X className="w-5 h-5" />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
            </div>

            {/* User Info Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{user.firstName} {user.middleName || ''} {user.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">{user.residentEmail}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 font-medium">{user.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">Address:</span>
                  <span className="ml-2 font-medium">{user.address}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Modal Integration */}
      <NotificationModal
        isOpen={!!notification}
        onClose={handleNotificationClose} // FIX: Use our new custom handler
        type={notification?.type}
        title={notification?.title}
        message={notification?.message}
        autoClose={notification?.autoClose}
      />
    </div>
  );
}