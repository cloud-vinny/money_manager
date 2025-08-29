export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('theme') as Theme) || 'light';
}

export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
}
