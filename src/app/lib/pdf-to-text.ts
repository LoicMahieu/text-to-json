import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const pdfToText = async (pdf: string /* base64 */) => {
  const loader = new PDFLoader(new Blob([Buffer.from(pdf, "base64")]));
  const documents = await loader.load();
  return documents.map((doc) => doc.pageContent).join("\n");
};
