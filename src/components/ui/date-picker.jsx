"use client"

import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function DatePicker({
  date,
  onSelect,
  className,
  disabled,
}) {
  return (
    <input
      type="date"
      value={date ? format(date, 'yyyy-MM-dd') : ''}
      onChange={(e) => {
        const newDate = e.target.value ? new Date(e.target.value) : null
        onSelect(newDate)
      }}
      className={cn(
        "flex h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      disabled={disabled}
    />
  )
}

