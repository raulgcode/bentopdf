import { createIcons, icons } from 'lucide';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { downloadFile } from '../utils/helpers.js';
import { t } from '../i18n/i18n.js';

// Page size definitions in points (1 inch = 72 points)
const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  letter: { width: 612, height: 792 }, // 8.5" x 11"
  a4: { width: 595.28, height: 841.89 }, // 210mm x 297mm
  a5: { width: 419.53, height: 595.28 }, // 148mm x 210mm
  legal: { width: 612, height: 1008 }, // 8.5" x 14"
  tabloid: { width: 792, height: 1224 }, // 11" x 17"
  a3: { width: 841.89, height: 1190.55 }, // 297mm x 420mm
};

// HTML Templates
const TEMPLATES: Record<
  string,
  { name: string; description: string; html: string }
> = {
  basic: {
    name: 'Basic Document',
    description: 'A simple document with heading and paragraphs',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    p {
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <h1>Document Title</h1>
  <p>This is a sample document. You can edit this HTML and CSS to create your own custom PDF.</p>
  <p>Add more content here...</p>
</body>
</html>`,
  },
  invoice: {
    name: 'Invoice Template',
    description: 'A professional invoice layout',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
    }
    .invoice-title {
      font-size: 32px;
      color: #3498db;
      text-align: right;
    }
    .invoice-details {
      text-align: right;
      color: #666;
    }
    .addresses {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .address-block h3 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    th {
      background: #3498db;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    .total-row td {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid #333;
    }
    .footer {
      text-align: center;
      color: #666;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">Your Company</div>
      <div>123 Business Street</div>
      <div>City, State 12345</div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-details">
        <div>Invoice #: INV-001</div>
        <div>Date: January 8, 2026</div>
      </div>
    </div>
  </div>

  <div class="addresses">
    <div class="address-block">
      <h3>Bill To:</h3>
      <div>Client Name</div>
      <div>456 Client Avenue</div>
      <div>City, State 67890</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Service Item 1</td>
        <td>2</td>
        <td>$100.00</td>
        <td>$200.00</td>
      </tr>
      <tr>
        <td>Service Item 2</td>
        <td>1</td>
        <td>$150.00</td>
        <td>$150.00</td>
      </tr>
      <tr class="total-row">
        <td colspan="3">Total</td>
        <td>$350.00</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Thank you for your business!
  </div>
</body>
</html>`,
  },
  resume: {
    name: 'Resume Template',
    description: 'A clean resume/CV layout',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #333;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .name {
      font-size: 32px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }
    .contact {
      color: #666;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #3498db;
      border-bottom: 2px solid #3498db;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    .job {
      margin-bottom: 15px;
    }
    .job-header {
      display: flex;
      justify-content: space-between;
    }
    .job-title {
      font-weight: bold;
    }
    .job-date {
      color: #666;
    }
    .company {
      font-style: italic;
      color: #666;
    }
    ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .skill {
      background: #ecf0f1;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">John Doe</div>
    <div class="contact">john.doe@email.com | (555) 123-4567 | City, State</div>
  </div>

  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p>Experienced professional with expertise in... Add your summary here.</p>
  </div>

  <div class="section">
    <div class="section-title">Experience</div>
    <div class="job">
      <div class="job-header">
        <span class="job-title">Senior Position</span>
        <span class="job-date">2022 - Present</span>
      </div>
      <div class="company">Company Name</div>
      <ul>
        <li>Achievement or responsibility</li>
        <li>Another achievement</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Education</div>
    <div class="job">
      <div class="job-header">
        <span class="job-title">Degree Name</span>
        <span class="job-date">2018</span>
      </div>
      <div class="company">University Name</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills">
      <span class="skill">Skill 1</span>
      <span class="skill">Skill 2</span>
      <span class="skill">Skill 3</span>
      <span class="skill">Skill 4</span>
    </div>
  </div>
</body>
</html>`,
  },
  report: {
    name: 'Report Template',
    description: 'A formal report with sections',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      margin: 0;
      padding: 40px;
      color: #333;
      line-height: 1.8;
    }
    .title-page {
      text-align: center;
      padding: 100px 0;
    }
    .report-title {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .report-subtitle {
      font-size: 18px;
      color: #666;
      margin-bottom: 40px;
    }
    .meta-info {
      color: #666;
    }
    h2 {
      color: #2c3e50;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      margin-top: 40px;
    }
    h3 {
      color: #34495e;
    }
    p {
      text-align: justify;
      margin-bottom: 16px;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="title-page">
    <div class="report-title">Report Title</div>
    <div class="report-subtitle">Subtitle or Description</div>
    <div class="meta-info">
      <div>Prepared by: Your Name</div>
      <div>Date: January 8, 2026</div>
    </div>
  </div>

  <div class="page-break"></div>

  <h2>1. Introduction</h2>
  <p>This section provides an overview of the report's purpose and scope. Add your introduction text here.</p>

  <h2>2. Background</h2>
  <p>Provide context and background information relevant to the report topic.</p>

  <h2>3. Findings</h2>
  <h3>3.1 First Finding</h3>
  <p>Describe the first major finding or result.</p>

  <h3>3.2 Second Finding</h3>
  <p>Describe the second major finding or result.</p>

  <h2>4. Conclusion</h2>
  <p>Summarize the key points and provide recommendations.</p>
</body>
</html>`,
  },
};

// Default HTML template
const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #2563eb;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 2px 6px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Start editing this HTML to create your PDF document.</p>
  <p>You can use <span class="highlight">CSS styles</span> to customize the appearance.</p>
</body>
</html>`;

// DOM Elements
let htmlEditor: HTMLTextAreaElement;
let previewFrame: HTMLIFrameElement;
let pageSizeSelect: HTMLSelectElement;
let customDimensionsInput: HTMLDivElement;
let customWidth: HTMLInputElement;
let customHeight: HTMLInputElement;
let marginInput: HTMLInputElement;
let exportPdfBtn: HTMLButtonElement;
let loadTemplateBtn: HTMLButtonElement;
let formatCodeBtn: HTMLButtonElement;
let clearCodeBtn: HTMLButtonElement;
let refreshPreviewBtn: HTMLButtonElement;
let templateModal: HTMLDivElement;
let templateModalClose: HTMLButtonElement;
let templateList: HTMLDivElement;
let errorModal: HTMLDivElement;
let errorModalTitle: HTMLHeadingElement;
let errorModalMessage: HTMLParagraphElement;
let errorModalClose: HTMLButtonElement;

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

function initializePage(): void {
  createIcons({ icons });

  // Get DOM elements
  htmlEditor = document.getElementById('htmlEditor') as HTMLTextAreaElement;
  previewFrame = document.getElementById('previewFrame') as HTMLIFrameElement;
  pageSizeSelect = document.getElementById(
    'pageSizeSelect'
  ) as HTMLSelectElement;
  customDimensionsInput = document.getElementById(
    'customDimensionsInput'
  ) as HTMLDivElement;
  customWidth = document.getElementById('customWidth') as HTMLInputElement;
  customHeight = document.getElementById('customHeight') as HTMLInputElement;
  marginInput = document.getElementById('marginInput') as HTMLInputElement;
  exportPdfBtn = document.getElementById('exportPdfBtn') as HTMLButtonElement;
  loadTemplateBtn = document.getElementById(
    'loadTemplateBtn'
  ) as HTMLButtonElement;
  formatCodeBtn = document.getElementById('formatCodeBtn') as HTMLButtonElement;
  clearCodeBtn = document.getElementById('clearCodeBtn') as HTMLButtonElement;
  refreshPreviewBtn = document.getElementById(
    'refreshPreviewBtn'
  ) as HTMLButtonElement;
  templateModal = document.getElementById('templateModal') as HTMLDivElement;
  templateModalClose = document.getElementById(
    'templateModalClose'
  ) as HTMLButtonElement;
  templateList = document.getElementById('templateList') as HTMLDivElement;
  errorModal = document.getElementById('errorModal') as HTMLDivElement;
  errorModalTitle = document.getElementById(
    'errorModalTitle'
  ) as HTMLHeadingElement;
  errorModalMessage = document.getElementById(
    'errorModalMessage'
  ) as HTMLParagraphElement;
  errorModalClose = document.getElementById(
    'errorModalClose'
  ) as HTMLButtonElement;

  // Set default HTML
  if (htmlEditor) {
    htmlEditor.value = DEFAULT_HTML;
  }

  setupEventListeners();
  updatePreview();
  populateTemplateList();
}

function setupEventListeners(): void {
  // HTML Editor input - debounced live preview
  htmlEditor?.addEventListener('input', () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(updatePreview, 300);
  });

  // Tab key support in editor
  htmlEditor?.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = htmlEditor.selectionStart;
      const end = htmlEditor.selectionEnd;
      htmlEditor.value =
        htmlEditor.value.substring(0, start) +
        '  ' +
        htmlEditor.value.substring(end);
      htmlEditor.selectionStart = htmlEditor.selectionEnd = start + 2;
      updatePreview();
    }
  });

  // Page size change handler
  pageSizeSelect?.addEventListener('change', handlePageSizeChange);

  // Export PDF button
  exportPdfBtn?.addEventListener('click', exportToPdf);

  // Load template button
  loadTemplateBtn?.addEventListener('click', () => {
    templateModal.classList.remove('hidden');
  });

  // Format code button
  formatCodeBtn?.addEventListener('click', formatCode);

  // Clear code button
  clearCodeBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all code?')) {
      htmlEditor.value = '';
      updatePreview();
    }
  });

  // Refresh preview button
  refreshPreviewBtn?.addEventListener('click', updatePreview);

  // Template modal close
  templateModalClose?.addEventListener('click', () => {
    templateModal.classList.add('hidden');
  });
  templateModal?.addEventListener('click', (e) => {
    if (e.target === templateModal) {
      templateModal.classList.add('hidden');
    }
  });

  // Error modal close
  errorModalClose?.addEventListener('click', hideErrorModal);
  errorModal?.addEventListener('click', (e) => {
    if (e.target === errorModal) {
      hideErrorModal();
    }
  });

  // Back to tools button
  const backButton = document.getElementById('back-to-tools');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = '/';
    });
  }
}

function populateTemplateList(): void {
  if (!templateList) return;

  templateList.innerHTML = '';

  Object.entries(TEMPLATES).forEach(([key, template]) => {
    const button = document.createElement('button');
    button.className =
      'w-full text-left bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors';
    // Use translations for template names/descriptions, fallback to defaults
    const templateName =
      t(`tools:htmlToPdf.templates.${key}.name`) || template.name;
    const templateDescription =
      t(`tools:htmlToPdf.templates.${key}.description`) || template.description;
    button.innerHTML = `
      <div class="font-semibold text-white">${templateName}</div>
      <div class="text-sm text-gray-400">${templateDescription}</div>
    `;
    button.addEventListener('click', () => {
      loadTemplate(key);
      templateModal.classList.add('hidden');
    });
    templateList.appendChild(button);
  });
}

function loadTemplate(templateKey: string): void {
  const template = TEMPLATES[templateKey];
  if (template && htmlEditor) {
    htmlEditor.value = template.html;
    updatePreview();
  }
}

function updatePreview(): void {
  if (!previewFrame || !htmlEditor) return;

  const html = htmlEditor.value;
  const iframeDoc =
    previewFrame.contentDocument || previewFrame.contentWindow?.document;

  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
  }
}

function handlePageSizeChange(): void {
  const selectedSize = pageSizeSelect.value;

  if (selectedSize === 'custom') {
    customDimensionsInput.classList.remove('hidden');
  } else {
    customDimensionsInput.classList.add('hidden');
  }
}

function getPageDimensions(): { width: number; height: number } {
  const selectedSize = pageSizeSelect.value;

  if (selectedSize === 'custom') {
    const width = parseInt(customWidth.value) || 612;
    const height = parseInt(customHeight.value) || 792;
    return { width, height };
  }

  return PAGE_SIZES[selectedSize] || PAGE_SIZES.a4;
}

function getOrientation(): 'portrait' | 'landscape' {
  const selectedOrientation = document.querySelector(
    'input[name="orientation"]:checked'
  ) as HTMLInputElement;
  return (selectedOrientation?.value as 'portrait' | 'landscape') || 'portrait';
}

function formatCode(): void {
  if (!htmlEditor) return;

  let html = htmlEditor.value;

  // Basic HTML formatting
  try {
    // Add newlines after opening tags
    html = html.replace(/></g, '>\n<');

    // Indent nested elements (simple approach)
    const lines = html.split('\n');
    let indent = 0;
    const formattedLines = lines.map((line) => {
      line = line.trim();
      if (!line) return '';

      // Decrease indent for closing tags
      if (line.startsWith('</') || line.startsWith('-->')) {
        indent = Math.max(0, indent - 1);
      }

      const indentedLine = '  '.repeat(indent) + line;

      // Increase indent for opening tags (but not self-closing or void elements)
      if (
        line.startsWith('<') &&
        !line.startsWith('</') &&
        !line.startsWith('<!') &&
        !line.startsWith('<!--') &&
        !line.endsWith('/>') &&
        !line.includes('</') &&
        !/<(br|hr|img|input|meta|link|area|base|col|embed|keygen|param|source|track|wbr)[^>]*>/i.test(
          line
        )
      ) {
        indent++;
      }

      return indentedLine;
    });

    htmlEditor.value = formattedLines.filter((line) => line !== '').join('\n');
    updatePreview();
  } catch {
    // If formatting fails, just leave the code as-is
  }
}

function showErrorModal(title: string, message: string): void {
  errorModalTitle.textContent = title;
  errorModalMessage.textContent = message;
  errorModal.classList.remove('hidden');
}

function hideErrorModal(): void {
  errorModal.classList.add('hidden');
}

function showLoader(message: string): void {
  let loaderModal = document.getElementById('loader-modal');
  if (!loaderModal) {
    loaderModal = document.createElement('div');
    loaderModal.id = 'loader-modal';
    loaderModal.className =
      'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75';
    loaderModal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-8 flex flex-col items-center border border-gray-700">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
        <p id="loader-text" class="text-gray-200 text-center">${message}</p>
      </div>
    `;
    document.body.appendChild(loaderModal);
  } else {
    const loaderText = loaderModal.querySelector('#loader-text');
    if (loaderText) {
      loaderText.textContent = message;
    }
    loaderModal.classList.remove('hidden');
  }
}

