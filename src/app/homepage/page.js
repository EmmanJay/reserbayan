import Link from 'next/link';
import Image from 'next/image';
import documentsData from '@/lib/data.json';
import { ArrowRightCircle } from 'lucide-react';

export default function DocumentsGridPage() {
  return (
    <div className="pt-32 px-8 min-h-screen bg-gray-50 pb-24">
      
      {/* --- Search Bar and Category filters would go here --- */}
      {/* ... (as before, potentially above the grid) ... */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {documentsData.map((doc) => (
          // The Link itself is now the "card" container, but without a background
          <Link 
            href={`/homepage/${doc.id}`} 
            key={doc.id} 
            className="flex flex-col rounded-2xl transition-shadow hover:shadow-xl p-0" // Removed bg-white, shadow, p-5
          >
            
            {/* ⭐️ IMAGE CONTAINER WITH GRADIENT BORDER AND SHADOW ⭐️ */}
            {/* This div acts as the gradient border and casts the shadow */}
            <div className="aspect-square w-full overflow-hidden 
                rounded-3xl p-2.5 mb-5
                bg-gradient-to-br from-[#2F87C3] to-[#2F87C3] shadow-xl 
                flex items-center justify-center relative"> {/* Added relative for inner image positioning */}
              
              {/* Actual Image, inset slightly by the padding of the parent div */}
              <Image
                src={doc.imagePath}
                alt={`${doc.name} preview`}
                // Adjust width/height to fit the gradient border and maintain aspect ratio
                width={278} // From your image, 278x278 is the suggested size
                height={278}
                className="w-full h-full object-cover object-top rounded-xl z-10" // Inner rounding, z-index to ensure it sits above any potential pseudo-elements
              />
              {/* The rounded-xl on the image here is what makes the white part of the image
                  have slightly smaller rounded corners than the gradient frame.
                  If you want the image content to fill the exact rounded gradient frame, remove rounded-xl from here.
                  From your image, it looks like the content inside the gradient border also has rounded corners.
              */}
            </div>
            
            {/* Document Name - BIGGER AND BOLD */}
            <h3 className="font-montserrat text-2xl md:text-3xl font-extrabold text-blue-900 mt-0 px-4 text-center">
              {doc.name}
            </h3>
            
            {/* Description - Adjusted text-color and padding for alignment */}
            <p className="text-base text-gray-700 mt-2 flex-grow px-4 text-center">
              {doc.shortDescription}
            </p>
            
            {/* "See more" Button - Styling adjusted to match new image */}
            <button className="flex items-center justify-center mt-5 mx-auto 
                                bg-blue-700 text-white rounded-full 
                                px-6 py-3 font-semibold text-lg
                                hover:bg-blue-800 transition-colors shadow-lg">
              <span>See more</span>
              <ArrowRightCircle className="w-6 h-6 ml-3" /> {/* Larger icon */}
            </button>

          </Link>
        ))}
      </div>
    </div>
  );
}