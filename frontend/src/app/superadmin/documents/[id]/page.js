'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Save, X, FileText } from 'lucide-react';
import Link from 'next/link';
import NotificationModal from '@/components/NotificationModal';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function SuperAdminDocumentViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notificationModal, setNotificationModal] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    imagePath: '',
    details: {
      category: '',
      longDescription: '',
      processingTime: '',
      pdfPath: '',
      requirements: [],
      uses: []
    }
  });
  const [requirementsText, setRequirementsText] = useState('');
  const [usesText, setUsesText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/document-types/${id}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch document');
      const data = await response.json();
      setDocument(data);
      setFormData({
        name: data.name || '',
        shortDescription: data.shortDescription || '',
        imagePath: data.imagePath || '',
        details: {
          category: data.details?.category || '',
          longDescription: data.details?.longDescription || '',
          processingTime: data.details?.processingTime || '',
          pdfPath: data.details?.pdfPath || '',
          requirements: data.details?.requirements || [],
          uses: data.details?.uses || []
        }
      });
      setRequirementsText((data.details?.requirements || []).join('\n'));
      setUsesText((data.details?.uses || []).join('\n'));
    } catch (err) {
      setNotificationModal({
        type: 'error',
        title: 'Error',
        message: 'Failed to load document: ' + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8080/api/document-types/upload', {
      method: 'POST',
      body: formDataUpload,
      ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {})
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return await response.text();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imagePath = formData.imagePath;
      let pdfPath = formData.details.pdfPath;

      if (imageFile) {
        imagePath = await uploadFile(imageFile);
      }
      if (pdfFile) {
        pdfPath = await uploadFile(pdfFile);
      }

      const token = localStorage.getItem('token');
      const requirements = requirementsText.split('\n').filter(item => item.trim());
      const uses = usesText.split('\n').filter(item => item.trim());

      const submitData = {
        ...formData,
        imagePath,
        details: {
          ...formData.details,
          pdfPath,
          requirements,
          uses
        }
      };

      const response = await fetch(`http://localhost:8080/api/document-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) throw new Error('Failed to update document');

      setNotificationModal({
        type: 'success',
        title: 'Success',
        message: 'Document updated successfully',
        autoClose: true,
        autoCloseDelay: 3000
      });
      setIsEditing(false);
      fetchDocument(); // Refresh data
    } catch (err) {
      setNotificationModal({
        type: 'error',
        title: 'Error',
        message: 'Failed to update document: ' + err.message
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setConfirmationModal({
      type: 'delete',
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this document type? This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/document-types/${id}`, {
            method: 'DELETE',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to delete document');
          router.push('/superadmin/documents');
        } catch (err) {
          setNotificationModal({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete document: ' + err.message
          });
        }
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('details.')) {
      const detailField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [detailField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Document not found</p>
          <Link href="/superadmin/documents" className="mt-4 text-blue-600 hover:underline">
            Back to documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/superadmin/documents"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
                <p className="text-gray-600">Document Type Details</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  name="details.category"
                  value={formData.details.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
                <textarea
                  name="details.longDescription"
                  value={formData.details.longDescription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processing Time</label>
                <input
                  type="text"
                  name="details.processingTime"
                  value={formData.details.processingTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements (one per line)</label>
                <textarea
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Uses (one per line)</label>
                <textarea
                  value={usesText}
                  onChange={(e) => setUsesText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Name</h3>
                  <p className="mt-1 text-lg text-gray-900">{document.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</h3>
                  <p className="mt-1 text-lg text-gray-900">{document.details?.category || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Short Description</h3>
                  <p className="mt-1 text-gray-900">{document.shortDescription}</p>
                </div>
                {document.details?.longDescription && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Long Description</h3>
                    <p className="mt-1 text-gray-900">{document.details.longDescription}</p>
                  </div>
                )}
                {document.details?.processingTime && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Processing Time</h3>
                    <p className="mt-1 text-gray-900">{document.details.processingTime}</p>
                  </div>
                )}
              </div>
              {document.details?.requirements && document.details.requirements.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {document.details.requirements.map((req, index) => (
                      <li key={index} className="text-gray-900">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {document.details?.uses && document.details.uses.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Uses</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {document.details.uses.map((use, index) => (
                      <li key={index} className="text-gray-900">{use}</li>
                    ))}
                  </ul>
                </div>
              )}
              {document.imagePath && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Document Image</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={`http://localhost:8080/${document.imagePath.replace(/\\/g, '/')}`}
                      alt="Document"
                      className="w-full h-auto max-h-96 object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setExpandedImage(`http://localhost:8080/${document.imagePath.replace(/\\/g, '/')}`)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-center text-gray-500 py-4">
                      <div className="text-4xl mb-2">📄</div>
                      <p>Unable to load image</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Click image to expand</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
              alt="Expanded Document"
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

      <NotificationModal
        isOpen={!!notificationModal}
        onClose={() => setNotificationModal(null)}
        type={notificationModal?.type}
        title={notificationModal?.title}
        message={notificationModal?.message}
        autoClose={notificationModal?.autoClose}
        autoCloseDelay={notificationModal?.autoCloseDelay}
      />

      <ConfirmationModal
        isOpen={!!confirmationModal}
        onClose={() => setConfirmationModal(null)}
        onConfirm={confirmationModal?.onConfirm}
        type={confirmationModal?.type}
        title={confirmationModal?.title}
        message={confirmationModal?.message}
        confirmText={confirmationModal?.confirmText}
        cancelText={confirmationModal?.cancelText}
        confirmButtonClass={confirmationModal?.confirmButtonClass}
      />
    </div>
  );
}