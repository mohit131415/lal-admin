'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileText, AlertTriangle, RotateCcw } from 'lucide-react'
import JoditEditor from 'jodit-react'
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { toast } from 'react-toastify'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Hash } from 'lucide-react'
import { format } from 'date-fns'

const config = {
  readonly: false,
  height: 600,
  width: '100%',
  toolbar: true,
  spellcheck: true,
  language: 'en',
  toolbarButtonSize: 'medium',
  toolbarAdaptive: false,
  showCharsCounter: true,
  showWordsCounter: true,
  showXPathInStatusbar: false,
  showInvisibleCharacters: true,
  useInputsInPlaces: true,
  askBeforePasteHTML: true,
  askBeforePasteFromWord: true,
  defaultActionOnPaste: 'insert_clear_html',
  maxWidth: '100%',
  buttons: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    '|',
    'ul',
    'ol',
    '|',
    'font',
    'fontsize',
    'brush',
    'paragraph',
    'lineHeight',
    '|',
    'image',
    'table',
    'link',
    '|',
    'align',
    'hr',
    '|',
    'selectall',
    'spellcheck',
    '|',
    'print',
    'preview',
    '|',
    'undo',
    'redo'
  ],
  removeButtons: [
    'file',
    'video',
    'about',
    'speech',
    'classSpan',
    'copyformat',
    'eraser',
    'fullsize',
    'source'
  ],
  iframe: true,
  iframeStyle: `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      padding: 10px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    ul, ol {
      margin-left: 20px;
      padding-left: 20px;
      width: auto !important;
      max-width: 100% !important;
    }
    p, div {
      max-width: 100%;
      word-wrap: break-word;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1rem;
    }
    table td,
    table th {
      border: 1px solid #e5e7eb;
      padding: 8px;
      background: #fff;
    }
    table th {
      background: #f9fafb;
      font-weight: 600;
    }
    table tr:nth-child(even) td {
      background: #f9fafb;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 1em 0;
    }
    .jodit-table-resizer {
      border-color: #2563eb !important;
    }
    .jodit-table-resizer:hover {
      background-color: #2563eb !important;
    }
    .jodit-invisible-character {
      color: rgba(0, 0, 0, 0.4);
      font-weight: bold;
      user-select: none;
    }
  `,
  uploader: {
    insertImageAsBase64URI: true,
    maxFileSize: 10 * 1024 * 1024,
    acceptedFiles: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    error: (e) => {
      toast.error(e.message)
    }
  },
  colors: {
    greyscale:  ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF'],
    palette:    ['#980000', '#FF0000', '#FF9900', '#FFFF00', '#00F0F0', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'],
    full: [
      '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
      '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
      '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
      '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
      '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1C4587', '#073763', '#20124D', '#4C1130'
    ]
  },
  style: {
    fontFamily: {
      'Arial': 'Arial, Helvetica, sans-serif',
      'Georgia': 'Georgia, serif',
      'Impact': 'Impact, Charcoal, sans-serif',
      'Tahoma': 'Tahoma, Geneva, sans-serif',
      'Times New Roman': 'Times New Roman, Times, serif',
      'Verdana': 'Verdana, Geneva, sans-serif',
    }
  },
  events: {
    afterInit: (editor) => {
      // Remove branding
      const poweredBy = editor.container.querySelector('.jodit-powered-by');
      if (poweredBy) {
        poweredBy.remove();
      }
    }
  },
  textIcons: false,
  defaultLineHeight: '1.5',
  lineHeight: ['1', '1.15', '1.5', '2'],
}

const renderPreview = ({ imagePreview, title, date, tags, content, readingTime, titleColor = 'primary' }) => (
  <div className="prose max-w-none">
    {imagePreview && (
      <div className="relative w-full h-[300px] mb-6 rounded-lg overflow-hidden">
        <img
          src={imagePreview}
          alt="Featured"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    )}
    <h1 className={cn(
      "text-4xl font-bold mb-6 text-center",
      titleColor === 'black' ? 'text-gray-900' : 'text-primary'
    )}>{title || 'Untitled Post'}</h1>
    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        {format(date, 'MMMM d, yyyy')}
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        {readingTime || '5 min read'}
      </div>
      {tags?.length > 0 && (
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4" />
          {tags.join(', ')}
        </div>
      )}
    </div>
    <style>
      {`
        .preview-content {
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          color: #374151;
        }
        .preview-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 2rem 0 1rem;
          color: #111827;
          line-height: 1.2;
        }
        .preview-content h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin: 1.75rem 0 0.875rem;
          color: #1f2937;
          line-height: 1.3;
        }
        .preview-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem;
          color: #374151;
          line-height: 1.4;
        }
        .preview-content p {
          margin: 1rem 0;
          font-size: 1.125rem;
        }
        .preview-content ul,
        .preview-content ol {
          margin: 1rem 0;
          padding-left: 2rem;
          list-style-position: outside;
        }
        .preview-content ul {
          list-style-type: disc;
        }
        .preview-content ol {
          list-style-type: decimal;
        }
        .preview-content ul ul,
        .preview-content ol ul {
          list-style-type: circle;
          margin: 0.5rem 0;
        }
        .preview-content ul ul ul,
        .preview-content ol ul ul {
          list-style-type: square;
        }
        .preview-content ol ol,
        .preview-content ul ol {
          list-style-type: lower-alpha;
          margin: 0.5rem 0;
        }
        .preview-content ol ol ol,
        .preview-content ul ol ol {
          list-style-type: lower-roman;
        }
        .preview-content li {
          margin: 0.5rem 0;
          font-size: 1.125rem;
        }
        .preview-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .preview-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
        }
        .preview-content table td,
        .preview-content table th {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          background: #fff;
        }
        .preview-content table th {
          background: #f9fafb;
          font-weight: 600;
          text-align: left;
        }
        .preview-content table tr:nth-child(even) td {
          background: #f9fafb;
        }
        .preview-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #6b7280;
          font-style: italic;
        }
        .preview-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        .preview-content pre {
          background: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .preview-content code {
          font-family: ui-monospace, monospace;
          font-size: 0.9em;
          background: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
        }
        .preview-content pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }
      `}
    </style>
    <div 
      className="preview-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  </div>
)

