# Manual de Marca y Guía de Estilo - Zhakyz & Asociados (STYLEGUIDE.md)

Este archivo define la identidad corporativa, datos de contacto, directrices visuales y parámetros por defecto para el ensamblado y generación de documentos en formato PDF dentro del espacio de trabajo **Administración Empresarial**.

---

## 1. Información General y Contacto

- **Organización / Marca:** Zhakyz & Asociados
- **Área / Especialidad:** Administración Empresarial, Consultoría Estratégica, Auditoría Operativa y Finanzas
- **Correo Electrónico de Contacto:** `zhakyzasociados@gmail.com`
- **Isotipo / Logotipo Oficial:** `./zhakyz-logo.jpg` (Logotipo caligráfico sumi-e samurái con tipografía ZHAKYZ)
- **Lema / Slogan:** *Disciplina para decidir, precisión para transformar*
- **Idioma predeterminado:** Español (`es-ES` / `es-AR`)

---

## 2. Sistema de Diseño e Identidad Visual (Design System)

Los documentos generados deben transmitir profesionalismo, pulcritud, rigor académico y ejecutividad moderna.

### 2.1 Paleta de Colores Corporativa
- **Color Principal (Deep Ink / Tinta Oscura):** `#0F172A` (Slate 900) - Títulos, barras de énfasis y logotipo.
- **Color Secundario (Charcoal / Grafito):** `#1E293B` (Slate 800) - Subtítulos y cabeceras.
- **Texto Principal (Body):** `#334155` (Slate 700) - Texto continuo con alto contraste y legibilidad.
- **Color de Acento (Acento Ejecutivo):** `#2563EB` (Royal Blue) o `#0284C7` (Sky 600) para enlaces, tags y destacados puntuales.
- **Fondos de Bloques y Tarjetas:** `#F8FAFC` (Slate 50) con bordes en `#E2E8F0` (Slate 200).
- **Tablas:** Encabezados en `#0F172A` con texto en blanco (`#FFFFFF`), filas impares con fondo blanco y pares en `#F8FAFC`.

### 2.2 Tipografía
- **Títulos y Portadas:** Sistema sin serifa moderno (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`).
- **Cuerpo de Documento:** `10.5pt` a `11pt`, con interlineado (`line-height: 1.6`) y espaciado de párrafos equilibrado.
- **Código y Datos Tabulares:** Tipografía monoespaciada (`JetBrains Mono`, `Fira Code`, `Consolas`, `monospace`).

### 2.3 Formato y Geometría de Página
- **Tamaño de Página:** `A4` (210 mm x 297 mm).
- **Orientación:** Vertical (Portrait) por defecto.
- **Márgenes de Impresión:**
  - Superior: `22mm`
  - Inferior: `22mm`
  - Izquierdo: `20mm`
  - Derecho: `20mm`

---

## 3. Estructura Estándar de Ensamblado de Documentos

Todo documento formal ensamblado bajo la marca Zhakyz debe contener:

1. **Portada Institucional (Cover Page):**
   - **Cabecera integrada tripartita:** Nombre de la empresa a la izquierda (`ZHAKYZ & ASOCIADOS`), logotipo circular en el centro, y temática / cátedra a la derecha (`ADMINISTRACIÓN EMPRESARIAL`), con línea divisoria inferior.
   - **Cuerpo de portada:** Título principal del informe (H1, tipografía sobria e imponente), subtítulo descriptivo o resumen de alcance, barra de acento.
   - **Bloque de metadatos:** Área / Cátedra, Autor(es) / Responsable, Fecha de emisión y Versión / Estado.
   - **Pie de portada:** Aviso de confidencialidad/propiedad y correo `zhakyzasociados@gmail.com`.

2. **Cuerpo del Documento (Body Content):**
   - **Encabezado superior (*Running Header*):** Marca "ZHAKYZ & ASOCIADOS" a la izquierda, isotipo oficial circular en el centro, y temática a la derecha, delimitados por línea divisoria fina (`#E2E8F0`).
   - **Pie de página inferior (*Running Footer*):** Correo de contacto oficial a la izquierda y numeración formal de páginas a la derecha (*"Página X de Y"*).
   - **Elementos enriquecidos:** Tablas estilizadas, bloques de alerta/destacados (*Callout boxes*), tarjetas de KPIs, diagramas Mermaid y listas ejecutivas.

3. **Contraportada o Bloque de Cierre:**
   - Resumen ejecutivo final o conclusiones.
   - Bloque de firmas / validación técnica.
   - Datos de contacto y cierre formal corporativo.

---

## 4. Ensamblado de PDFs Múltiples (Merging)

Cuando se requiera unificar múltiples entregas, capítulos o anexos:
- Se genera una portada institucional unificada.
- Se compilan los capítulos en el orden establecido.
- Se preserva la fidelidad gráfica de los documentos originales integrándolos en un único dossier corporativo.

---

## 5. Arquetipos de Documentos Soportados

La suite de ensamblado cuenta con 4 arquetipos oficiales:

1. **`informe` (Informe Ejecutivo y Diagnóstico):** Portada formal, índice automatizado (TOC), métricas KPI, matrices de riesgo, organigramas o flujogramas de procesos, y bloque de firmas.
2. **`propuesta` (Propuesta Comercial y Presupuesto):** Carta de presentación, cronograma Gantt, tabla de honorarios desglosada, cuadro resumen económico y firmas de aceptación.
3. **`academico` (Monografía y Trabajo Práctico):** Formato riguroso con *Abstract*, palabras clave, marco teórico, tablas comparativas y sección de referencias bibliográficas.
4. **`minuta` (Acta de Reunión o Memorándum):** Formato continuo sin portada, encabezado ejecutivo formal (*Para, De, Fecha, Asunto*), síntesis de acuerdos y matriz de compromisos (*Action items*).

---

## 6. Herramientas y Diagramación Avanzada

- **Motor CLI:** Ejecutable `./zhakyz-pdf` en la raíz del espacio de trabajo.
- **Diagramas de Procesos:** Soporte nativo offline para **Mermaid.js** (diagramas de flujo `flowchart`, cronogramas `gantt`, gráficos de secuencia y mapas conceptuales).
- **Índice Automatizado (TOC):** Activado mediante `toc: true` en el frontmatter o con la opción `--toc`.