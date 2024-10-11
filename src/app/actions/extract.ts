import { extractDataFromText } from "@/app/lib/extract";
import OpenAI from "openai";
import { JSONSchemaType } from "ajv";

interface MyData {
  claimDate: string;
  claimNumber: string;
  claimType: string;
  policeNumber: string;
  addressStreet: string;
  addressNumber: string;
  addressLocality: string;
  addressLocalityPostalCode: string;
}

const schema: JSONSchemaType<MyData> = {
  type: "object",
  properties: {
    claimDate: { type: "string", format: "date" },
    claimNumber: { type: "string" },
    claimType: { type: "string" },
    policeNumber: { type: "string" },
    addressStreet: { type: "string" },
    addressNumber: { type: "string" },
    addressLocality: { type: "string" },
    addressLocalityPostalCode: { type: "string" },
  },
  required: [],
  additionalProperties: false,
};

export async function extract(text: string) {
  "use server";
  console.log("Extracting data from text:", text);
  return extractDataFromText({
    openai: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    schema,
    text,
  });
}
