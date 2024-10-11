"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

type ExtractResult = {
  result: object;
  tokensUsed: number;
  tokensPrice: number;
};
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
    model?: string;
  }) => Promise<ExtractResult>;
  defaultSchema?: object;
  defaultText?: string;
  models?: Array<{ value: string; label: string }>;
  defaultModel?: string;
};

export function TextToJSON({
  extract,
  defaultSchema,
  defaultText,
  models,
  defaultModel,
}: TextToJSONProps) {
  const [inputText, setInputText] = useState(defaultText || "");
  const [jsonSchema, setJsonSchema] = useState(
    JSON.stringify(defaultSchema, null, 2) || ""
  );
  const [result, setResult] = useState<undefined | ExtractResult>();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [sizeError, setSizeError] = useState("");
  const [model, setModel] = useState(defaultModel || "");
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

    try {
      parsedJsonSchema = jsonSchema ? JSON.parse(jsonSchema) : undefined;
      const result = await extract({
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
        model: model,
      });

      setResult(result);
    } catch (error) {
      console.error("Error during extraction", error);
      setSizeError("Error during extraction");
    } finally {
      setIsLoading(false);
    }
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
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent>
            {models?.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {result && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Extracted JSON:</h2>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{JSON.stringify(result.result, null, 2)}</code>
          </pre>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">Tokens Used: {result.tokensUsed}</p>
            <p className="font-semibold">
              Price: ${result.tokensPrice.toFixed(6)} USD
            </p>
            <p className="font-semibold">
              Price for 100x: ${(result.tokensPrice * 100).toFixed(2)} USD
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
