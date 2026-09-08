#!/usr/bin/env node

/**
 * Zhakyz PDF Assembler Engine v2.0
 * Professional PDF generation, templating, diagram rendering (Mermaid),
 * and merging for Zhakyz & Asociados and Administración Empresarial.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Module path resolution for local and global npm modules
const globalNodeModules = path.join(os.homedir(), '.npm-global', 'lib', 'node_modules');
const openclawNodeModules = path.join(globalNodeModules, 'openclaw', 'node_modules');
[globalNodeModules, openclawNodeModules].forEach(p => {
  if (fs.existsSync(p) && !module.paths.includes(p)) {
    module.paths.push(p);
  }
});

let marked;
try {
  const markedPkg = require('marked');
  marked = markedPkg.marked || markedPkg;
} catch (e) {
  console.error('Error: "marked" is required. Run: npm install marked');
  process.exit(1);
}

let PDFDocument;
try {
  const pdfLib = require('pdf-lib');
  PDFDocument = pdfLib.PDFDocument;
} catch (e) {
  console.error('Error: "pdf-lib" is required. Run: npm install pdf-lib');
  process.exit(1);
}

let chromium;
try {
  const pw = require('playwright');
  chromium = pw.chromium;
} catch (e) {
  console.error('Error: "playwright" is required. Run: npm install -g playwright');
  process.exit(1);
}

// Core directories
const SCRIPT_DIR = __dirname;
const SKILL_ROOT = path.resolve(SCRIPT_DIR, '..');
const RESOURCES_DIR = path.join(SKILL_ROOT, 'resources');
const TEMPLATES_DIR = path.join(RESOURCES_DIR, 'templates');

function findContextFile(customPath) {
  const fileNames = ['STYLEGUIDE.md', 'styleguide.md', 'context.md', 'CONTEXT.md', 'BRANDBOOK.md'];
  const candidates = [customPath];

  fileNames.forEach(fn => {
    candidates.push(path.resolve(process.cwd(), fn));
    candidates.push(path.resolve(process.cwd(), 'zhakyz-pdf-template', fn));
    candidates.push(path.resolve(SKILL_ROOT, '..', '..', fn));
    candidates.push(path.resolve(SKILL_ROOT, '..', '..', '..', fn));
    candidates.push(path.resolve(SKILL_ROOT, fn));
  });

  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

function parseContext(contextPath) {
  const defaults = {
    organization: 'Zhakyz & Asociados',
    contact: 'zhakyzasociados@gmail.com',
    area: 'Administración Empresarial',
    slogan: 'Disciplina para decidir, precisión para transformar',
    logo: './zhakyz-logo.jpg'
  };

  const resolvedPath = findContextFile(contextPath);
  if (!resolvedPath || !fs.existsSync(resolvedPath)) return defaults;

  const content = fs.readFileSync(resolvedPath, 'utf8');
  const contextDir = path.dirname(resolvedPath);

  const contactMatch = content.match(/contacto[:\s]+`?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})`?/i);
  if (contactMatch) defaults.contact = contactMatch[1].trim();

  const logoMatch = content.match(/logo(?:tipo)?[:\s]+`?([^\s`\n]+)`?/i);
  if (logoMatch) {
    const rawLogo = logoMatch[1].trim();
    const resolvedLogo = path.isAbsolute(rawLogo) ? rawLogo : path.resolve(contextDir, rawLogo);
    if (fs.existsSync(resolvedLogo)) {
      defaults.logo = resolvedLogo;
    }
  }

  const orgLine = content.split('\n').find(l => /-\s+\*\*(?:Organización|Marca)[^:]*:\*\*/i.test(l));
  if (orgLine) {
    const cleanOrg = orgLine.replace(/^[-\s*]+(?:Organización|Marca)[^:]*:\s*\**\s*/i, '').replace(/[*_`]/g, '').trim();
    if (cleanOrg) defaults.organization = cleanOrg;
  }

  const areaLine = content.split('\n').find(l => /-\s+\*\*(?:Área|Especialidad|Cátedra)[^:]*:\*\*/i.test(l));
  if (areaLine) {
    const cleanArea = areaLine.replace(/^[-\s*]+(?:Área|Especialidad|Cátedra)[^:]*:\s*\**\s*/i, '').replace(/[*_`]/g, '').trim();
    if (cleanArea) defaults.area = cleanArea;
  }

  const sloganLine = content.split('\n').find(l => /-\s+\*\*(?:Lema|Slogan|Eslogan)[^:]*:\*\*/i.test(l));
  if (sloganLine) {
    const cleanSlogan = sloganLine.replace(/^[-\s*]+(?:Lema|Slogan|Eslogan)[^:]*:\s*\**\s*/i, '').replace(/[*_`]/g, '').trim();
    if (cleanSlogan) defaults.slogan = cleanSlogan;
  }

  return defaults;
}

function getLogoBase64(logoPath) {
  const candidates = [
    logoPath,
    path.resolve(process.cwd(), 'zhakyz-logo.jpg'),
    path.resolve(process.cwd(), 'zhakyz-pdf-template', 'zhakyz-logo.jpg'),
    path.resolve(SKILL_ROOT, '..', '..', 'zhakyz-logo.jpg'),
    path.resolve(SKILL_ROOT, '..', '..', '..', 'zhakyz-logo.jpg')
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) {
      const ext = path.extname(c).toLowerCase().replace('.', '') || 'jpeg';
      const base64 = fs.readFileSync(c).toString('base64');
      return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
    }
  }
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAAElFTkSuQmCC';
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, content: markdown };
  }

  const rawYaml = match[1];
  const content = match[2];
  const metadata = {};

  rawYaml.split('\n').forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim().toLowerCase();
      let val = parts.slice(1).join(':').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val.toLowerCase() === 'true') val = true;
      else if (val.toLowerCase() === 'false') val = false;
      metadata[key] = val;
    }
  });

  return { metadata, content };
}

function transformCallouts(html) {
  const regex = /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*?)<\/blockquote>/gi;
  return html.replace(regex, (match, type, content) => {
    const t = type.toUpperCase();
    let calloutClass = 'callout-info';
    let title = 'Nota Informativa';
    if (t === 'TIP') {
      calloutClass = 'callout-success';
      title = 'Recomendación / Sugerencia';
    } else if (t === 'IMPORTANT' || t === 'WARNING') {
      calloutClass = 'callout-warning';
      title = 'Importante / Advertencia';
    } else if (t === 'CAUTION') {
      calloutClass = 'callout-danger';
      title = 'Precaución Crítica';
    }
    return `
      <div class="callout ${calloutClass}">
        <div class="callout-title">${title}</div>
        <p>${content}
      </div>
    `;
  });
}

function processMermaidBlocks(html) {
  let hasMermaid = false;
  const mermaidRegex = /<pre><code class="(?:language-)?mermaid">([\s\S]*?)<\/code><\/pre>/gi;
  const transformed = html.replace(mermaidRegex, (match, code) => {
    hasMermaid = true;
    const decoded = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');
    return `
      <div class="mermaid-container">
        <div class="mermaid">
${decoded}
        </div>
      </div>
    `;
  });
  return { html: transformed, hasMermaid };
}

function generateTableOfContents(html) {
  const headings = [];
  const headingRegex = /<h([1-2])(?: id="([^"]*)")?>([^<]+)<\/h[1-2]>/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[3].trim();
    headings.push({ level, text });
  }

  if (headings.length === 0) return '';

  let tocHtml = `
    <div class="toc-container">
      <div class="toc-title">Índice de Contenidos</div>
      <ul class="toc-list">
  `;

  headings.forEach(h => {
    const levelClass = h.level === 2 ? 'toc-item level-2' : 'toc-item';
    tocHtml += `
      <li class="${levelClass}">
        <span class="toc-text">${h.text}</span>
        <span class="toc-dots"></span>
      </li>
    `;
  });

  tocHtml += `
      </ul>
    </div>
    <div class="page-break"></div>
  `;

  return tocHtml;
}

function getCurrentFormattedDate() {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

async function renderCoverPdf(page, options, stylesCss, logoDataUri) {
  const coverTemplatePath = path.join(RESOURCES_DIR, 'cover-template.html');
  let coverHtml = fs.readFileSync(coverTemplatePath, 'utf8');

  coverHtml = coverHtml
    .replace(/{{STYLES_CSS}}/g, stylesCss)
    .replace(/{{ORGANIZATION}}/g, options.organization)
    .replace(/{{SLOGAN}}/g, options.slogan)
    .replace(/{{TITLE}}/g, options.title)
    .replace(/{{SUBTITLE}}/g, options.subtitle)
    .replace(/{{AUTHOR}}/g, options.author)
    .replace(/{{AREA}}/g, options.area)
    .replace(/{{DATE}}/g, options.date)
    .replace(/{{VERSION}}/g, options.version)
    .replace(/{{LOGO_SRC}}/g, logoDataUri)
    .replace(/{{CONTACT_EMAIL}}/g, options.contact)
    .replace(/{{CONFIDENTIAL_TEXT}}/g, options.confidential);

  await page.setContent(coverHtml, { waitUntil: 'load' });
  return await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
}

async function renderBodyPdf(page, bodyHtml, options, stylesCss, hasMermaid, logoDataUri) {
  const bodyTemplatePath = path.join(RESOURCES_DIR, 'body-template.html');
  let fullBodyHtml = fs.readFileSync(bodyTemplatePath, 'utf8');

  fullBodyHtml = fullBodyHtml
    .replace(/{{STYLES_CSS}}/g, stylesCss)
    .replace(/{{TITLE}}/g, options.title)
    .replace(/{{BODY_HTML}}/g, bodyHtml);

  await page.setContent(fullBodyHtml, { waitUntil: 'load' });

  if (hasMermaid) {
    const localMermaid = path.join(RESOURCES_DIR, 'mermaid.min.js');
    if (fs.existsSync(localMermaid)) {
      await page.addScriptTag({ path: localMermaid });
    } else {
      await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js' }).catch(() => {});
    }

    await page.evaluate(async () => {
      if (window.mermaid) {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          fontFamily: 'Inter, sans-serif'
        });
        await mermaid.run();
      }
    });

    try {
      await page.waitForSelector('.mermaid svg', { timeout: 4000 });
    } catch (e) {
      // Continuar si no se detectó svg o terminó renderizado
    }
  }

  const headerTemplate = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; font-size: 7.5pt; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 20mm; color: #64748B; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; box-sizing: border-box;">
      <span style="font-weight: 800; letter-spacing: 0.8px; color: #0F172A; text-transform: uppercase; flex: 1; text-align: left;">${options.organization}</span>
      <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: center; padding: 0 10px;">
        <img src="${logoDataUri}" style="height: 18px; width: 18px; border-radius: 50%; object-fit: cover; display: block; border: 1px solid #E2E8F0;" />
      </div>
      <span style="font-weight: 600; color: #475569; flex: 1; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${options.area}</span>
    </div>
  `;

  const footerTemplate = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; font-size: 7.5pt; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 20mm; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 4px; box-sizing: border-box;">
      <span>${options.contact}</span>
      <span style="font-weight: 600; color: #0F172A;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>
  `;

  return await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate,
    margin: {
      top: '24mm',
      bottom: '22mm',
      left: '20mm',
      right: '20mm'
    }
  });
}

async function buildMarkdownToPdf(inputFile, cliOptions) {
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Archivo de entrada no encontrado: ${inputFile}`);
    process.exit(1);
  }

  const rawMarkdown = fs.readFileSync(inputFile, 'utf8');
  const { metadata, content } = parseFrontmatter(rawMarkdown);

  const contextData = parseContext(cliOptions.context);
  const logoDataUri = getLogoBase64(cliOptions.logo || contextData.logo);

  const options = {
    title: cliOptions.title || metadata.title || 'Informe Ejecutivo de Administración',
    subtitle: cliOptions.subtitle || metadata.subtitle || 'Análisis Organizacional y Gestión Estratégica',
    author: cliOptions.author || metadata.author || contextData.organization,
    area: cliOptions.area || metadata.area || metadata.category || contextData.area,
    date: cliOptions.date || metadata.date || getCurrentFormattedDate(),
    version: cliOptions.version || metadata.version || 'v1.0 Final',
    contact: cliOptions.contact || metadata.contact || contextData.contact,
    organization: contextData.organization,
    slogan: cliOptions.slogan || metadata.slogan || contextData.slogan || 'Disciplina para decidir, precisión para transformar',
    confidential: metadata.confidential !== undefined
      ? (typeof metadata.confidential === 'string' ? metadata.confidential : 'Documento Oficial - Distribución Controlada')
      : 'Documento Oficial - Distribución Controlada',
    hasCover: cliOptions.hasCover !== undefined ? cliOptions.hasCover : (metadata.has_cover !== false),
    toc: cliOptions.toc !== undefined ? cliOptions.toc : (metadata.toc === true)
  };

  const outputPath = cliOptions.output || path.resolve(
    path.dirname(inputFile),
    `${path.basename(inputFile, path.extname(inputFile))}.pdf`
  );

  console.log(`[Zhakyz PDF] Compilando: ${inputFile}`);
  console.log(`[Zhakyz PDF] Título: "${options.title}"`);
  console.log(`[Zhakyz PDF] Portada institucional: ${options.hasCover ? 'Activada' : 'Desactivada'}`);
  console.log(`[Zhakyz PDF] Índice automático (TOC): ${options.toc ? 'Activado' : 'Desactivado'}`);

  // Convert Markdown to HTML
  let parsedHtml = marked(content);
  parsedHtml = transformCallouts(parsedHtml);

  // Process Mermaid diagrams
  const { html: htmlWithMermaid, hasMermaid } = processMermaidBlocks(parsedHtml);
  parsedHtml = htmlWithMermaid;
  if (hasMermaid) {
    console.log('[Zhakyz PDF] Diagramas Mermaid detectados. Renderizando vectores...');
  }

  // Generate TOC if requested
  if (options.toc) {
    const tocHtml = generateTableOfContents(parsedHtml);
    parsedHtml = tocHtml + parsedHtml;
  }

  // Load CSS stylesheet
  const stylesCss = fs.readFileSync(path.join(RESOURCES_DIR, 'styles.css'), 'utf8');

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  let finalPdfBytes;

  if (options.hasCover) {
    console.log('[Zhakyz PDF] Generando portada corporativa...');
    const coverBytes = await renderCoverPdf(page, options, stylesCss, logoDataUri);

    console.log('[Zhakyz PDF] Generando páginas de contenido...');
    const bodyBytes = await renderBodyPdf(page, parsedHtml, options, stylesCss, hasMermaid, logoDataUri);

    const mergedDoc = await PDFDocument.create();
    const coverDoc = await PDFDocument.load(coverBytes);
    const bodyDoc = await PDFDocument.load(bodyBytes);

    const [coverPage] = await mergedDoc.copyPages(coverDoc, [0]);
    mergedDoc.addPage(coverPage);

    const bodyPages = await mergedDoc.copyPages(bodyDoc, bodyDoc.getPageIndices());
    bodyPages.forEach(p => mergedDoc.addPage(p));

    finalPdfBytes = await mergedDoc.save();
  } else {
    console.log('[Zhakyz PDF] Generando documento continuo...');
    finalPdfBytes = await renderBodyPdf(page, parsedHtml, options, stylesCss, hasMermaid, logoDataUri);
  }

  await browser.close();

  fs.writeFileSync(outputPath, finalPdfBytes);
  const stats = fs.statSync(outputPath);
  console.log(`[Zhakyz PDF] Ensamblado exitoso: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

async function mergePdfs(pdfPaths, cliOptions) {
  if (pdfPaths.length === 0) {
    console.error('Error: Debe indicar al menos un archivo PDF para fusionar.');
    process.exit(1);
  }

  const outputPath = cliOptions.output || 'dossier-ensamblado.pdf';
  console.log(`[Zhakyz PDF] Ensamblando ${pdfPaths.length} documentos PDF en: ${outputPath}`);

  const mergedDoc = await PDFDocument.create();

  if (cliOptions.cover) {
    const contextData = parseContext(cliOptions.context);
    const logoDataUri = getLogoBase64(cliOptions.logo || contextData.logo);
    const stylesCss = fs.readFileSync(path.join(RESOURCES_DIR, 'styles.css'), 'utf8');

    const options = {
      title: cliOptions.title || 'Dossier Ejecutivo Unificado',
      subtitle: cliOptions.subtitle || `Compilado de ${pdfPaths.length} entregas documentales`,
      author: cliOptions.author || contextData.organization,
      area: cliOptions.area || contextData.area,
      date: cliOptions.date || getCurrentFormattedDate(),
      version: cliOptions.version || 'v1.0 Consolidado',
      contact: cliOptions.contact || contextData.contact,
      organization: contextData.organization,
      slogan: cliOptions.slogan || contextData.slogan || 'Disciplina para decidir, precisión para transformar',
      confidential: 'Documento Consolidado - Distribución Autorizada'
    };

    const browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const coverBytes = await renderCoverPdf(page, options, stylesCss, logoDataUri);
    await browser.close();

    const coverDoc = await PDFDocument.load(coverBytes);
    const [coverPage] = await mergedDoc.copyPages(coverDoc, [0]);
    mergedDoc.addPage(coverPage);
  }

  for (const p of pdfPaths) {
    if (!fs.existsSync(p)) {
      console.error(`Advertencia: Archivo no encontrado, se omite: ${p}`);
      continue;
    }
    const pdfBytes = fs.readFileSync(p);
    const doc = await PDFDocument.load(pdfBytes);
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    pages.forEach(page => mergedDoc.addPage(page));
    console.log(`  + Añadido: ${p} (${pages.length} páginas)`);
  }

  const finalPdfBytes = await mergedDoc.save();
  fs.writeFileSync(outputPath, finalPdfBytes);
  const stats = fs.statSync(outputPath);
  console.log(`[Zhakyz PDF] Dossier generado exitosamente: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

function initNewDocument(targetPath, templateName) {
  const chosen = templateName || 'informe';
  const mapping = {
    'informe': 'informe-ejecutivo.md',
    'propuesta': 'propuesta-comercial.md',
    'academico': 'trabajo-academico.md',
    'monografia': 'trabajo-academico.md',
    'minuta': 'minuta-reunion.md'
  };

  const fileToCopy = mapping[chosen.toLowerCase()] || 'informe-ejecutivo.md';
  const srcFile = path.join(TEMPLATES_DIR, fileToCopy);

  if (!fs.existsSync(srcFile)) {
    console.error(`Error: Plantilla no encontrada: ${fileToCopy}`);
    process.exit(1);
  }

  if (fs.existsSync(targetPath)) {
    console.error(`Error: El archivo destino ya existe: ${targetPath}`);
    process.exit(1);
  }

  fs.copyFileSync(srcFile, targetPath);
  console.log(`[Zhakyz PDF] Documento inicializado exitosamente: ${targetPath}`);
  console.log(`[Zhakyz PDF] Basado en plantilla: ${fileToCopy}`);
}

function listAvailableTemplates() {
  console.log(`
Plantillas Disponibles de Zhakyz & Asociados:
----------------------------------------------------------------------
1. informe    - Informe Ejecutivo (Auditorías, diagnósticos, KPIs, flujos)
2. propuesta  - Propuesta Comercial (Alcance, cronograma Gantt, presupuesto)
3. academico  - Monografía Universitaria (Abstract, citas, marco teórico)
4. minuta     - Minuta de Directorio (Sin portada, formato memorándum)

Uso:
  ./zhakyz-pdf init nuevo-documento.md --template informe
  `);
}

function parseCliArgs(args) {
  const result = { _: [], options: {} };
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (key.startsWith('no-')) {
        const actualKey = key.slice(3);
        result.options[actualKey] = false;
        i++;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        result.options[key] = args[i + 1];
        i += 2;
      } else {
        result.options[key] = true;
        i++;
      }
    } else if (arg.startsWith('-')) {
      const flag = arg.slice(1);
      if (flag === 'o' && i + 1 < args.length) {
        result.options.output = args[i + 1];
        i += 2;
      } else if (flag === 't' && i + 1 < args.length) {
        result.options.template = args[i + 1];
        i += 2;
      } else {
        result.options[flag] = true;
        i++;
      }
    } else {
      result._.push(arg);
      i++;
    }
  }
  return result;
}

