import './globals.css';

export const metadata = {
  title: 'TraceX | Real-Time Phishing Detection & Lexical Forensics',
  description: 'Edge-optimized lexical URL forensics and sub-5ms ML inference sandbox',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b14] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        {/* Header Navigation */}
        <header className="border-b border-slate-800/80 bg-[#0d1527]/70 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <span className="text-white font-black text-lg tracking-wider">TX</span>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Trace<span className="text-cyan-400">X</span>
                </span>
                <span className="ml-2 text-xs font-mono uppercase tracking-widest text-cyan-500/80 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                  Lexical Forensics
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-emerald-400 font-semibold">ENGINE ONLINE</span>
              </div>
              <span className="text-slate-700">|</span>
              <span className="hidden sm:inline">ZERO-DNS RESOLUTION</span>
              <span className="text-slate-700">|</span>
              <span className="text-cyan-400 font-semibold">ONNX RUNTIME</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 bg-[#070b14] py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>TraceX Lexical URL Forensics Engine &bull; Spring Boot 3.x + ONNX Runtime</div>
            <div className="font-mono text-slate-600">Pure Static Lexical Inspection &bull; Sub-5ms SLA</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
