import sharp from "sharp";
import { extractImages, getDocumentProxy } from "unpdf";

export async function extractRepresentativeReportPhoto(pdfBytes: Buffer | Uint8Array) {
  const pdf = await getDocumentProxy(new Uint8Array(pdfBytes));
  let best: Awaited<ReturnType<typeof extractImages>>[number] | null = null;
  try {
    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 20); pageNumber += 1) {
      const images = await extractImages(pdf, pageNumber);
      for (const image of images) {
        const area = image.width * image.height;
        const ratio = image.width / Math.max(1, image.height);
        if (image.width < 180 || image.height < 140 || ratio > 5 || ratio < 0.2) continue;
        if (!best || area > best.width * best.height) best = image;
      }
    }
  } finally {
    await (pdf as unknown as { destroy?: () => Promise<void> }).destroy?.();
  }
  if (!best) return null;
  return sharp(best.data, { raw: { width: best.width, height: best.height, channels: best.channels } })
    .resize({ width: 1400, height: 1100, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
}
