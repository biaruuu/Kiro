import type { ReactNode } from 'react';

type P = { size?: number; className?: string };

function Svg({ size = 24, className, children, fill = false }: P & { children: ReactNode; fill?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const IconDownload = (p: P) => (
  <Svg {...p}><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></Svg>
);
export const IconShare = (p: P) => (
  <Svg {...p}><circle cx="18" cy="5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="19" r="2.6" /><path d="m8.3 10.7 7.4-4.3M8.3 13.3l7.4 4.3" /></Svg>
);
export const IconBolt = (p: P) => (<Svg {...p}><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" /></Svg>);
export const IconCaptions = (p: P) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 10.2a2.2 2.2 0 1 0 0 3.6M16.5 10.2a2.2 2.2 0 1 0 0 3.6" /></Svg>
);
export const IconUsers = (p: P) => (
  <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><path d="M16 5.2a3.1 3.1 0 0 1 0 5.6M18 14.8c1.8.7 3 2.3 3 5.2" /></Svg>
);
export const IconChat = (p: P) => (
  <Svg {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z" /></Svg>
);
export const IconPlay = (p: P) => (<Svg {...p} fill><path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2Z" /></Svg>);
export const IconPip = (p: P) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><rect x="12" y="11" width="6.5" height="5" rx="1.4" /></Svg>
);
export const IconSaver = (p: P) => (
  <Svg {...p}><path d="M4 18a8 8 0 1 1 16 0" /><path d="m12 18 4-5" /><circle cx="12" cy="18" r="1.2" /></Svg>
);
export const IconPalette = (p: P) => (
  <Svg {...p}><path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-.9 2-1.9 0-1.6-1.5-1.8-1.5-3 0-.9.8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.8 17 3 12 3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10.5" cy="7.2" r="1" /><circle cx="15" cy="7.8" r="1" /></Svg>
);
export const IconBell = (p: P) => (<Svg {...p}><path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15L6 17Z" /><path d="M10 21h4" /></Svg>);
export const IconAndroid = (p: P) => (
  <Svg {...p}><path d="M6 10h12v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7Z" /><path d="M7 7a5 5 0 0 1 10 0" /><path d="m8.5 3.5 1.3 1.6M15.5 3.5l-1.3 1.6" /><path d="M3 11v5M21 11v5" /></Svg>
);
export const IconTag = (p: P) => (<Svg {...p}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.2" /></Svg>);
export const IconDisk = (p: P) => (<Svg {...p}><rect x="3" y="14" width="18" height="6" rx="2" /><path d="M7 17h.01M12 3v7" /><path d="m9 8 3 3 3-3" /></Svg>);
export const IconCalendar = (p: P) => (<Svg {...p}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></Svg>);
export const IconShield = (p: P) => (<Svg {...p}><path d="M12 3 5 6v5.5c0 4.5 3 7.7 7 9.5 4-1.8 7-5 7-9.5V6l-7-3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></Svg>);
export const IconSearch = (p: P) => (<Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Svg>);
export const IconSpark = (p: P) => (<Svg {...p}><path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" /></Svg>);
export const IconHistory = (p: P) => (<Svg {...p}><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" /><path d="M3 4v4.5h4.5" /><path d="M12 8v4.2l2.8 1.8" /></Svg>);
