import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateGitHubUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'github.com' && parsedUrl.pathname.split('/').filter(Boolean).length >= 2;
  } catch {
    return false;
  }
}

export function extractRepoName(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`;
    }
    return url;
  } catch {
    return url;
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function simulateTyping(
  element: HTMLElement,
  text: string,
  speed: number = 30
): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const typeInterval = setInterval(() => {
      element.textContent = text.slice(0, i + 1);
      i++;
      if (i >= text.length) {
        clearInterval(typeInterval);
        resolve();
      }
    }, speed);
  });
}
