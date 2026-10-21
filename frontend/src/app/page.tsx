'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#060c18] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-amber-300">
        <div className="h-10 w-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="font-cinzel text-sm tracking-wider uppercase">
          Unsealing The Dark Protocol Grimoire...
        </span>
      </div>
    </div>
  ),
});

export default function Home() {
  return <App />;
}
