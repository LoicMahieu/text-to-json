import { extractDataFromText, ExtractOptions } from "@/app/lib/extract";
import OpenAI from "openai";

export async function extract<T>(
  options: Omit<ExtractOptions<T>, "openai">
) {
  "use server";
  return extractDataFromText({
    ...options,
    openai: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  });
}
