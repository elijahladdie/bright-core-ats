import { twMerge } from 'tailwind-merge';

import { clsx, type ClassValue } from 'clsx';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { TOKEN_KEY } from '@/App';
import { JobInput } from '@workspace/api-client-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useRouteParams() {
  const [location] = useLocation();
  const pieces = location.split('/').filter(Boolean);
  return { params: { id: pieces.find((piece) => /^\d+$/.test(piece)) || '' } };
}

export function useAuthRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const redirect = () => setLocation('/admin/login');
    window.addEventListener('brightcore:unauthorized', redirect);
    return () => window.removeEventListener('brightcore:unauthorized', redirect);
  }, [setLocation]);
  return localStorage.getItem(TOKEN_KEY);
}


export const blankJob: JobInput = { title: '', location: '', employmentType: 'Full-time', closingDate: '', summary: '', description: '', responsibilities: '', requirements: '' };