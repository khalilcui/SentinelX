import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
      <ShieldAlert className="text-primary mb-4" size={48} />
      <h1 className="text-6xl font-semibold">404</h1>
      <p className="text-muted-foreground mt-2 mb-8">This page could not be found.</p>
      <Link
        to="/"
        className="liquid-glass rounded-full px-6 py-2.5 text-sm hover:scale-[1.03] transition-transform"
      >
        Back to Home
      </Link>
    </div>
  );
}
