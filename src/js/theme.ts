/**
 * Theme switching functionality
 * Handles light/dark theme toggle with localStorage persistence
 * and respects system preference as default
 */

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bentopdf-theme';

/**
 * Get the user's preferred theme from localStorage or system preference
 */
function getPreferredTheme(): Theme {
  // Check localStorage first
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  // Fall back to system preference
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }

  return 'dark';
}

/**
 * Apply the theme to the document
 */
function applyTheme(theme: Theme): void {
  const html = document.documentElement;

  if (theme === 'light') {
    html.classList.add('light');
  } else {
    html.classList.remove('light');
  }

  // Update icon visibility for desktop toggle
  const moonIcon = document.getElementById('theme-icon-moon');
  const sunIcon = document.getElementById('theme-icon-sun');
  if (moonIcon && sunIcon) {
    if (theme === 'light') {
      moonIcon.classList.add('hidden');
      sunIcon.classList.remove('hidden');
    } else {
      moonIcon.classList.remove('hidden');
      sunIcon.classList.add('hidden');
    }
  }

  // Update icon visibility for mobile toggle
  const moonIconMobile = document.getElementById('theme-icon-moon-mobile');
  const sunIconMobile = document.getElementById('theme-icon-sun-mobile');
  if (moonIconMobile && sunIconMobile) {
    if (theme === 'light') {
      moonIconMobile.classList.add('hidden');
      sunIconMobile.classList.remove('hidden');
    } else {
      moonIconMobile.classList.remove('hidden');
      sunIconMobile.classList.add('hidden');
    }
  }
}

/**
 * Save the theme preference to localStorage
 */
function saveTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme(): void {
  const html = document.documentElement;
  const currentTheme: Theme = html.classList.contains('light')
    ? 'light'
    : 'dark';
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';

  applyTheme(newTheme);
  saveTheme(newTheme);
}

/**
 * Initialize theme functionality
 */
export function initTheme(): void {
  // Apply the preferred theme immediately
  const preferredTheme = getPreferredTheme();
  applyTheme(preferredTheme);

  // Set up event listeners for theme toggle buttons
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const toggleBtnMobile = document.getElementById('theme-toggle-btn-mobile');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }

  if (toggleBtnMobile) {
    toggleBtnMobile.addEventListener('click', toggleTheme);
  }

  // Listen for system preference changes
  window
    .matchMedia('(prefers-color-scheme: light)')
    .addEventListener('change', (e) => {
      // Only update if user hasn't set a manual preference
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}
