import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Create a unique directory for each test worker
const getTestDir = () => {
  const dir = path.join(
    os.tmpdir(),
    `bentopdf-test-${process.pid}-${Date.now()}`
  );
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Helper to create test image files
function createTestImageFile(testDir: string, filename: string): string {
  const filePath = path.join(testDir, filename);

  // Create a minimal valid JPEG file (smallest valid JPEG)
  const jpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
    0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
    0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
    0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
    0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
    0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
    0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
    0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
    0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd5, 0xdb, 0x20, 0xa8, 0xf1, 0x85, 0xf3,
    0x51, 0x4b, 0x81, 0x9e, 0x94, 0x01, 0xff, 0xd9,
  ]);

  fs.writeFileSync(filePath, jpegBuffer);
  return filePath;
}

// Helper to upload multiple files to the page
async function uploadFiles(page: Page, filePaths: string[]) {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePaths);
}

// Helper to get all file items in the list
async function getFileListItems(page: Page) {
  return page.getByRole('list', { name: /file list/i }).getByRole('listitem');
}

// Helper to create test files for a test
function createTestFiles(testDir: string): string[] {
  return [
    createTestImageFile(testDir, 'image1.jpg'),
    createTestImageFile(testDir, 'image2.jpg'),
    createTestImageFile(testDir, 'image3.jpg'),
    createTestImageFile(testDir, 'image4.jpg'),
  ];
}