function hideLoader(): void {
  const loaderModal = document.getElementById('loader-modal');
  if (loaderModal) {
    loaderModal.classList.add('hidden');
  }
}

async function exportToPdf(): Promise<void> {
  const html = htmlEditor.value.trim();

  if (!html) {
    const errorTitle =
      t('tools:htmlToPdf.errors.emptyContent') || 'Empty Content';
    const errorMessage =
      t('tools:htmlToPdf.errors.emptyContentMessage') ||
      'Please enter some HTML code before exporting.';
    showErrorModal(errorTitle, errorMessage);
    return;
  }

  showLoader(t('common.generating') || 'Generating PDF...');

  try {
    // Get page dimensions
    const pageDimensions = getPageDimensions();
    const orientation = getOrientation();
    const margin = parseInt(marginInput.value) || 10;

    // Calculate dimensions based on orientation
    let pageWidth = pageDimensions.width;
    let pageHeight = pageDimensions.height;

    if (orientation === 'landscape') {
      [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }

    // Convert points to mm (1 point = 0.352778 mm)
    const pageWidthMm = pageWidth * 0.352778;
    const pageHeightMm = pageHeight * 0.352778;

    // Create a temporary container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: ${pageWidthMm - margin * 2}mm;
      background: white;
      padding: ${margin}mm;
    `;
    document.body.appendChild(tempContainer);

    // Create an iframe for isolated rendering
    const tempIframe = document.createElement('iframe');
    tempIframe.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: ${(pageWidthMm - margin * 2) * 3.78}px;
      border: none;
      background: white;
    `;
    document.body.appendChild(tempIframe);

    // Write HTML to iframe
    const iframeDoc =
      tempIframe.contentDocument || tempIframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Could not access iframe document');
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for content to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Set iframe height based on content
    const contentHeight = iframeDoc.body.scrollHeight;
    tempIframe.style.height = `${contentHeight}px`;

    // Wait a bit more for any dynamic content
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Create canvas from iframe content
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: (pageWidthMm - margin * 2) * 3.78,
      windowWidth: (pageWidthMm - margin * 2) * 3.78,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: [pageWidthMm, pageHeightMm],
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = pageWidthMm - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Handle multi-page PDFs
    const pageContentHeight = pageHeightMm - margin * 2;
    let remainingHeight = imgHeight;
    let position = 0;
    let pageNum = 0;

    while (remainingHeight > 0) {
      if (pageNum > 0) {
        pdf.addPage();
      }

      // Calculate source coordinates for this page
      const sourceY = (position / imgHeight) * canvas.height;
      const sourceHeight = Math.min(
        (pageContentHeight / imgHeight) * canvas.height,
        canvas.height - sourceY
      );

      // Create a temporary canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;

        pdf.addImage(
          pageImgData,
          'JPEG',
          margin,
          margin,
          imgWidth,
          pageImgHeight
        );
      }

      position += pageContentHeight;
      remainingHeight -= pageContentHeight;
      pageNum++;
    }

    // Clean up
    tempContainer.remove();
    tempIframe.remove();

    // Download PDF
    const pdfBlob = pdf.output('blob');
    downloadFile(pdfBlob, 'document.pdf');

    hideLoader();
  } catch (error) {
    hideLoader();
    console.error('Error generating PDF:', error);
    const exportFailedTitle =
      t('tools:htmlToPdf.errors.exportFailed') || 'Export Failed';
    showErrorModal(
      exportFailedTitle,
      `An error occurred while generating the PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Initialize the page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}