async function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.length === 0) {
    console.log(`
Zhakyz PDF Assembler v2.0
Uso:
  ./zhakyz-pdf build <archivo.md> [opciones]
  ./zhakyz-pdf merge <doc1.pdf> <doc2.pdf> ... -o <salida.pdf> [opciones]
  ./zhakyz-pdf init <archivo.md> [--template informe|propuesta|academico|minuta]
  ./zhakyz-pdf templates

Comandos Principales:
  build, compile          Compila un archivo Markdown a PDF con estilo Zhakyz.
  merge, join             Fusiona múltiples PDFs en un dossier unificado.
  init                    Crea un nuevo documento a partir de una plantilla oficial.
  templates               Lista las plantillas disponibles.

Opciones de Build:
  -o, --output <ruta>     Ruta de salida del PDF generado
  --title <titulo>        Sobrescribe el título de portada y encabezado
  --subtitle <subtitulo>  Sobrescribe el subtítulo de portada
  --author <autor>        Sobrescribe el autor o consultor
  --area <area>           Área académica o corporativa
  --date <fecha>          Fecha de emisión
  --toc                   Fuerza la generación del índice de contenidos
  --no-cover              Genera el documento sin portada
  --context <ruta>        Ruta alternativa a STYLEGUIDE.md
  --logo <ruta>           Ruta alternativa a zhakyz-logo.jpg
    `);
    process.exit(0);
  }

  const command = rawArgs[0];
  const parsed = parseCliArgs(rawArgs.slice(1));

  if (command === 'build' || command === 'compile') {
    const inputFile = parsed._[0];
    if (!inputFile) {
      console.error('Error: Debe indicar el archivo Markdown de entrada.');
      process.exit(1);
    }
    await buildMarkdownToPdf(inputFile, parsed.options);
  } else if (command === 'merge' || command === 'join') {
    const pdfFiles = parsed._;
    await mergePdfs(pdfFiles, parsed.options);
  } else if (command === 'init') {
    const targetFile = parsed._[0];
    if (!targetFile) {
      console.error('Error: Debe indicar el nombre del archivo Markdown a crear.');
      process.exit(1);
    }
    initNewDocument(targetFile, parsed.options.template);
  } else if (command === 'templates' || command === 'list-templates') {
    listAvailableTemplates();
  } else {
    if (command.endsWith('.md')) {
      await buildMarkdownToPdf(command, parsed.options);
    } else {
      console.error(`Comando desconocido: ${command}. Use "./zhakyz-pdf" para ver la ayuda.`);
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('[Zhakyz PDF] Error fatal:', err);
  process.exit(1);
});
