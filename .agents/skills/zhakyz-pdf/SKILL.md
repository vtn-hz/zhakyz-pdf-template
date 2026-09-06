---
name: zhakyz-pdf
description: >-
  Ensambla, genera y fusiona documentos en formato PDF con la identidad corporativa y plantilla oficial de Zhakyz & Asociados para la carrera de Administración Empresarial. Usar esta skill cuando el usuario solicite crear o maquetar un PDF a partir de archivos Markdown o HTML, armar un dossier o consolidar entregas académicas y empresariales incorporando el logo oficial (zhakyz-logo.jpg) y los datos de contacto corporativos (zhakyzasociados@gmail.com).
---

# Zhakyz PDF Assembler v2.0

Esta skill proporciona un motor automatizado, reproducible y con diagramación ejecutiva para compilar, ensamblar y fusionar documentos PDF para **Zhakyz & Asociados** y la carrera de **Administración Empresarial**.

Integra de forma nativa los activos y reglas del espacio de trabajo:
- **Logotipo Oficial:** [`zhakyz-logo.jpg`](../../zhakyz-logo.jpg) incrustado en alta fidelidad (Base64).
- **Parámetros y Contacto:** [`STYLEGUIDE.md`](../../STYLEGUIDE.md) con los lineamientos de marca y correo oficial `zhakyzasociados@gmail.com`.
- **Diagramas de Procesos:** Soporte nativo para diagramas **Mermaid.js** (flujos, cronogramas Gantt, organigramas).
- **Índice Automatizado (TOC):** Generación de tabla de contenidos profesional con puntos directores.

---

## Estructura de la Skill

```text
zhakyz-pdf/
├── SKILL.md                          # Este archivo de instrucciones y especificación
├── scripts/
│   ├── assemble.js                   # Motor principal (Node.js + Playwright + PDF-Lib + Mermaid)
│   └── cli.sh                        # Wrapper bash de ejecución interna
├── resources/
│   ├── styles.css                    # Hoja de estilos ejecutiva (Deep Ink & Charcoal)
│   ├── cover-template.html           # Plantilla HTML de portada institucional con metadatos
│   ├── body-template.html            # Plantilla HTML de páginas interiores con encabezados/pies
│   ├── mermaid.min.js                # Bundle local offline de Mermaid.js
│   └── templates/                    # Plantillas oficiales de documentos
│       ├── informe-ejecutivo.md      # Plantilla de auditoría y diagnóstico
│       ├── propuesta-comercial.md    # Plantilla de cotización y presupuesto
│       ├── trabajo-academico.md      # Plantilla para monografías y trabajos de cátedra
│       └── minuta-reunion.md         # Plantilla de acta/memo de directorio
├── examples/
│   ├── informe-estrategico.md        # Documento de ejemplo completo
│   ├── informe-estrategico.pdf       # PDF compilado de muestra
│   └── compilar-ejemplo.sh           # Script para reproducir el ejemplo
└── references/
    └── guia-estilo.md                # Referencia de sintaxis, callouts, KPIs, tablas y frontmatter
```

---

## Comandos y CLI Principal

En la raíz del proyecto se encuentra el ejecutable directo `./zhakyz-pdf`:

### 1. Inicializar un Documento desde una Plantilla Oficial
```bash
# Ver plantillas disponibles
./zhakyz-pdf templates

# Crear un nuevo informe ejecutivo
./zhakyz-pdf init nuevo-informe.md --template informe

# Crear una propuesta comercial
./zhakyz-pdf init cotizacion.md --template propuesta

# Crear una monografía universitaria
./zhakyz-pdf init trabajo-practico.md --template academico

# Crear una minuta de directorio
./zhakyz-pdf init acta-sesion.md --template minuta
```

---

### 2. Compilar Markdown a PDF

```bash
# Compilar documento Markdown a PDF
./zhakyz-pdf build nuevo-informe.md -o informe-final.pdf
```

#### Opciones de compilación:
- `-o, --output <ruta>`: Ruta de destino del PDF generado.
- `--title "<titulo>"`: Sobrescribe el título de portada y encabezado.
- `--subtitle "<subtitulo>"`: Sobrescribe el subtítulo de portada.
- `--author "<autor>"`: Sobrescribe el autor o consultor.
- `--area "<area>"`: Área académica o corporativa (por defecto: `Administración Empresarial`).
- `--date "<fecha>"`: Fecha visible en portada (por defecto: mes y año en curso).
- `--toc`: Activa el Índice de Contenidos automatizado.
- `--no-cover`: Genera el documento sin portada (modo continuo con encabezado).
- `--context <ruta>`: Ruta alternativa al archivo STYLEGUIDE.md.
- `--logo <ruta>`: Ruta alternativa a zhakyz-logo.jpg.

---

### 3. Fusión y Ensamblado de Múltiples PDFs (Dossier)

Para unificar múltiples entregas, capítulos o anexos en un único dossier corporativo:

```bash
./zhakyz-pdf merge entrega1.pdf entrega2.pdf anexo.pdf \
  -o dossier-completo.pdf \
  --cover \
  --title "Dossier Consolidado de Administración Empresarial" \
  --subtitle "Entrega Integral de Cátedra"
```

El flag `--cover` genera y antepone automáticamente una portada oficial con el logo y contacto de Zhakyz.

---

## Verificación y Control de Calidad

Para verificar la correcta maquetación del documento:
1. Compruebe que el PDF generado tenga un tamaño mayor a 0 KB.
2. Verifique la portada institucional: logotipo Zhakyz centrado, título sobrio en Slate-900, tarjeta de metadatos completa y pie con `zhakyzasociados@gmail.com`.
3. Compruebe las páginas interiores:
   - Cabecera: `ZHAKYZ & ASOCIADOS | <Título del Documento>`
   - Pie: `zhakyzasociados@gmail.com` a la izquierda y `Página X de Y` a la derecha.
4. Si el documento incluye diagramas Mermaid (`flowchart`, `gantt`), confirme que se hayan renderizado como gráficos vectoriales nítidos.
5. Para inspeccionar visualmente en entornos sin visor gráfico:
   ```bash
   pdftoppm -png -r 150 archivo.pdf /tmp/preview
   ```
