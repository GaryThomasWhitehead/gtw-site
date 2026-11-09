import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type TuggerHistoryPdfRow = {
  date: string;
  technician: string;
  location: string;
  tracking: string;
  tugger: string;
  manufacturer: string;
  serial: string;
  description: string;
};

// Standard PDF fonts need printable Latin text. Normalize common punctuation
// and accents rather than failing an entire download on a pasted character.
const printable = (value: string) => value.normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[\u2010-\u2015]/g, "-")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
  .replace(/\u2026/g, "...").replace(/\u2022/g, "*")
  .replace(/\r\n?/g, "\n").replace(/\t/g, " ")
  .replace(/[^\x20-\x7e\n]/g, "?");

export async function createTuggerHistoryPdf(
  rows: TuggerHistoryPdfRow[],
  options: { status: string; query: string; generatedAt: string; title?: string; labels?: string[]; widths?: number[]; filterLabel?: string },
) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(options.title || "Frontline Tugger Work History");
  pdf.setAuthor("Frontline Pro Services");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 28, pageWidth = 792, pageHeight = 612;
  const columns: { key: keyof TuggerHistoryPdfRow; label: string; width: number }[] = [
    { key: "date", label: "Date", width: 60 },
    { key: "technician", label: "Technician", width: 75 },
    { key: "location", label: "Location", width: 100 },
    { key: "tracking", label: "Tracking #", width: 75 },
    { key: "tugger", label: "Tugger #", width: 50 },
    { key: "manufacturer", label: "Manufacturer", width: 75 },
    { key: "serial", label: "Serial #", width: 75 },
    { key: "description", label: "Description of Work", width: 226 },
  ];
  columns.forEach((column, index) => { column.label = options.labels?.[index] || column.label; column.width = options.widths?.[index] || column.width; });
  const fontSize = 8, lineHeight = 11, padding = 6;
  const ink = rgb(0.08, 0.16, 0.25), navy = rgb(0.07, 0.23, 0.39);
  function wrap(value: string, width: number) {
    const lines: string[] = [];
    for (const paragraph of printable(value || "-").split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (line && font.widthOfTextAtSize(`${line} ${word}`, fontSize) > width) {
          lines.push(line); line = "";
        }
        for (const character of word) {
          if (line && font.widthOfTextAtSize(line + character, fontSize) > width) {
            lines.push(line); line = "";
          }
          line += character;
        }
        line += " ";
      }
      lines.push(line.trimEnd());
    }
    return lines;
  }
  const filter = `${options.filterLabel || "Status"}: ${options.status} | ${rows.length} records | Search: ${options.query.slice(0, 250) || "All"}`;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = 0;
  function startPage(first = false) {
    if (!first) page = pdf.addPage([pageWidth, pageHeight]);
    page.drawText(options.title || "FRONTLINE | Tugger Work History", { x: margin, y: 571, size: 18, font: bold, color: navy });
    const filterLines = wrap(filter, pageWidth - margin * 2);
    filterLines.forEach((line, index) => page.drawText(line, { x: margin, y: 552 - index * lineHeight, size: fontSize, font, color: ink }));
    y = 535 - (filterLines.length - 1) * lineHeight;
    page.drawRectangle({ x: margin, y: y - 25, width: 736, height: 25, color: navy });
    let x = margin;
    for (const column of columns) {
      page.drawText(column.label, { x: x + padding, y: y - 16, size: 7.5, font: bold, color: rgb(1, 1, 1) });
      x += column.width;
    }
    y -= 25;
  }
  startPage(true);
  for (const [rowIndex, row] of rows.entries()) {
    const cells = columns.map(column => wrap(row[column.key], column.width - padding * 2));
    const lines = Math.max(...cells.map(cell => cell.length));
    let offset = 0;
    while (offset < lines) {
      if (y - margin - 12 < lineHeight + padding * 2) startPage();
      const count = Math.min(lines - offset, Math.floor((y - margin - 12 - padding * 2) / lineHeight));
      const height = count * lineHeight + padding * 2;
      page.drawRectangle({ x: margin, y: y - height, width: 736, height, color: rowIndex % 2 ? rgb(0.94, 0.96, 0.98) : rgb(1, 1, 1), borderWidth: 0.4, borderColor: rgb(0.8, 0.85, 0.9) });
      let x = margin;
      columns.forEach((column, index) => {
        cells[index].slice(offset, offset + count).forEach((line, lineIndex) => {
          page.drawText(line, { x: x + padding, y: y - padding - fontSize - lineIndex * lineHeight, size: fontSize, font, color: ink });
        });
        x += column.width;
      });
      y -= height;
      offset += count;
    }
  }
  pdf.getPages().forEach((current, index, pages) => {
    current.drawText(printable(`Generated ${options.generatedAt}`), { x: margin, y: 18, size: 7, font, color: ink });
    current.drawText(`Page ${index + 1} of ${pages.length}`, { x: pageWidth - 90, y: 18, size: 7, font, color: ink });
  });
  return pdf.save();
}
