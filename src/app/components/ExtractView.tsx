"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export default function Component({
  extract,
}: {
  extract: (text: string) => object;
}) {
  const [inputText, setInputText] = useState("");
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

    const result = await extract(inputText.trim());

    // Process files
    if (files) {
      result.files = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));
    }

    setJsonOutput(JSON.stringify(result, null, 2));
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Enter your long text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[200px] text-base"
        />
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
