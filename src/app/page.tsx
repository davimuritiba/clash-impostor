'use client';

import GameManager from '@/components/GameManager';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 relative">
      <div className="relative z-10">
        <GameManager />
      </div>
    </main>
  );
}
