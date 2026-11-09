'use client';

import { useState } from 'react';
import { IconShare } from '@/lib/icons';

export default function ShareButton() {
  const [done, setDone] = useState(false);
  async function share() {
    const data = { title: 'Kiro', text: 'Get Kiro, the anime app by AniBiar TV', url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  }
  return (
    <button type="button" className="btn btn-ghost btn-lg-ghost" onClick={share}>
      <IconShare size={18} />
      {done ? 'Link copied' : 'Share'}
    </button>
  );
}
