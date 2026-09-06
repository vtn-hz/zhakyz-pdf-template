# Zhakyz & Asociados - PDF Assembler & Template Engine

Official document templating and automated PDF assembly system tailored for **Zhakyz & Asociados** and the **Business Administration (Administración Empresarial)** academic and consulting practice.

> **Motto:** *"Disciplina para decidir, precisión para transformar"*

---

## Overview

This repository provides an automated, production-ready CLI engine and Antigravity workspace skill designed to assemble high-fidelity, publication-quality A4 PDF documents from Markdown and HTML sources.

It enforces a unified corporate identity:
- **Official Brand Assets:** Embedded vector/high-res samurai sumi-e insignia (`zhakyz-logo.jpg`).
- **Brand Guide:** Full typography, color palettes, and margin standards declared in [`STYLEGUIDE.md`](./STYLEGUIDE.md).
- **Tri-Part Running Headers:** Company name on the left, centered logo icon, and document subject/department on the right.
- **Dynamic Pagination:** Professional running footers with official contact (`zhakyzasociados@gmail.com`) and page counters (*"Página X de Y"*).
- **Process & Workflow Diagrams:** Native offline rendering of **Mermaid.js** flowcharts, Gantt schedules, and organizational hierarchies.
- **Automated Table of Contents (TOC):** Generated with dot leaders and hierarchical sectioning.
- **Executive Elements:** Styled metric cards (`.kpi-grid`), callout boxes, zebra-striped tables, and formal signature blocks.

---

## Document Archetypes

The template engine includes 4 pre-built document archetypes:

| Archetype | Identifier | Description | Key Features |
| :--- | :--- | :--- | :--- |
| **Executive Report** | `informe` | Operational audits and diagnostics | Formal cover, TOC, KPI cards, risk matrix, signatures |
| **Commercial Proposal** | `propuesta` | Service quotes and scope of work | Intro letter, Gantt schedule, fee breakdown, acceptance sign-off |
| **Academic Paper** | `academico` | University monographs and case studies | Abstract, keywords, theoretical framework, formal citations |
| **Meeting Minutes** | `minuta` | Board meeting records and internal memos | Continuous memo header, quorum, action items, next call |

---

## Quick Start

### 1. Requirements

- **Node.js** >= 18.0.0
- **Playwright** with Chromium:
  ```bash
  npm install -g playwright
  npx playwright install chromium
  ```
- Install local project dependencies:
  ```bash
  npm install
  ```

---

### 2. CLI Commands (`./zhakyz-pdf`)

An executable CLI wrapper is provided at the root:

```bash
# List available official templates
./zhakyz-pdf templates

# Scaffold a new document from a template
./zhakyz-pdf init nuevo-informe.md --template informe
./zhakyz-pdf init propuesta-comercial.md --template propuesta
./zhakyz-pdf init monografia.md --template academico
./zhakyz-pdf init acta-reunion.md --template minuta

# Compile a Markdown file to PDF
./zhakyz-pdf build nuevo-informe.md -o entrega-final.pdf

# Compile with options
./zhakyz-pdf build documento.md -o informe.pdf --title "Auditoría Financiera" --toc

# Merge multiple PDF deliverables into a consolidated dossier with cover
./zhakyz-pdf merge entrega1.pdf entrega2.pdf anexo.pdf \
  -o dossier-completo.pdf \
  --cover \
  --title "Dossier Integral de Administración"
```

---

## Project Structure

```text
zhakyz-pdf-template/
├── zhakyz-pdf                        # Root CLI executable
├── README.md                         # Documentation and usage guide
├── STYLEGUIDE.md                     # Brand identity, design system & guidelines
├── zhakyz-logo.jpg                   # Official Zhakyz insignia
├── package.json                      # Node.js manifest & dependencies
├── skills/zhakyz-pdf                 # Compatibility symlink for agent discovery
└── .agents/
    ├── skills.json                   # Customization registry for Antigravity
    └── skills/zhakyz-pdf/
        ├── SKILL.md                  # Antigravity skill specification & workflows
        ├── scripts/
        │   ├── assemble.js           # Core PDF assembly engine (Playwright + PDF-Lib + Mermaid)
        │   └── cli.sh                # Script wrapper
        ├── resources/
        │   ├── styles.css            # Executive CSS design system
        │   ├── cover-template.html   # Cover page HTML template
        │   ├── body-template.html    # Inner pages HTML template with running headers/footers
        │   ├── mermaid.min.js        # Offline bundle for Mermaid diagram rendering
        │   └── templates/            # Markdown boilerplates for all archetypes
        ├── examples/
        │   ├── informe-estrategico.md # Comprehensive business report example
        │   ├── informe-estrategico.pdf# Compiled sample PDF output
        │   └── compilar-ejemplo.sh   # Compilation script
        └── references/
            └── guia-estilo.md        # Reference manual for formatting & frontmatter
```

---

## License & Contact

- **Organization:** Zhakyz & Asociados
- **Contact:** [zhakyzasociados@gmail.com](mailto:zhakyzasociados@gmail.com)
- **Field:** Administración Empresarial (Business Administration & Strategic Management)
