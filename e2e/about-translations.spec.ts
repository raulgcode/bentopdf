import { test, expect } from '@playwright/test';

const supportedLanguages = ['en', 'de', 'es', 'zh', 'vi'] as const;

// Translations verified from public/locales/[lang]/common.json
const translations = {
  en: {
    navAbout: 'About',
    heroTitle: 'We believe PDF tools should be',
    missionTitle: 'Our Mission',
    languageName: 'English',
  },
  de: {
    navAbout: 'Über uns',
    heroTitle: 'Wir glauben PDF-Werkzeuge sollten',
    missionTitle: 'Unsere Mission',
    languageName: 'Deutsch',
  },
  es: {
    navAbout: 'Acerca de',
    heroTitle: 'Creemos que las herramientas PDF deben ser',
    missionTitle: 'Nuestra Misión',
    languageName: 'Español',
  },
  zh: {
    navAbout: '关于我们',
    heroTitle: '我们相信 PDF 工具应该是',
    missionTitle: '我们的使命',
    languageName: '中文',
  },
  vi: {
    navAbout: 'Giới thiệu',
    heroTitle: 'Chúng tôi tin rằng công cụ PDF nên',
    missionTitle: 'Sứ mệnh của chúng tôi',
    languageName: 'Tiếng Việt',
  },
} as const;

