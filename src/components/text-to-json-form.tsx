'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export function TextToJsonForm() {
  const [inputText, setInputText] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simple example of text to JSON conversion
    // You can replace this with your actual processing logic
    const words = inputText.trim().split(/\s+/)
    const result = {
      wordCount: words.length,
      characterCount: inputText.length,
      firstWord: words[0],
      lastWord: words[words.length - 1]
    }

    setJsonOutput(JSON.stringify(result, null, 2))
    setIsLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Enter your long text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[200px] text-base"
        />
        <Button
          type="submit"
          className="w-full h-12 text-lg"
          disabled={isLoading || inputText.trim() === ''}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Submit'
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
  )
}