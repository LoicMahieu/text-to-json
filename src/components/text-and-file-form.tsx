"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export type TextToJSONProps = {
  extract: (options: {
    text: string;
    files: Array<{
      name: string;
      type: string;
      size: number;
      content: string; // base64 encoded
    }>;
    schema?: object;
  }) => object;
  defaultSchema?: object;
  defaultText?: string;
};

export function TextToJSON({ extract, defaultSchema, defaultText }: TextToJSONProps) {
  const [inputText, setInputText] = useState(defaultText || "");
  const [jsonSchema, setJsonSchema] = useState(
    JSON.stringify(defaultSchema, null, 2) || ""
  );
  const [jsonOutput, setJsonOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [sizeError, setSizeError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const totalSize = Array.from(selectedFiles).reduce(
        (acc, file) => acc + file.size,
        0
      );
      if (totalSize > MAX_FILE_SIZE) {
        setSizeError("Total file size exceeds 2MB limit");
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      } else {
        setSizeError("");
        setFiles(selectedFiles);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSizeError("");

    let parsedJsonSchema: object | undefined;
    try {
      parsedJsonSchema = jsonSchema ? JSON.parse(jsonSchema) : undefined;
    } catch (error) {
      console.error("Invalid JSON schema", error);
      setSizeError("Invalid JSON schema");
      setIsLoading(false);
      return;
    }


    let result = {};
    try {
      parsedJsonSchema = jsonSchema ? JSON.parse(jsonSchema) : undefined;
      result = await extract({
        text: inputText.trim(),
        files: files
          ? await Promise.all(
              Array.from(files).map(async (file) => {
                const reader = new FileReader();
                const content = await new Promise<string>((resolve) => {
                  reader.onload = () => {
                    resolve(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                });
                return {
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  content: content.replace(/^data:.+;base64,/, ""),
                };
              })
            )
          : [],
        schema: parsedJsonSchema || {},
      });
    } catch (error) {
      console.error("Error during extraction", error);
      setSizeError("Error during extraction");
      setIsLoading(false);
      return;
    }

    setJsonOutput(JSON.stringify(result, null, 2));
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            placeholder="Enter your long text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[500px] text-base"
          />
          <Textarea
            placeholder="Enter JSON schema here (optional)..."
            value={jsonSchema}
            onChange={(e) => setJsonSchema(e.target.value)}
            className="min-h-[500px] text-base"
          />
        </div>
        <div>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Max total file size: 2MB
          </p>
        </div>
        {sizeError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{sizeError}</AlertDescription>
          </Alert>
        )}
        <Button
          type="submit"
          className="w-full h-12 text-lg"
          disabled={isLoading || (inputText.trim() === "" && !files)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>

      {jsonOutput && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Extracted JSON:</h2>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{jsonOutput}</code>
          </pre>
        </div>
      )}
    </div>
  );
}