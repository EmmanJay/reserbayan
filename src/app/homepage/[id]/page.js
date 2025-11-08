import Image from 'next/image';
import documentsData from '@/lib/data.json'; // Import your JSON data
import { notFound } from 'next/navigation'; // To handle errors

// Function to get the specific document data
function getDocumentData(id) {
  const document = documentsData.find((doc) => doc.id === id);
  if (!document) {
    notFound(); // Will show a 404 page if no doc is found
  }
  return document;
}

export default function DocumentDetailPage({ params }) {
  // params.id comes from the URL (e.g., "certificate-of-indigency")
  const doc = getDocumentData(params.id);

  return (
    <div className="flex">
      {/* Left part: Image preview */}
      <div className="w-2/5 pr-8">
        <Image
          src={doc.imagePath}
          alt={`${doc.name} preview`}
          width={500}
          height={700}
          className="border rounded-lg shadow-lg"
        />
      </div>

      {/* Right part: Details (matches your first screenshot) */}
      <div className="w-3/5">
        <span className="text-sm font-bold text-blue-600">
          {doc.details.category}
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mt-1">{doc.name}</h1>
        <p className="text-lg text-gray-600 my-4">{doc.details.longDescription}</p>
        
        <div className="my-6">
          <strong>Processing Time:</strong> {doc.details.processingTime}
        </div>

        <h3 className="text-2xl font-semibold mb-3">Requirements</h3>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          {doc.details.requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>

        <h3 className="text-2xl font-semibold mb-3">Common Uses</h3>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          {doc.details.uses.map((use, index) => (
            <li key={index}>{use}</li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Request Document
          </button>
          {doc.details.pdfPath && (
            <a 
              href={doc.details.pdfPath} 
              download 
              className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Download Form
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Optional: This tells Next.js to pre-build all these pages at build time
export async function generateStaticParams() {
  return documentsData.map((doc) => ({
    id: doc.id,
  }));
}