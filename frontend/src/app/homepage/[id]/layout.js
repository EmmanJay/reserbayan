import Link from 'next/link';
import documentsData from '@/lib/data.json'; // Adjust path if needed

// This component will render the sidebar
function DocumentSidebar() {
  return (
    <nav className="w-64 flex-shrink-0 bg-white border-r p-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
        Search Documents
      </h2>
      <ul>
        {documentsData.map((doc) => (
          <li key={doc.id} className="mb-2">
            <Link 
              href={`/homepage/${doc.id}`} // Ensure this path is correct
              className="block p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {doc.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// This is the main layout
export default function DocumentsLayout({ children }) {
  return (
    // 👇 ADDED PADDING (pt-32, pb-24) AND min-h-screen HERE
    <div className="flex min-h-screen bg-gray-50 pt-18 pb-24">
      
      {/* The sidebar */}
      <DocumentSidebar />

      {/* The 'children' prop is your detailed view page */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}