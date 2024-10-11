import { extract } from "./actions/extract";
import { TextToJSON, TextToJSONProps } from "@/components/text-and-file-form";
import { JSONSchemaType } from "ajv";
export default function Home() {
  const onExtract: TextToJSONProps["extract"] = async ({
    text,
    files,
    schema,
    model,
  }) => {
    "use server";
    return await extract({
      text,
      files,
      schema: schema as JSONSchemaType<unknown>,
      model,
    });
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
      defaultSchema={{
        type: "object",
        properties: {
          claimDate: { type: "string", format: "date" },
          claimReference: {
            type: "string",
            description: "Often a number with a / or -",
          },
          claimType: { type: "string" },
          claimContactFirstname: {
            type: "string",
            description: "Often called 'correspondant'",
          },
          claimContactLastname: {
            type: "string",
            description: "Often called 'correspondant'",
          },
          claimContactPhone: {
            type: "string",
            description: "Often called 'correspondant'",
          },
          claimContactEmail: {
            type: "string",
            format: "email",
            description: "Often called 'correspondant'",
          },
          policeNumber: { type: "string" },
          address: {
            ...addressSchema,
            description: `
                Often called 'incident address' or 'sinister address'.
                But if the document looks like a formal letter, it is not this address in the header.
              `.replace(/\s+/g, " "),
          },
          insuredFirstname: { type: "string" },
          insuredLastname: { type: "string" },
          insuredPhone: { type: "string" },
          insuredEmail: { type: "string", format: "email" },
          insuredAddressStreet: { type: "string" },
          insuredAddressNumber: { type: "string" },
          insuredAddressLocality: { type: "string" },
          insuredAddressLocalityPostalCode: { type: "string" },
          insuredInsuranceCompany: { type: "string" },
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