export function RichTextEditor({ 
  value, 
  onChange, 
  label = "Content",
  className,
  error,
  required = false,
  autoSaveKey,
  onTitleExtract,
  titleColor = 'primary',
  onTitleColorChange,
  showPreview = false,
  imagePreview,
  title,
  date = new Date(),
  tags = [],
  readingTime,
  onAutoSave,
  postId
}) {
  const editor = useRef(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Generate draft key based on post ID or new post
  const draftKey = `draft-${postId || 'new'}`;
  
  // Check for existing draft on mount
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const response = await fetch(`/api/blog/get-draft-api.php?post_id=${postId || ''}`);
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          setHasDraft(true);
        }
      } catch (error) {
        console.error('Error checking draft:', error);
      }
    };
    
    checkDraft();
  }, [postId]);

  // Auto-save to database
  const handleAutoSave = useCallback(async () => {
    if (!value || isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/blog/save-draft-api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          content: value,
          title,
          reading_time: readingTime,
          tags
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setLastSaved(new Date());
        setHasDraft(true);
        if (onAutoSave) {
          onAutoSave(data.data);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [value, postId, title, readingTime, tags, onAutoSave, isSaving]);

  // Set up auto-save interval
  useEffect(() => {
    if (!showPreview) {
      const interval = setInterval(handleAutoSave, 30000); // Auto-save every 30 seconds
      return () => clearInterval(interval);
    }
  }, [handleAutoSave, showPreview]);

  // Handle draft restoration
  const handleRestoreDraft = useCallback(async () => {
    setIsRestoring(true);
    try {
      const response = await fetch(`/api/blog/get-draft-api.php?post_id=${postId || ''}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        onChange(data.data.content);
        toast.success('Draft restored successfully');
      }
    } catch (error) {
      console.error('Error restoring draft:', error);
      toast.error('Failed to restore draft');
    } finally {
      setIsRestoring(false);
    }
  }, [postId, onChange]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey)
      setHasDraft(false)
      onChange('')
      toast.success('Editor cleared and draft removed')
    } catch (error) {
      console.error('Error clearing draft:', error)
      toast.error('Failed to clear draft')
    }
  }, [draftKey, onChange]);


  // Auto-save current content
  const handleAutoSaveLocal = useCallback(() => {
    if (value) {
      localStorage.setItem(draftKey, value)
      setLastSaved(new Date())
      setHasDraft(true)

      if (onTitleExtract) {
        const plainText = value.replace(/<[^>]+>/g, '')
        const firstWords = plainText.split(' ').slice(0, 5).join(' ').trim()
        if (firstWords) {
          onTitleExtract(firstWords + '...')
        }
      }
    }
  }, [value, draftKey, onTitleExtract]);

  useEffect(() => {
    if (!showPreview) {
      const interval = setInterval(handleAutoSaveLocal, 30000) // Auto-save every 30 seconds
      return () => clearInterval(interval)
    }
  }, [handleAutoSaveLocal, showPreview])

  if (showPreview) {
    return renderPreview({
      imagePreview,
      title,
      date,
      tags,
      content: value,
      readingTime,
      titleColor
    });
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <Label className="inline-flex items-center gap-1">
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <div className="flex items-center gap-4">
          {hasDraft && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestoreDraft}
                disabled={isRestoring}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {isRestoring ? 'Restoring...' : 'Restore Draft'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDraft}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Clear Draft
              </Button>
            </motion.div>
          )}
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {hasDraft && !value && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have an unsaved draft. Click "Restore Draft" to recover it.
          </AlertDescription>
        </Alert>
      )}

      <Card className={cn(
        "overflow-hidden border-none shadow-sm",
        error && "ring-2 ring-red-500"
      )}>
        <JoditEditor
          ref={editor}
          value={value}
          config={{
            ...config,
            events: {
              ...config.events,
              afterInit: (editor) => {
                // Remove branding
                const poweredBy = editor.container.querySelector('.jodit-powered-by')
                if (poweredBy) {
                  poweredBy.remove()
                }
              },
              change: () => {
                handleAutoSave()
              }
            }
          }}
          onChange={onChange}
          className="min-h-[600px]"
        />
      </Card>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

