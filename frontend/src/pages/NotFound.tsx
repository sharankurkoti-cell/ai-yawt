import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Terminal, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center px-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-8">
          <Terminal className="w-10 h-10 text-purple-400" />
        </div>
        <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-xl text-slate-400 mb-2">Page not found</p>
        <p className="text-sm text-slate-600 mb-8 font-mono">
          Route: {location.pathname}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
