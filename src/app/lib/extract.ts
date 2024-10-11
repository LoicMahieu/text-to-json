import { OpenAI } from "openai";
import { JSONSchemaType } from "ajv";
import { pdfToText } from "./pdf-to-text";

interface ExtractFile {
  name: string;
  type: string;
  size: number;
  content: string;
}

export interface ExtractOptions<T> {
  openai: OpenAI;
  text: string;
  files: ExtractFile[];
  schema: JSONSchemaType<T>;
}

export async function extractDataFromText<T>({
  openai,
  text,
  files,
  schema,
}: ExtractOptions<T>): Promise<object> {
  const fileContents = await Promise.all(
    files
      .filter((file) => file.type === "application/pdf")
      .map((file) => pdfToText(file.content))
  );

  const prompt = `
Extract the following information from the given text according to this JSON schema:
${JSON.stringify(schema, null, 2)}

Text:
${text}
${fileContents ? fileContents.join("\n") : ""}

Provide the extracted information as a valid JSON object.
Most of time, the value is ended with a period, a comma, or a newline.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-16k",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;

  if (!content) {
    throw new Error("Failed to extract data from text");
  }

  try {
    const extractedData = JSON.parse(content);
    return extractedData;
  } catch (error) {
    throw new Error("Failed to parse extracted data as JSON", error as Error);
  }
}
