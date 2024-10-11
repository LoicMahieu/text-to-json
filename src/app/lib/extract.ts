import { OpenAI } from "openai";
import { JSONSchemaType } from "ajv";

interface ExtractOptions<T> {
  openai: OpenAI;
  text: string;
  schema: JSONSchemaType<T>;
}

export async function extractDataFromText<T>({
  openai,
  text,
  schema,
}: ExtractOptions<T>): Promise<object> {
  const prompt = `
Extract the following information from the given text according to this JSON schema:
${JSON.stringify(schema, null, 2)}

Text:
${text}

Provide the extracted information as a valid JSON object.
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
