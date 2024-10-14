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
  // $2.50 / 1M input tokens
  // $10.00 / 1M output tokens
  "gpt-4o": {
    input: 2.5 / 1000000,
    output: 10 / 1000000,
  },

  // $3.000 / 1M input tokens
  // $6.000 / 1M output tokens
  "gpt-3.5-turbo-16k": {
    input: 3 / 1000000,
    output: 6 / 1000000,
  },
};

export interface ExtractOptions<T> {
  openai: OpenAI;
  text: string;
  files: ExtractFile[];
  schema: JSONSchemaType<T>;
  model?: keyof typeof tokenPricePerModel;
  prompt?: string;
}

export async function extractDataFromText<T>({
  openai,
  text,
  files,
  schema,
  model,
  prompt: promptUser,
}: ExtractOptions<T>): Promise<{
  result: T;
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

${promptUser || ""}

Provide the extracted information as a valid JSON object.
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
        (response.usage?.prompt_tokens || 0) *
          tokenPricePerModel[model || "gpt-4o"].input +
        (response.usage?.completion_tokens || 0) *
          tokenPricePerModel[model || "gpt-4o"].output,
    };
  } catch (error) {
    throw new Error("Failed to parse extracted data as JSON", error as Error);
  }
}