test.describe('About Page Translations', () => {
  test.describe('Direct URL Navigation', () => {
    for (const lang of supportedLanguages) {
      test(`should display ${lang} translations when navigating to /${lang}/about.html`, async ({
        page,
      }) => {
        await page.goto(`/${lang}/about.html`);
        await page.waitForLoadState('networkidle');

        // Check the HTML lang attribute
        const htmlLang = await page.locator('html').getAttribute('lang');
        expect(htmlLang).toBe(lang);

        // Check navigation contains the translated "About" link using accessible selector
        const nav = page.getByRole('navigation');
        await expect(nav.getByRole('link', { name: translations[lang].navAbout })).toBeVisible();

        // Check hero section title contains the translated text
        const heroSection = page.locator('#about-hero');
        await expect(heroSection).toContainText(translations[lang].heroTitle);

        // Check mission section contains the translated title
        const missionSection = page.locator('#mission-section');
        await expect(
          missionSection.getByRole('heading', { name: translations[lang].missionTitle })
        ).toBeVisible();
      });
    }
  });

  test.describe('Language Switcher', () => {
    test('should change language when using the language switcher', async ({ page }) => {
      // Start on English about page
      await page.goto('/en/about.html');
      await page.waitForLoadState('networkidle');

      // Verify we're on English by checking hero content
      const heroSection = page.locator('#about-hero');
      await expect(heroSection).toContainText(translations.en.heroTitle);

      // Find and click the language switcher button using accessible selector
      const languageSwitcherButton = page.getByRole('button', { name: translations.en.languageName });
      await languageSwitcherButton.click();

      // Select German from the dropdown menu
      const menu = page.getByRole('menu');
      await menu.getByRole('menuitem', { name: translations.de.languageName }).click();

      // Wait for navigation to complete
      await page.waitForURL('**/de/about.html');
      await page.waitForLoadState('networkidle');

      // Verify the URL changed to German
      expect(page.url()).toContain('/de/about.html');

      // Verify the content changed to German
      await expect(heroSection).toContainText(translations.de.heroTitle);
      const missionSection = page.locator('#mission-section');
      await expect(
        missionSection.getByRole('heading', { name: translations.de.missionTitle })
      ).toBeVisible();
    });

    test('should switch from German to Spanish using language switcher', async ({ page }) => {
      // Start on German about page
      await page.goto('/de/about.html');
      await page.waitForLoadState('networkidle');

      // Verify we're on German
      const heroSection = page.locator('#about-hero');
      await expect(heroSection).toContainText(translations.de.heroTitle);

      // Find and click the language switcher button
      const languageSwitcherButton = page.getByRole('button', { name: translations.de.languageName });
      await languageSwitcherButton.click();

      // Select Spanish from the dropdown menu
      const menu = page.getByRole('menu');
      await menu.getByRole('menuitem', { name: translations.es.languageName }).click();

      // Wait for navigation to complete
      await page.waitForURL('**/es/about.html');
      await page.waitForLoadState('networkidle');

      // Verify the URL changed to Spanish
      expect(page.url()).toContain('/es/about.html');

      // Verify the content changed to Spanish
      await expect(heroSection).toContainText(translations.es.heroTitle);
    });

    test('should switch through multiple languages sequentially', async ({ page }) => {
      // Start on English
      await page.goto('/en/about.html');
      await page.waitForLoadState('networkidle');

      const nav = page.getByRole('navigation');
      await expect(nav.getByRole('link', { name: translations.en.navAbout })).toBeVisible();

      // Switch to Chinese
      await page.getByRole('button', { name: translations.en.languageName }).click();
      await page.getByRole('menu').getByRole('menuitem', { name: translations.zh.languageName }).click();
      await page.waitForURL('**/zh/about.html');
      await page.waitForLoadState('networkidle');
      await expect(nav.getByRole('link', { name: translations.zh.navAbout })).toBeVisible();

      // Switch to Vietnamese
      await page.getByRole('button', { name: translations.zh.languageName }).click();
      await page.getByRole('menu').getByRole('menuitem', { name: translations.vi.languageName }).click();
      await page.waitForURL('**/vi/about.html');
      await page.waitForLoadState('networkidle');
      await expect(nav.getByRole('link', { name: translations.vi.navAbout })).toBeVisible();
    });
  });

  test.describe('URL Structure Verification', () => {
    test('should maintain correct URL structure after language switch', async ({ page }) => {
      await page.goto('/en/about.html');
      await page.waitForLoadState('networkidle');

      // Switch to German using accessible selectors
      await page.getByRole('button', { name: translations.en.languageName }).click();
      await page.getByRole('menu').getByRole('menuitem', { name: translations.de.languageName }).click();
      await page.waitForURL('**/de/about.html');

      // Verify the complete URL structure
      const url = new URL(page.url());
      expect(url.pathname).toBe('/de/about.html');
    });

    test('should preserve query parameters when switching languages', async ({ page }) => {
      await page.goto('/en/about.html?ref=test');
      await page.waitForLoadState('networkidle');

      // Switch to Spanish using accessible selectors
      await page.getByRole('button', { name: translations.en.languageName }).click();
      await page.getByRole('menu').getByRole('menuitem', { name: translations.es.languageName }).click();
      await page.waitForURL('**/es/about.html**');
      await page.waitForLoadState('networkidle');

      // Verify query parameters are preserved
      const url = new URL(page.url());
      expect(url.pathname).toBe('/es/about.html');
      expect(url.searchParams.get('ref')).toBe('test');
    });
  });

  test.describe('Language Switcher Dropdown Behavior', () => {
    test('should open and close language dropdown', async ({ page }) => {
      await page.goto('/en/about.html');
      await page.waitForLoadState('networkidle');

      const menu = page.getByRole('menu');
      const switcherButton = page.getByRole('button', { name: translations.en.languageName });

      // Initially dropdown should be hidden
      await expect(menu).toBeHidden();

      // Click to open
      await switcherButton.click();
      await expect(menu).toBeVisible();

      // Click outside to close
      await page.locator('body').click({ position: { x: 10, y: 10 } });
      await expect(menu).toBeHidden();
    });

    test('should display all supported languages in dropdown', async ({ page }) => {
      await page.goto('/en/about.html');
      await page.waitForLoadState('networkidle');

      // Open the language switcher dropdown
      await page.getByRole('button', { name: translations.en.languageName }).click();

      // Check all languages are present using accessible selectors
      const menu = page.getByRole('menu');
      await expect(menu.getByRole('menuitem', { name: 'English' })).toBeVisible();
      await expect(menu.getByRole('menuitem', { name: 'Deutsch' })).toBeVisible();
      await expect(menu.getByRole('menuitem', { name: 'Español' })).toBeVisible();
      await expect(menu.getByRole('menuitem', { name: '中文' })).toBeVisible();
      await expect(menu.getByRole('menuitem', { name: 'Tiếng Việt' })).toBeVisible();
    });

    test('should highlight current language in dropdown', async ({ page }) => {
      await page.goto('/de/about.html');
      await page.waitForLoadState('networkidle');

      // Open the language switcher dropdown
      await page.getByRole('button', { name: translations.de.languageName }).click();

      // The German option should have a different background indicating it's selected
      const germanOption = page.getByRole('menu').getByRole('menuitem', { name: 'Deutsch' });
      await expect(germanOption).toHaveClass(/bg-gray-700/);
    });
  });
});
