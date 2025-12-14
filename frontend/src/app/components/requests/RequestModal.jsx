import { useState, useEffect } from 'react';
import { FileText, Calendar, XCircle, Paperclip, ExternalLink, Edit2, Save, Trash2, Plus, RotateCcw, Send } from 'lucide-react';
import NotificationModal from '@/app/components/NotificationModal';

function RequestModal({ request, user, onClose, cancelRequest, approveRequest, rejectRequest, onReRequest, onUpdateRequest }) {
  const [notification, setNotification] = useState(null);
  
  // --- LOCAL DISPLAY STATE ---
  // We use this state to render the UI. It starts with the prop data, 
  // but we can update it immediately after a successful API call.
  const [displayRequest, setDisplayRequest] = useState(request);

  // Sync with prop if parent updates it externally
  useEffect(() => {
    setDisplayRequest(request);
  }, [request]);

  // --- EDIT STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [editDetails, setEditDetails] = useState(request?.details || '');
  const [filesToRemove, setFilesToRemove] = useState([]); 
  const [newFiles, setNewFiles] = useState([]); 
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState({});

  if (!displayRequest) return null;

  // --- HELPERS ---
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

  // --- SECURE FILE DOWNLOAD HANDLER ---
  const handleDownloadAttachment = async (file) => {
    if (!displayRequest?.requestId || !file?.id) return;
    
    // Set downloading state for this specific file
    setIsDownloading(prev => ({ ...prev, [file.id]: true }));
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotification({ 
          type: 'error', 
          title: 'Authentication Error', 
          message: 'Please log in again to download files.' 
        });
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/document-requests/${displayRequest.requestId}/attachments/${file.id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setNotification({
          type: 'success',
          title: 'Download Complete',
          message: 'File downloaded successfully.',
          autoClose: true
        });
      } else if (response.status === 401) {
        setNotification({ 
          type: 'error', 
          title: 'Unauthorized', 
          message: 'Please log in again to download files.' 
        });
      } else if (response.status === 403) {
        setNotification({ 
          type: 'error', 
          title: 'Access Denied', 
          message: 'You do not have permission to download this file.' 
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      setNotification({ 
        type: 'error', 
        title: 'Download Failed', 
        message: 'Failed to download file. Please try again.' 
      });
    } finally {
      // Clear downloading state
      setIsDownloading(prev => ({ ...prev, [file.id]: false }));
    }
  };

  // --- ACTIONS ---

  const handleCancelRequest = async () => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      const result = await cancelRequest(displayRequest.requestId);
      if (result.success) {
        setNotification({
            type: 'success',
            title: 'Cancelled',
            message: 'Request cancelled successfully.',
            autoClose: true
        });
        setTimeout(onClose, 2000);
      } else {
        setNotification({ type: 'error', title: 'Error', message: result.error });
      }
    }
  };

  const handleApproveRequest = async () => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/document-requests/${displayRequest.requestId}/approve`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
            setNotification({
                type: 'success',
                title: 'Approved',
                message: 'Request approved successfully.',
                autoClose: true
            });
            setTimeout(onClose, 2000);
        } else {
            setNotification({ type: 'error', title: 'Error', message: 'Failed to approve request.' });
        }
      } catch (err) {
        setNotification({ type: 'error', title: 'Network Error', message: err.message });
      }
    }
  };

  const handleRejectRequest = async () => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/document-requests/${displayRequest.requestId}/reject`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
            setNotification({
                type: 'success',
                title: 'Rejected',
                message: 'Request rejected successfully.',
                autoClose: true
            });
            setTimeout(onClose, 2000);
        } else {
            setNotification({ type: 'error', title: 'Error', message: 'Failed to reject request.' });
        }
      } catch (err) {
        setNotification({ type: 'error', title: 'Network Error', message: err.message });
      }
    }
  };

  // --- RE-REQUEST LOGIC ---
  const handleReRequest = async () => {
    if(window.confirm('Do you want to create a new request with the same details?')) {
        try {
            const token = localStorage.getItem('token');
            const dataPayload = {
                documentId: displayRequest.documentId, 
                documentName: displayRequest.documentName,
                residentId: user.residentId,
                details: displayRequest.details,
            };

            const formData = new FormData();
            formData.append('data', JSON.stringify(dataPayload));

            const res = await fetch('http://localhost:8080/api/document-requests', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                setNotification({
                    type: 'success',
                    title: 'Request Submitted',
                    message: 'A new request has been created successfully.',
                    autoClose: true
                });
                setTimeout(() => {
                    if (onReRequest) onReRequest();
                    onClose();
                }, 2000);
            } else {
                const err = await res.text();
                setNotification({ type: 'error', title: 'Error', message: err });
            }
        } catch (error) {
            setNotification({ type: 'error', title: 'Error', message: 'Network error occurred.' });
        }
    }
  };

  // --- EDITING LOGIC ---
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeExistingFile = (fileId) => {
    setFilesToRemove(prev => [...prev, fileId]);
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        
        const dataPayload = {
            details: editDetails,
            filesToRemove: filesToRemove
        };
        formData.append('data', JSON.stringify(dataPayload));
        
        newFiles.forEach(file => {
            formData.append('files', file);
        });

        const res = await fetch(`http://localhost:8080/api/document-requests/${displayRequest.requestId}`, {
            method: 'PUT', 
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            // 1. Get the updated object from the backend
            const updatedData = await res.json();

            // 2. Update local state IMMEDIATELY so the UI reflects changes
            setDisplayRequest(updatedData);
            
            // 3. Reset edit states
            setNewFiles([]);
            setFilesToRemove([]);
            setEditDetails(updatedData.details);
            
            setNotification({
                type: 'success',
                title: 'Updated',
                message: 'Request details updated successfully.',
                autoClose: true
            });
            
            // 4. Close edit mode (user sees new data now)
            setIsEditing(false);
            
            // 5. Notify parent to refresh list in background
            if(onUpdateRequest) onUpdateRequest(); 
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        setNotification({ type: 'error', title: 'Error', message: error.message });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      <div className="relative mx-auto p-2 sm:p-4 max-w-5xl h-full flex items-center justify-center">
        <div className="bg-white rounded-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
         
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg p-2 w-10 h-10 flex-shrink-0 flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 id="modal-title" className="font-montserrat font-bold text-2xl text-blue-900">
                {isEditing ? 'Edit Request' : 'Request Details'}
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
          {!isEditing && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(displayRequest.status)}
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Current Status</p>
                      <p className="text-lg font-bold text-blue-900">{displayRequest.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-700">Request ID</p>
                    <p className="text-lg font-bold text-blue-900">#{displayRequest.requestId}</p>
                  </div>
                </div>
              </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
               
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  Document Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                   <p className="text-sm font-medium text-gray-500">Document Name</p>
                   <p className="text-xl text-gray-900 font-bold mt-1">{displayRequest.documentName}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Purpose & Details</h3>
                    {!isEditing && user !== null && displayRequest.status === 'Pending' && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                            <Edit2 className="w-3 h-3" /> Edit Details
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <textarea 
                        className="w-full p-4 border-2 border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        rows="5"
                        value={editDetails}
                        onChange={(e) => setEditDetails(e.target.value)}
                    />
                ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{displayRequest.details}</p>
                    </div>
                )}
              </div>

              <div>
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Paperclip className="w-5 h-5 text-blue-600" aria-hidden="true" />
                   Attached Requirements
                 </h3>

                 {displayRequest.attachments && displayRequest.attachments.length > 0 && (
                   <div className="grid gap-3 sm:grid-cols-2 mb-4">
                     {displayRequest.attachments
                        .filter(f => !filesToRemove.includes(f.id))
                        .map((file) => (
                       <div 
                         key={file.id} 
                         className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group"
                       >
                         <button 
                             onClick={() => handleDownloadAttachment(file)}
                             disabled={isDownloading[file.id]}
                             className="flex items-center gap-3 overflow-hidden flex-1 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                             title="Click to download"
                         >
                           <div className="bg-blue-50 p-2 rounded-md">
                             <FileText className="w-5 h-5 text-blue-600" />
                           </div>
                           <div className="overflow-hidden">
                             <p className="text-sm font-medium text-gray-700 truncate">
                                 {file.fileName}
                             </p>
                             <p className="text-xs text-gray-500">
                               {isDownloading[file.id] ? 'Downloading...' : 'Click to download'}
                             </p>
                           </div>
                         </button>
                         
                         {isEditing && (
                             <button 
                                onClick={() => removeExistingFile(file.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                         )}
                       </div>
                     ))}
                   </div>
                 )}

                 {isEditing && (
                     <div className="mt-4">
                         <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center">
                             <input
                                 type="file"
                                 id="edit-upload"
                                 multiple
                                 onChange={handleFileSelect}
                                 className="hidden"
                             />
                             <label htmlFor="edit-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-blue-600">
                                 <Plus className="w-6 h-6" />
                                 <span className="text-sm">Click to add more files</span>
                             </label>
                         </div>
                         {newFiles.length > 0 && (
                             <div className="mt-3 space-y-2">
                                 {newFiles.map((file, index) => (
                                     <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded-lg border border-green-100">
                                         <span className="text-sm text-green-800 px-2 truncate">{file.name} (New)</span>
                                         <button onClick={() => removeNewFile(index)} className="text-green-600 p-1">
                                             <XCircle className="w-4 h-4" />
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                 )}
              </div>
            </div>

            <div className="space-y-6">
              
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></div>
                    <div>
                      <p className="text-sm font-bold text-green-800">Submitted</p>
                      <p className="text-xs text-green-700 mt-1">
                        {new Date(displayRequest.submittedAt).toLocaleDateString('en-US', {
                             timeZone: 'Asia/Manila', month: 'long', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-green-600">
                        {new Date(displayRequest.submittedAt).toLocaleTimeString('en-US', {
                             timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {displayRequest.updatedAt && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></div>
                      <div>
                        <p className="text-sm font-bold text-blue-800">Last Updated</p>
                        <p className="text-xs text-blue-700 mt-1">
                            {new Date(displayRequest.updatedAt).toLocaleDateString('en-US', {
                                 timeZone: 'Asia/Manila', month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </p>
                        <p className="text-xs text-blue-600">
                            {new Date(displayRequest.updatedAt).toLocaleTimeString('en-US', {
                                 timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4">Additional Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted Date</span>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                        {new Date(displayRequest.submittedAt).toLocaleDateString('en-US', { 
                             timeZone: 'Asia/Manila',
                             weekday: 'long', 
                             year: 'numeric', 
                             month: 'long', 
                             day: 'numeric' 
                        })}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          
          {isEditing ? (
             <>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setEditDetails(displayRequest.details); 
                        setNewFiles([]);
                        setFilesToRemove([]);
                    }}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    disabled={isSaving}
                >
                    Cancel Edit
                </button>
                <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
             </>
          ) : (
             <>
                 {user !== null && (displayRequest.status === 'Cancelled') && ( 
                     <button
                        onClick={handleReRequest}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
                     >
                        <RotateCcw className="w-4 h-4" /> Re-Request
                     </button>
                 )}

                 {user === null && displayRequest.status?.toLowerCase() === 'pending' && (
                    <>
                    <button
                        onClick={handleRejectRequest}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                    >
                        Reject Request
                    </button>
                    <button
                        onClick={handleApproveRequest}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                    >
                        Approve Request
                    </button>
                    </>
                 )}

                 {user !== null && displayRequest.status?.toLowerCase() === 'pending' && (
                    <button
                    onClick={handleCancelRequest}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                    >
                    Cancel Request
                    </button>
                 )}

                 <button
                    onClick={onClose}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                 >
                    Close
                 </button>
             </>
          )}
        </div>
        </div>
      </div>

      {notification && (
        <NotificationModal 
            isOpen={!!notification}
            onClose={() => setNotification(null)}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            autoClose={notification.autoClose}
        />
      )}
    </div>
  );
}

export default RequestModal;