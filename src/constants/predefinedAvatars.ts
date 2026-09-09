// src/constants/predefinedAvatars.ts

export interface PredefinedAvatar {
  id: string;
  label: string;
  svg: string;
  dataUrl: string;
}

export function encodeAvatarSvg(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export const PREDEFINED_AVATARS: PredefinedAvatar[] = [
  {
    id: "avatar-1",
    label: "Book Lover",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#8b5cf6"/><circle cx="50" cy="40" r="16" fill="#fed7aa"/></svg>`,
    dataUrl: "/images/avatars/avatar-1.jpg",
  },
  {
    id: "avatar-2",
    label: "Tech Explorer",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#3b82f6"/><circle cx="50" cy="40" r="16" fill="#fdba74"/></svg>`,
    dataUrl: "/images/avatars/avatar-2.jpg",
  },
  {
    id: "avatar-3",
    label: "Curious Reader",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#10b981"/><circle cx="50" cy="40" r="16" fill="#ffe4e6"/></svg>`,
    dataUrl: "/images/avatars/avatar-3.jpg",
  },
  {
    id: "avatar-4",
    label: "Music Learner",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#f59e0b"/><circle cx="50" cy="40" r="16" fill="#7c2d12"/></svg>`,
    dataUrl: "/images/avatars/avatar-4.jpg",
  },
  {
    id: "avatar-5",
    label: "Science Star",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#06b6d4"/><circle cx="50" cy="40" r="16" fill="#fed7aa"/></svg>`,
    dataUrl: "/images/avatars/avatar-5.jpg",
  },
  {
    id: "avatar-6",
    label: "Study Buddy",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#ec4899"/><circle cx="50" cy="40" r="16" fill="#fdba74"/></svg>`,
    dataUrl: "/images/avatars/avatar-6.jpg",
  },
  {
    id: "avatar-7",
    label: "Math Explorer",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#6366f1"/><circle cx="50" cy="40" r="16" fill="#ffedd5"/></svg>`,
    dataUrl: "/images/avatars/avatar-7.jpg",
  },
  {
    id: "avatar-8",
    label: "Happy Scholar",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#f97316"/><circle cx="50" cy="40" r="16" fill="#fed7aa"/></svg>`,
    dataUrl: "/images/avatars/avatar-8.jpg",
  },
  {
    id: "avatar-9",
    label: "Digital Learner",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#a855f7"/><circle cx="50" cy="40" r="16" fill="#7c2d12"/></svg>`,
    dataUrl: "/images/avatars/avatar-9.jpg",
  },
  {
    id: "avatar-10",
    label: "Goal Getter",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#14b8a6"/><circle cx="50" cy="40" r="16" fill="#fdba74"/></svg>`,
    dataUrl: "/images/avatars/avatar-10.jpg",
  },
  {
    id: "avatar-11",
    label: "Star Seeker",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#d946ef"/><circle cx="50" cy="40" r="16" fill="#fed7aa"/></svg>`,
    dataUrl: "/images/avatars/avatar-11.jpg",
  },
  {
    id: "avatar-12",
    label: "Future Builder",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#ef4444"/><circle cx="50" cy="40" r="16" fill="#fdba74"/></svg>`,
    dataUrl: "/images/avatars/avatar-12.jpg",
  },
];