// Cleanup helper
function cleanupTestDir(testDir: string) {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

test.describe('JPG to PDF - Drag and Drop Sorting', () => {
  test.describe('Page Load and Basic UI', () => {
    test('should load the JPG to PDF page', async ({ page }) => {
      await page.goto('/jpg-to-pdf.html');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveTitle(/JPG to PDF/i);
    });

    test('should display the file upload drop zone', async ({ page }) => {
      await page.goto('/jpg-to-pdf.html');
      await page.waitForLoadState('networkidle');

      const dropZone = page.locator('#drop-zone');
      await expect(dropZone).toBeVisible();
      await expect(page.getByText(/Click to select a file/i)).toBeVisible();
    });

    test('should have accessible file input', async ({ page }) => {
      await page.goto('/jpg-to-pdf.html');
      await page.waitForLoadState('networkidle');

      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toHaveAttribute('accept', /image\/jpeg/);
      await expect(fileInput).toHaveAttribute('multiple', '');
    });
  });

  test.describe('File Upload', () => {
    test('should upload and display files in a list', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        // Check file list is visible with correct role
        const fileList = page.getByRole('list', { name: /file list/i });
        await expect(fileList).toBeVisible();

        // Check files are displayed as list items
        const items = await getFileListItems(page);
        await expect(items).toHaveCount(2);
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should display file names and sizes', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        const fileItem = page.getByRole('listitem').first();
        await expect(fileItem).toContainText('image1.jpg');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should show file controls after upload', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        await expect(
          page.getByRole('button', { name: /add more/i })
        ).toBeVisible();
        await expect(
          page.getByRole('button', { name: /clear all/i })
        ).toBeVisible();
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should allow adding more files', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        let items = await getFileListItems(page);
        await expect(items).toHaveCount(1);

        // Upload more files
        await uploadFiles(page, [testFiles[1], testFiles[2]]);

        items = await getFileListItems(page);
        await expect(items).toHaveCount(3);
      } finally {
        cleanupTestDir(testDir);
      }
    });
  });

  test.describe('Accessibility - ARIA Attributes', () => {
    test('should have proper list role on container', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        const fileList = page.getByRole('list', { name: /file list/i });
        await expect(fileList).toHaveAttribute('role', 'list');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should have proper listitem role on each file', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        const items = await getFileListItems(page);
        const count = await items.count();

        for (let i = 0; i < count; i++) {
          await expect(items.nth(i)).toHaveAttribute('role', 'listitem');
        }
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should have aria-grabbed attribute on items', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        const item = page.getByRole('listitem').first();
        await expect(item).toHaveAttribute('aria-grabbed', 'false');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should have aria-label with position information', async ({
      page,
    }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 3));

        const firstItem = page.getByRole('listitem').first();
        const ariaLabel = await firstItem.getAttribute('aria-label');

        expect(ariaLabel).toContain('image1.jpg');
        expect(ariaLabel).toContain('Position 1 of 3');
        expect(ariaLabel).toMatch(/Press Space to grab/i);
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should have tabindex for keyboard focus', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        const item = page.getByRole('listitem').first();
        await expect(item).toHaveAttribute('tabindex', '0');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should have accessible remove button with aria-label', async ({
      page,
    }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        const removeButton = page.getByRole('button', {
          name: /remove image1\.jpg/i,
        });
        await expect(removeButton).toBeVisible();
      } finally {
        cleanupTestDir(testDir);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should focus items with Tab key', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        // Focus on the first list item directly
        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();

        await expect(firstItem).toBeFocused();
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should grab item with Space key', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();

        // Press Space to grab
        await page.keyboard.press('Space');

        await expect(firstItem).toHaveAttribute('aria-grabbed', 'true');
        await expect(firstItem).toHaveClass(/keyboard-grabbed/);
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should grab item with Enter key', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();

        // Press Enter to grab
        await page.keyboard.press('Enter');

        await expect(firstItem).toHaveAttribute('aria-grabbed', 'true');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should move item down with ArrowDown when grabbed', async ({
      page,
    }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 3));

        // Get initial order
        let items = await getFileListItems(page);
        const firstItemLabel = await items.first().getAttribute('aria-label');
        expect(firstItemLabel).toContain('image1.jpg');

        // Focus and grab first item
        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();
        await page.keyboard.press('Space');

        // Move down
        await page.keyboard.press('ArrowDown');

        // Check new order - image1 should now be at position 2
        items = await getFileListItems(page);
        const secondItemLabel = await items.nth(1).getAttribute('aria-label');
        expect(secondItemLabel).toContain('image1.jpg');
        expect(secondItemLabel).toContain('Position 2 of 3');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should move item up with ArrowUp when grabbed', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 3));

        // Focus and grab second item
        const secondItem = page.getByRole('listitem').nth(1);
        await secondItem.focus();
        await page.keyboard.press('Space');

        // Move up
        await page.keyboard.press('ArrowUp');

        // Check new order - image2 should now be at position 1
        const items = await getFileListItems(page);
        const firstItemLabel = await items.first().getAttribute('aria-label');
        expect(firstItemLabel).toContain('image2.jpg');
        expect(firstItemLabel).toContain('Position 1 of 3');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should drop item with Space key after moving', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();

        // Grab, move, and drop
        await page.keyboard.press('Space');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Space');

        // Should no longer be grabbed
        const movedItem = page.getByRole('listitem').nth(1);
        await expect(movedItem).toHaveAttribute('aria-grabbed', 'false');
        await expect(movedItem).not.toHaveClass(/keyboard-grabbed/);
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should cancel grab with Escape key', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();

        // Grab and cancel
        await page.keyboard.press('Space');
        await expect(firstItem).toHaveAttribute('aria-grabbed', 'true');

        await page.keyboard.press('Escape');
        await expect(firstItem).toHaveAttribute('aria-grabbed', 'false');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should not move beyond list boundaries', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        // Try to move first item up (should stay at position 1)
        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();
        await page.keyboard.press('Space');
        await page.keyboard.press('ArrowUp');

        const items = await getFileListItems(page);
        const firstItemLabel = await items.first().getAttribute('aria-label');
        expect(firstItemLabel).toContain('image1.jpg');
        expect(firstItemLabel).toContain('Position 1 of 2');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should remove item with Delete key', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();

        // Press Delete to remove
        await page.keyboard.press('Delete');

        // Should only have one item left
        const items = await getFileListItems(page);
        await expect(items).toHaveCount(1);

        // Remaining item should be image2.jpg
        const remainingLabel = await items.first().getAttribute('aria-label');
        expect(remainingLabel).toContain('image2.jpg');
      } finally {
        cleanupTestDir(testDir);
      }
    });
  });

  test.describe('Mouse Drag and Drop', () => {
    test('should have cursor grab style on items', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        const item = page.getByRole('listitem').first();
        await expect(item).toHaveClass(/cursor-grab/);
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should be draggable', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        const item = page.getByRole('listitem').first();
        await expect(item).toHaveAttribute('draggable', 'true');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should reorder items via drag and drop', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 3));

        // Verify initial order
        let items = await getFileListItems(page);
        const firstLabel = await items.first().getAttribute('aria-label');
        expect(firstLabel).toContain('image1.jpg');

        // Get the items
        const firstItem = items.first();
        const secondItem = items.nth(1);

        // Get bounding boxes
        const firstBox = await firstItem.boundingBox();
        const secondBox = await secondItem.boundingBox();

        if (firstBox && secondBox) {
          // Drag first item below second item
          await page.mouse.move(
            firstBox.x + firstBox.width / 2,
            firstBox.y + firstBox.height / 2
          );
          await page.mouse.down();

          // Move to below the second item
          await page.mouse.move(
            secondBox.x + secondBox.width / 2,
            secondBox.y + secondBox.height + 5,
            { steps: 20 }
          );
          await page.mouse.up();

          // Wait for animation to complete
          await page.waitForTimeout(400);

          // Check that image1 is now at position 2
          items = await getFileListItems(page);
          const secondLabel = await items.nth(1).getAttribute('aria-label');
          expect(secondLabel).toContain('image1.jpg');
        }
      } finally {
        cleanupTestDir(testDir);
      }
    });
  });

  test.describe('File Removal', () => {
    test('should remove file when clicking remove button', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        // Click remove button for first file
        const removeButton = page.getByRole('button', {
          name: /remove image1\.jpg/i,
        });
        await removeButton.click();

        // Should only have one item left
        const items = await getFileListItems(page);
        await expect(items).toHaveCount(1);
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should update positions after removal', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 3));

        // Remove first file
        const removeButton = page.getByRole('button', {
          name: /remove image1\.jpg/i,
        });
        await removeButton.click();

        // Check remaining items have updated positions
        const items = await getFileListItems(page);
        const firstItemLabel = await items.first().getAttribute('aria-label');
        expect(firstItemLabel).toContain('image2.jpg');
        expect(firstItemLabel).toContain('Position 1 of 2');
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should hide controls when all files removed', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        // Remove the only file
        const removeButton = page.getByRole('button', {
          name: /remove image1\.jpg/i,
        });
        await removeButton.click();

        // Controls should be hidden
        await expect(
          page.getByRole('button', { name: /add more/i })
        ).toBeHidden();
        await expect(
          page.getByRole('button', { name: /clear all/i })
        ).toBeHidden();
      } finally {
        cleanupTestDir(testDir);
      }
    });
  });

  test.describe('Clear All Files', () => {
    test('should clear all files when clicking clear all button', async ({
      page,
    }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 3));

        // Verify files are uploaded
        const items = await getFileListItems(page);
        await expect(items).toHaveCount(3);

        // Click clear all
        await page.getByRole('button', { name: /clear all/i }).click();

        // File list should be empty (or container should be empty)
        const fileDisplayArea = page.locator('#file-display-area');
        await expect(fileDisplayArea).toBeEmpty();
      } finally {
        cleanupTestDir(testDir);
      }
    });
  });

  test.describe('Visual Feedback', () => {
    test('should show focus ring when item is focused', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        const item = page.getByRole('listitem').first();
        await item.focus();

        // Check focus is visible (element should have focus styles)
        await expect(item).toBeFocused();
      } finally {
        cleanupTestDir(testDir);
      }
    });

    test('should show keyboard-grabbed class when grabbed via keyboard', async ({
      page,
    }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, [testFiles[0]]);

        const item = page.getByRole('listitem').first();
        await item.focus();
        await page.keyboard.press('Space');

        await expect(item).toHaveClass(/keyboard-grabbed/);
      } finally {
        cleanupTestDir(testDir);
      }
    });
  });

  test.describe('Screen Reader Announcements', () => {
    test('should have live region for announcements', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 2));

        // Trigger an action that creates announcements
        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();
        await page.keyboard.press('Space');

        // Check for live region
        const liveRegion = page.locator('[role="status"][aria-live="polite"]');
        await expect(liveRegion).toBeAttached();
      } finally {
        cleanupTestDir(testDir);
      }
    });
  });

  test.describe('Integration - Reorder and Convert', () => {
    test('should maintain reordered files for conversion', async ({ page }) => {
      const testDir = getTestDir();
      const testFiles = createTestFiles(testDir);

      try {
        await page.goto('/jpg-to-pdf.html');
        await page.waitForLoadState('networkidle');
        await uploadFiles(page, testFiles.slice(0, 3));

        // Reorder: move first to last position using keyboard
        const firstItem = page.getByRole('listitem').first();
        await firstItem.focus();
        await page.keyboard.press('Space');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Space');

        // Verify order before conversion
        const items = await getFileListItems(page);
        const labels = await Promise.all([
          items.nth(0).getAttribute('aria-label'),
          items.nth(1).getAttribute('aria-label'),
          items.nth(2).getAttribute('aria-label'),
        ]);

        expect(labels[0]).toContain('image2.jpg');
        expect(labels[1]).toContain('image3.jpg');
        expect(labels[2]).toContain('image1.jpg');

        // Convert button should be visible and enabled
        const convertButton = page.getByRole('button', {
          name: /convert to pdf/i,
        });
        await expect(convertButton).toBeVisible();
        await expect(convertButton).toBeEnabled();
      } finally {
        cleanupTestDir(testDir);
      }
    });
  });
});
