import { extractText as extractPdfText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

export class UnsupportedFileTypeError extends Error {
  constructor(message = "Unsupported file type. Please upload a PDF or DOCX file.") {
    super(message);
    this.name = "UnsupportedFileTypeError";
  }
}

function isPdf(fileName: string, mimeType: string): boolean {
  return mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
}

function isDocx(fileName: string, mimeType: string): boolean {
  return (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx")
  );
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractPdfText(pdf, { mergePages: true });
  return text;
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name ?? "";
  const mimeType = file.type ?? "";

  if (isPdf(fileName, mimeType)) {
    return extractFromPdf(buffer);
  }

  if (isDocx(fileName, mimeType)) {
    return extractFromDocx(buffer);
  }

  throw new UnsupportedFileTypeError();
}
