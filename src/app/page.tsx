import { extract } from "./actions/extract";
import { TextToJSON, TextToJSONProps } from "@/components/text-and-file-form";
import { extractDataFromTextBasePrompt } from "./lib/extract";
export default function Home() {
  const onExtract: TextToJSONProps["extract"] = async (options) => {
    "use server";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await extract<any>(options as any);
  };
  const addressSchema = {
    type: "object",
    properties: {
      street: { type: "string" },
      number: { type: "string" },
      locality: { type: "string" },
      postalCode: { type: "string" },
    },
  };
  return (
    <TextToJSON
      extract={onExtract}
      models={[
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-3.5-turbo-16k", label: "GPT-3.5-turbo-16k" },
      ]}
      defaultModel="gpt-4o"
      defaultPrompt={extractDataFromTextBasePrompt}
      defaultSchema={{
        type: "object",
        properties: {
          claimDate: { type: "string", format: "date" },
          claimReference: {
            type: "string",
            description: "Often a number with a / or -",
          },
          claimType: { type: "string" },
          contractNumber: { type: "string" },
          contact: {
            type: "object",
            description: "Often called 'correspondant'",
            properties: {
              firstname: { type: "string" },
              lastname: { type: "string" },
              phone: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          policeNumber: { type: "string" },
          address: {
            ...addressSchema,
            description: `
Often called 'incident address' or 'sinister address'.
But if the document looks like a formal letter, it is not this address in the header.
`.trim(),
          },
          broker: {
            type: "object",
            properties: {
              name: { type: "string" },
              phone: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          insured: {
            type: "object",
            properties: {
              firstname: { type: "string" },
              lastname: { type: "string" },
              phone: { type: "string" },
              email: { type: "string", format: "email" },
              address: addressSchema,
            },
          },
          thirdparties: {
            type: "array",
            items: {
              type: "object",
              properties: {
                firstname: { type: "string" },
                lastname: { type: "string" },
                phone: { type: "string" },
                email: { type: "string", format: "email" },
                address: addressSchema,
              },
            },
          },
        },
        required: [],
        additionalProperties: false,
      }}
    />
  );
}
