import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  PageBreak,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import { type AmbientePdfData } from "./generateAmbientePdf";

const BLUE = "29417A";
const LIGHT_BLUE = "D5E8F0";
const RED_BG = "FFF0F0";
const RED_TEXT = "B41E1E";

function loadImageAsArrayBuffer(src: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) blob.arrayBuffer().then(resolve).catch(reject);
        else reject(new Error("Canvas toBlob failed"));
      }, "image/png");
    };
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateAmbienteDocx(data: AmbientePdfData) {
  const rev = String(data.revision).padStart(2, "0");
  const dateStr = new Date().toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Try loading logo
  let logoBuffer: ArrayBuffer | null = null;
  try {
    const { default: logoSrc } = await import("@/assets/agis-logo.png");
    logoBuffer = await loadImageAsArrayBuffer(logoSrc);
  } catch {
    /* ignore */
  }

  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

  // ---- Info rows ----
  const infoRows: [string, string][] = [];
  if (data.commessa?.commessa_consortile) infoRows.push(["Commessa N.", data.commessa.commessa_consortile]);
  if (data.commessa?.oggetto_lavori) infoRows.push(["Oggetto dei lavori", data.commessa.oggetto_lavori]);
  if (data.commessa?.committente) infoRows.push(["Committente", data.commessa.committente]);
  if (data.commessa?.cup) infoRows.push(["CUP", data.commessa.cup]);
  if (data.commessa?.cig) infoRows.push(["CIG", data.commessa.cig]);
  if (data.commessa?.impresa_assegnataria) infoRows.push(["Impresa esecutrice", data.commessa.impresa_assegnataria]);

  const infoTable = new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [3000, 6026],
    rows: infoRows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: 3000, type: WidthType.DXA },
              margins: cellMargins,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, bold: true, font: "Arial", size: 20, color: BLUE })],
                }),
              ],
            }),
            new TableCell({
              borders,
              width: { size: 6026, type: WidthType.DXA },
              margins: cellMargins,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: value, font: "Arial", size: 20 })],
                }),
              ],
            }),
          ],
        })
    ),
  });

  // ---- Cover page children ----
  const coverChildren: (Paragraph | Table)[] = [];

  if (logoBuffer) {
    coverChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new ImageRun({
            type: "png",
            data: logoBuffer,
            transformation: { width: 100, height: 75 },
            altText: { title: "Logo", description: "Logo aziendale", name: "logo" },
          }),
        ],
      })
    );
  }

  coverChildren.push(
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "PIANO DI GESTIONE AMBIENTALE", bold: true, font: "Arial", size: 44, color: BLUE }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ text: `Revisione ${rev}`, font: "Arial", size: 24, color: BLUE }),
      ],
    })
  );

  if (infoRows.length > 0) {
    coverChildren.push(infoTable);
  }

  coverChildren.push(
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    new Paragraph({
      children: [new TextRun({ text: `Data: ${dateStr}`, font: "Arial", size: 18, color: "646464" })],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ---- Index page ----
  const indexItems = [
    "1. Aspetti critici e peculiarità ambientali del cantiere",
    "2. Gestione rifiuti di cantiere",
    "3. Criteri Ambientali Minimi (CAM) di progetto",
    "4. Tabella codici CER — Rifiuti da costruzione e demolizione",
  ];

  const indexChildren: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      children: [new TextRun({ text: "INDICE", bold: true, font: "Arial", size: 28, color: BLUE })],
    }),
    ...indexItems.map(
      (item) =>
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: item, font: "Arial", size: 20 })],
        })
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // ---- Content sections ----
  const sections: { title: string; num: string; content: string }[] = [
    { title: "Aspetti critici e peculiarità ambientali del cantiere", num: "1", content: data.analisi.aspetti_critici },
    { title: "Gestione rifiuti di cantiere", num: "2", content: data.analisi.gestione_rifiuti },
    { title: "Criteri Ambientali Minimi (CAM) di progetto", num: "3", content: data.analisi.cam_progetto },
  ];

  const contentChildren: Paragraph[] = [];
  for (const section of sections) {
    contentChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: BLUE, space: 4 } },
        children: [
          new TextRun({ text: `${section.num}. ${section.title}`, bold: true, font: "Arial", size: 26, color: BLUE }),
        ],
      })
    );

    if (!section.content.trim()) {
      contentChildren.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Sezione non compilata.", font: "Arial", size: 18, italics: true, color: "969696" })],
        })
      );
    } else {
      const paragraphs = section.content.split("\n").filter((l) => l.trim());
      for (const p of paragraphs) {
        contentChildren.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: p, font: "Arial", size: 18 })],
          })
        );
      }
    }
  }

  // ---- CER Table ----
  const cerHeader = new TableRow({
    children: ["Codice CER", "Descrizione", "Pericoloso"].map(
      (h, i) =>
        new TableCell({
          borders,
          width: { size: i === 0 ? 1600 : i === 1 ? 6026 : 1400, type: WidthType.DXA },
          margins: cellMargins,
          shading: { fill: BLUE, type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: i === 2 ? AlignmentType.CENTER : AlignmentType.LEFT,
              children: [new TextRun({ text: h, bold: true, font: "Arial", size: 16, color: "FFFFFF" })],
            }),
          ],
        })
    ),
  });

  const hasSelection = data.selectedCerCodes && data.selectedCerCodes.length > 0;

  const cerRows = data.cerTable.map(
    (row) => {
      const isSelected = !hasSelection || data.selectedCerCodes?.includes(row.codice);
      const textColor = !isSelected ? "B4B4B4" : row.pericoloso ? RED_TEXT : "000000";
      const bgFill = !isSelected ? undefined : row.pericoloso ? RED_BG : "F0F7FF";
      const shading = bgFill ? { fill: bgFill, type: ShadingType.CLEAR } : undefined;

      return new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 1600, type: WidthType.DXA },
            margins: cellMargins,
            shading,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: row.codice,
                    bold: isSelected,
                    font: "Arial",
                    size: 16,
                    color: textColor,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders,
            width: { size: 6026, type: WidthType.DXA },
            margins: cellMargins,
            shading,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: row.descrizione,
                    font: "Arial",
                    size: 16,
                    color: textColor,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders,
            width: { size: 1400, type: WidthType.DXA },
            margins: cellMargins,
            shading,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: row.pericoloso ? "Sì" : "No",
                    font: "Arial",
                    size: 16,
                    color: textColor,
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    }
  );

  const cerTableSection: (Paragraph | Table)[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: BLUE, space: 4 } },
      children: [
        new TextRun({
          text: "4. Tabella codici CER — Rifiuti da costruzione e demolizione",
          bold: true,
          font: "Arial",
          size: 26,
          color: BLUE,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: hasSelection
            ? "Codici CER pertinenti alle lavorazioni di cantiere (evidenziati). I codici non pertinenti sono riportati in grigio."
            : "Elenco dei principali codici CER potenzialmente producibili dalle lavorazioni di cantiere.",
          font: "Arial",
          size: 18,
        }),
      ],
    }),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [1600, 6026, 1400],
      rows: [cerHeader, ...cerRows],
    }),
  ];

  // ---- Build document ----
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Arial", size: 20 } },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 28, bold: true, font: "Arial" },
          paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 26, bold: true, font: "Arial" },
          paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } },
                children: [
                  new TextRun({
                    text: `Piano di Gestione Ambientale — Rev. ${rev}`,
                    font: "Arial",
                    size: 14,
                    color: "828282",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Pag. ", font: "Arial", size: 14, color: "828282" }),
                  new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 14, color: "828282" }),
                  new TextRun({ text: " / ", font: "Arial", size: 14, color: "828282" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 14, color: "828282" }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...coverChildren,
          ...indexChildren,
          ...contentChildren,
          ...cerTableSection,
        ],
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  const commNum = data.commessa?.commessa_consortile || "commessa";
  saveAs(buffer, `PGA_${commNum}_Rev${rev}.docx`);
}
