import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

// Import your components here
import ClientLayout from '@/components/ClientLayout';
import Footer from '@/components/home/Footer';
import AuthModal from '@/components/auth/AuthModal';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ['400', '600', '700', '800'], // Add weights you need
});

export const metadata = {
  title: "ReserBayan - Online Barangay Document Request System",
  description: "Streamlined document requests for every resident. Quick, secure and designed for the community.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientLayout>
          {/* 'children' will be your homepage or any other page */}
          <main>
            {children}
          </main>
        </ClientLayout>

        {/* Footer goes at the bottom */}
        <Footer />

        {/* Global Auth Modal */}
        <AuthModal />
      </body>
    </html>
  );
}