import { Database } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="p-4 border-b bg-card shadow-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              SQL Sheet
            </h1>
        </Link>
      </div>
    </header>
  );
}
