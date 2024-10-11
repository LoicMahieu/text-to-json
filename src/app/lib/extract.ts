import { OpenAI } from "openai";
import { JSONSchemaType } from "ajv";
import { pdfToText } from "./pdf-to-text";

interface ExtractFile {
  name: string;
  type: string;
  size: number;
  content: string;
}

const tokenPricePerModel = {
  // gpt-4o $2.50 / 1M input tokens
  "gpt-4o": 0.0000025,

  "gpt-3.5-turbo-16k": 0.0000025,
};

export interface ExtractOptions<T> {
  openai: OpenAI;
  text: string;
  files: ExtractFile[];
  schema: JSONSchemaType<T>;
  model?: string;
}

export async function extractDataFromText<T>({
  openai,
  text,
  files,
  schema,
  model,
}: ExtractOptions<T>): Promise<{
  result: object;
  tokensUsed: number;
  tokensPrice: number;
}> {
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
When a data is used for a key, it is mostly not used for another key.
`;

  const response = await openai.chat.completions.create({
    // model: "gpt-3.5-turbo-16k",
    model: model || "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format:
      model === "gpt-4o"
        ? {
            type: "json_object",
          }
        : undefined,
  });

  const content = response.choices[0].message.content;

  if (!content) {
    throw new Error("Failed to extract data from text");
  }

  try {
    const extractedData = JSON.parse(content);
    return {
      result: extractedData,
      tokensUsed: response.usage?.total_tokens || 0,
      tokensPrice:
        (tokenPricePerModel[
          (model as keyof typeof tokenPricePerModel) || "gpt-4o"
        ] || tokenPricePerModel["gpt-4o"]) *
        (response.usage?.total_tokens || 0),
    };
  } catch (error) {
    throw new Error("Failed to parse extracted data as JSON", error as Error);
  }
}
