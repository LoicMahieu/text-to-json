import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { extract } from "./actions/extract";
import { ExtractView } from "./components/ExtractView";
export default function Home() {
  const onExtract = async (text: string) => {
    "use server";
    return await extract(text);
  };
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <ExtractView extract={onExtract} />

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
