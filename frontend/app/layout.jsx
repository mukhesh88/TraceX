import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'TraceX | Real-Time Phishing Detection & Lexical Forensics',
  description: 'Edge-optimized lexical URL forensics, sub-5ms ML inference sandbox, and Supabase threat watchlist',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b14] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        <AuthProvider>
          {/* Header Navigation with Auth state */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/60 bg-[#070b14] py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
              <div>TraceX Lexical URL Forensics Engine &bull; Spring Boot 3.x + ONNX Runtime + Supabase DB</div>
              <div className="font-mono text-slate-600">Pure Static Lexical Inspection &bull; Sub-5ms SLA</div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
