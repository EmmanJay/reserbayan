'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddDocumentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    imagePath: '',
    details: {
      category: '',
      longDescription: '',
      processingTimeValue: '',
      processingTimeUnit: 'days',
      pdfPath: '',
      requirements: [],
      uses: []
    }
  });
  const [generatedId, setGeneratedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [requirementsText, setRequirementsText] = useState('');
  const [usesText, setUsesText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const uploadFile = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8080/api/document-types/upload', {
      method: 'POST',
      body: formData,
      ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {})
    });

    if (!response.ok) throw new Error('Failed to upload file');
    return await response.text();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload files first
      let imagePath = formData.imagePath;
      let pdfPath = formData.details.pdfPath;

      if (imageFile) {
        imagePath = await uploadFile(imageFile);
      }

      if (pdfFile) {
        pdfPath = await uploadFile(pdfFile);
      }

      const token = localStorage.getItem('token');

      // Parse requirements and uses
      const requirements = requirementsText.split('\n').filter(item => item.trim());
      const uses = usesText.split('\n').filter(item => item.trim());

      // Combine processing time value and unit
      const processingTime = formData.details.processingTimeValue && formData.details.processingTimeUnit
        ? `${formData.details.processingTimeValue} ${formData.details.processingTimeUnit}`
        : '';

      const submitData = {
        ...formData,
        id: generatedId,
        imagePath,
        details: {
          ...formData.details,
          processingTime,
          pdfPath,
          requirements,
          uses
        }
      };

      const response = await fetch('http://localhost:8080/api/document-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) throw new Error('Failed to create document type');

      router.push('/superadmin/documents');
    } catch (err) {
      alert('Error creating document type: ' + err.message);
    } finally {
      setLoading(false);
    }
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
      if (name === 'name') {
        const slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        setGeneratedId(slug);
      }
    }
  };

  return (
    <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/superadmin/documents"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auto-generated ID preview */}
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document ID (auto-generated)
              </label>
              <input
                type="text"
                value={generatedId}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg"
                placeholder="Generated from name"
              />
              <p className="mt-1 text-xs text-gray-500">Based on the Name field.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Barangay Clearance"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description *
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the document"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imageFile && <p className="mt-1 text-sm text-gray-600">Selected: {imageFile.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="details.category"
                value={formData.details.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                <option value="Financial Assistance">Financial Assistance</option>
                <option value="Residency">Residency</option>
                <option value="Clearance">Clearance</option>
                <option value="Permits & Tax">Permits & Tax</option>
                <option value="Infrastructure & Zoning">Infrastructure & Zoning</option>
              </select>
            </div>

            {/* Details */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long Description
              </label>
              <textarea
                name="details.longDescription"
                value={formData.details.longDescription}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of the document"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processing Time *
              </label>
              <div className="flex gap-2">
                <select
                  name="details.processingTimeUnit"
                  value={formData.details.processingTimeUnit}
                  onChange={(e) => {
                    handleChange(e);
                    // Reset value when unit changes
                    setFormData(prev => ({
                      ...prev,
                      details: {
                        ...prev.details,
                        processingTimeValue: ''
                      }
                    }));
                  }}
                  required
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="days">days</option>
                  <option value="hours">hours</option>
                </select>
                <select
                  name="details.processingTimeValue"
                  value={formData.details.processingTimeValue}
                  onChange={handleChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-40 overflow-y-auto"
                >
                  <option value="">Select duration</option>
                  {Array.from(
                    { length: formData.details.processingTimeUnit === 'days' ? 12 : 23 },
                    (_, i) => i + 1
                  ).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {pdfFile && <p className="mt-1 text-sm text-gray-600">Selected: {pdfFile.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements (one per line)
              </label>
              <textarea
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Valid ID&#10;Proof of residency&#10;Birth certificate"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uses (one per line)
              </label>
              <textarea
                value={usesText}
                onChange={(e) => setUsesText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Job application&#10;Bank loan&#10;Government transactions"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Creating...' : 'Create Document Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}