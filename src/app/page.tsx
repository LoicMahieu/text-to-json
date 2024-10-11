import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { extract } from "./actions/extract";
import { TextToJSON, TextToJSONProps } from "@/components/text-and-file-form";
import { JSONSchemaType } from "ajv";
export default function Home() {
  const onExtract: TextToJSONProps["extract"] = async ({
    text,
    files,
    schema,
  }) => {
    "use server";
    return await extract({
      text,
      files,
      schema: schema as JSONSchemaType<unknown>,
    });
  };
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <TextToJSON
        extract={onExtract}
        defaultSchema={{
          type: "object",
          properties: {
            claimDate: { type: "string", format: "date" },
            claimNumber: { type: "string" },
            claimType: { type: "string" },
            clainContentFirstname: {
              type: "string",
              description: "Often called 'correspondant'",
            },
            clainContentLastname: {
              type: "string",
              description: "Often called 'correspondant'",
            },
            clainContentPhone: {
              type: "string",
              description: "Often called 'correspondant'",
            },
            clainContentEmail: {
              type: "string",
              format: "email",
              description: "Often called 'correspondant'",
            },
            policeNumber: { type: "string" },
            addressStreet: { type: "string" },
            addressNumber: { type: "string" },
            addressLocality: { type: "string" },
            addressLocalityPostalCode: { type: "string" },
          },
          required: [],
          additionalProperties: false,
        }}
      />

      <CopilotPopup
        instructions={
          "You are assisting the user as best as you can. Ansewr in the best way possible given the data you have."
        }
        labels={{
          title: "Popup Assistant",
          initial: "Need any help?",
        }}
      />
    </CopilotKit>
  );
}
