const MAX_CHARS_PER_LINE = 50;

import { X, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function MultiLineTitle({ values, onChange, error, className }) {
  const addLine = () => {
    if (values.length < 3) {
      onChange([...values, ''])
    }
  }

  const removeLine = (index) => {
    const newValues = values.filter((_, i) => i !== index)
    onChange(newValues)
  }

  const updateLine = (index, value) => {
    const newValues = [...values];
    newValues[index] = value.slice(0, MAX_CHARS_PER_LINE);
    onChange(newValues);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2 items-center">
          <div className="flex-grow">
            <Input
              value={value}
              onChange={(e) => updateLine(index, e.target.value)}
              className={cn(
                "text-lg",
                error && "border-red-500 focus-visible:ring-red-500"
              )}
              placeholder={`Title line ${index + 1}`}
              required={index === 0}
              aria-invalid={!!error}
              aria-describedby={error ? "title-error" : undefined}
              maxLength={MAX_CHARS_PER_LINE}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {value.length}/{MAX_CHARS_PER_LINE}
          </span>
          {index > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeLine(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {values.length < 3 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLine}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add line
        </Button>
      )}
      {error && (
        <p id="title-error" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
