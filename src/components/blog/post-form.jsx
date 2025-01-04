import React, { useState, useCallback, useRef } from 'react'
import { ImageIcon, X, Loader2, Calendar, Clock, Hash, AlertCircle, Eye, EyeOff, Split, FileText } from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DatePicker }from "@/components/ui/date-picker"
import { format, isBefore, startOfToday, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { useDocumentPreview } from "@/lib/UseDocumentPreview";
import { Switch } from "@/components/ui/switch"
import { MultiLineTitle } from './MultiLineTitle'

export function PostForm({ post, onSubmit, isSubmitting = false }) {
  // Form state
  const [title, setTitle] = useState(post?.title ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [date, setDate] = useState(post?.published_at ? parseISO(post.published_at) : new Date())
  const [time, setTime] = useState(post?.time ?? '12:00')
  const [publishType, setPublishType] = useState('now')
  const [tags, setTags] = useState(post?.tags ?? [])
  const [currentTag, setCurrentTag] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(post?.image ?? null)
  const [showPreview, setShowPreview] = useState(false)
  const [titleColor, setTitleColor] = useState('primary')
  const [readingTime, setReadingTime] = useState(post?.readingTime ?? '5')
  const [wordFile, setWordFile] = useState(null)
  const [wordFilePreview, setWordFilePreview] = useState(null)
  const [inputType, setInputType] = useState('write')
  const [documentContent, setDocumentContent] = useState('');
  const [viewMode, setViewMode] = useState('write')
  const [titleLines, setTitleLines] = useState(
    post?.title ? [post.title] : ['']
  )

  // Validation state
  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)

  // Handle title extraction from content
  const handleTitleExtract = useCallback((extractedTitle) => {
    if (!title) {
      setTitle(extractedTitle)
    }
  }, [title])

  // Validation helper
  const validate = useCallback(() => {
    const newErrors = {}

    if (!titleLines[0]?.trim()) {
      newErrors.title = 'Title is required'
    }

    if (titleLines.some(line => line.length > 50)) {
      newErrors.title = 'Each title line must be 50 characters or less'
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required'
    }

    if (publishType === 'later') {
      const scheduledDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`)
      const now = new Date()
      if (isBefore(scheduledDateTime, now)) {
        newErrors.date = 'Scheduled time must be in the future'
        newErrors.time = 'Scheduled time must be in the future'
      }
    }

    if (!readingTime || isNaN(readingTime) || parseInt(readingTime) < 1) {
      newErrors.readingTime = 'Reading time must be a positive number'
    }

    if (inputType === 'document' && !wordFile) {
      newErrors.content = 'Please upload a document'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [titleLines, content, publishType, date, time, readingTime, inputType, wordFile])

  // Image handlers
  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 10MB' }))
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setErrors(prev => ({ ...prev, image: '' }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Word file handler
  const handleWordFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, wordFile: 'File must be less than 10MB' }));
        return;
      }

      try {
        setWordFile(file);
        setWordFilePreview(file.name);
        setErrors(prev => ({ ...prev, wordFile: '' }));
       
        // Preview document content
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const { previewWordDocument } = useDocumentPreview();
          try {
            const content = await previewWordDocument(file);
            setDocumentContent(content);
            setContent(content); // Set the main content as well
            
            // Extract first line as potential title if title is empty
            if (!title) {
              const firstLine = content.split('\n')[0].replace(/<[^>]+>/g, '').trim();
              if (firstLine) {
                setTitle(firstLine);
              }
            }
          } catch (error) {
            console.error('Error reading document:', error);
            setErrors(prev => ({ ...prev, wordFile: 'Failed to read document' }));
          }
        } else {
          // For other file types, use FileReader
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result;
            setDocumentContent(text);
            setContent(text);
          };
          reader.readAsText(file);
        }
      } catch (error) {
        console.error('Error reading document:', error);
        setErrors(prev => ({ ...prev, wordFile: 'Failed to read document' }));
      }
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 10MB' }))
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setErrors(prev => ({ ...prev, image: '' }))
      }
      reader.readAsDataURL(file)
    } else {
      setErrors(prev => ({ ...prev, image: 'Please upload an image file' }))
    }
  }, [])

  // Tag handlers
  const handleAddTag = useCallback((e) => {
    e.preventDefault()
    const trimmedTag = currentTag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (tags.length >= 10) {
        setErrors(prev => ({ ...prev, tags: 'Maximum 10 tags allowed' }))
        return
      }
      setTags(prev => [...prev, trimmedTag])
      setCurrentTag('')
      setErrors(prev => ({ ...prev, tags: '' }))
    }
  }, [currentTag, tags])

  const removeTag = useCallback((tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
    setErrors(prev => ({ ...prev, tags: '' }))
  }, [])

  // Form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = {
      title: titleLines.map(line => line.trim()).join('\n'),
      content,
      published_at: format(date, 'yyyy-MM-dd HH:mm:ss'),
      time,
      publishType,
      tags,
      image: imagePreview || '/placeholder.svg?height=200&width=400',
      selectedImage,
      titleColor,
      readingTime: `${readingTime} min read`,
      wordFile,
      updatedAt: post?.updatedAt ? format(parseISO(post.updatedAt), 'yyyy-MM-dd HH:mm:ss') : null
    };

    onSubmit(formData);
  }, [titleLines, content, date, time, publishType, tags, imagePreview, selectedImage, titleColor, readingTime, wordFile, validate, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="button"
          variant={!showPreview && viewMode !== 'split' ? 'default' : 'outline'}
          onClick={() => {
            setShowPreview(false)
            setViewMode('write')
          }}
        >
          <FileText className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          type="button"
          variant={showPreview ? 'default' : 'outline'}
          onClick={() => {
            setShowPreview(true)
            setViewMode('preview')
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          type="button"
          variant={viewMode === 'split' ? 'default' : 'outline'}
          onClick={() => {
            setShowPreview(false)
            setViewMode(viewMode === 'split' ? 'write' : 'split')
          }}
        >
          <Split className="w-4 h-4 mr-2" />
          Split View
        </Button>
      </div>

      {viewMode === 'preview' ? (
        <Card>
          <CardContent className="pt-6">
            <RichTextEditor
              showPreview
              value={inputType === 'document' ? documentContent : content}
              title={titleLines.join('\n')}
              date={date}
              tags={tags}
              imagePreview={imagePreview}
              readingTime={`${readingTime} min read`}
              titleColor={titleColor}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'split' ? (
        <div className="flex gap-8">
          <div className="w-1/2">
            <h2 className="text-lg font-semibold mb-2">Editor Content</h2>
            <Card className="h-[800px] flex flex-col">
              <CardContent className="flex-1 overflow-y-auto min-h-0 p-4">
                {inputType === 'write' ? (
                  <RichTextEditor
                    className="h-full"
                    value={content}
                    onChange={(value) => {
                      setContent(value)
                      if (errors.content) {
                        setErrors(prev => ({ ...prev, content: '' }))
                      }
                    }}
                    error={errors.content}
                    required
                    label="Content"
                    autoSaveKey={`post-${post?.id ?? 'new'}`}
                    onTitleExtract={handleTitleExtract}
                    titleColor={titleColor}
                    onTitleColorChange={setTitleColor}
                  />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Upload Document</Label>
                      <Card className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex justify-center border-2 border-dashed border-muted hover:border-primary-400 transition-colors rounded-lg p-4">
                            <div className="space-y-1 text-center">
                              {wordFile ? (
                                <div className="relative flex items-center gap-2 justify-center">
                                  <FileText className="h-8 w-8 text-primary" />
                                  <span className="text-sm font-medium">{wordFile.name}</span>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="ml-2"
                                    onClick={() => {
                                      setWordFile(null);
                                      setWordFilePreview(null);
                                      setDocumentContent('');
                                      setContent('');
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                  <div className="flex text-sm">
                                    <label htmlFor="document-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90">
                                      <span>Upload document</span>
                                      <input
                                        id="document-upload"
                                        name="document-upload"
                                        type="file"
                                        className="sr-only"
                                        accept=".doc,.docx,.pdf,.txt,.rtf"
                                        onChange={handleWordFileChange}
                                      />
                                    </label>
                                  </div>
                                  <p className="text-xs text-muted-foreground">DOC, DOCX, PDF, TXT, RTF up to 10MB</p>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {wordFile && (
                      <div>
                        <Label>Edit Content</Label>
                        <RichTextEditor
                          value={content}
                          onChange={(value) => {
                            setContent(value)
                            if (errors.content) {
                              setErrors(prev => ({ ...prev, content: '' }))
                            }
                          }}
                          error={errors.content}
                          required
                          label="Content"
                          autoSaveKey={`post-${post?.id ?? 'new'}`}
                          onTitleExtract={handleTitleExtract}
                          titleColor={titleColor}
                          onTitleColorChange={setTitleColor}
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="w-1/2">
            <h2 className="text-lg font-semibold mb-2">Preview Content</h2>
            <Card className="h-[800px] flex flex-col">
              <CardContent className="flex-1 overflow-y-auto min-h-0 p-4">
                <RichTextEditor
                  className="h-full"
                  showPreview
                  value={inputType === 'document' ? documentContent : content}
                  title={titleLines.join('\n')}
                  date={date}
                  tags={tags}
                  imagePreview={imagePreview}
                  readingTime={`${readingTime} min read`}
                  titleColor={titleColor}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex gap-8 w-full">
          <div className="flex-[7] space-y-8">
            <div className="space-y-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="title" className="text-base">
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <MultiLineTitle
                          values={titleLines}
                          onChange={setTitleLines}
                          error={errors.title}
                        />
                      </div>

                      <div>
                        <Label htmlFor="readingTime" className="text-base">
                          Reading Time (minutes) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="readingTime"
                          type="number"
                          min="1"
                          value={readingTime}
                          onChange={(e) => {
                            setReadingTime(e.target.value)
                            if (errors.readingTime) {
                              setErrors(prev => ({ ...prev, readingTime: '' }))
                            }
                          }}
                          className={cn(
                            errors.readingTime && "border-red-500 focus-visible:ring-red-500"
                          )}
                          required
                        />
                        {errors.readingTime && (
                          <p className="mt-2 text-sm text-red-500">
                            {errors.readingTime}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-base">Input Type</Label>
                        <div className="mt-2 flex items-center gap-2">
                          <Switch
                            id="input-type"
                            checked={inputType === 'document'}
                            onCheckedChange={(checked) => setInputType(checked ? 'document' : 'write')}
                          />
                          <Label htmlFor="input-type" className="font-normal">
                            {inputType === 'document' ? 'Upload Document' : 'Write Text'}
                          </Label>
                        </div>
                      </div>
                      <div>
                        {inputType === 'write' ? (
                          <RichTextEditor
                            value={content}
                            onChange={(value) => {
                              setContent(value)
                              if (errors.content) {
                                setErrors(prev => ({ ...prev, content: '' }))
                              }
                            }}
                            error={errors.content}
                            required
                            label="Content"
                            autoSaveKey={`post-${post?.id ?? 'new'}`}
                            onTitleExtract={handleTitleExtract}
                            titleColor={titleColor}
                            onTitleColorChange={setTitleColor}
                          />
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <Label>Upload Document</Label>
                              <Card className="overflow-hidden">
                                <CardContent className="p-6">
                                  <div className="flex justify-center border-2 border-dashed border-muted hover:border-primary-400 transition-colors rounded-lg p-4">
                                    <div className="space-y-1 text-center">
                                      {wordFile ? (
                                        <div className="relative flex items-center gap-2 justify-center">
                                          <FileText className="h-8 w-8 text-primary" />
                                          <span className="text-sm font-medium">{wordFile.name}</span>
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="ml-2"
                                            onClick={() => {
                                              setWordFile(null);
                                              setWordFilePreview(null);
                                              setDocumentContent('');
                                              setContent('');
                                            }}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <>
                                          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                          <div className="flex text-sm">
                                            <label htmlFor="document-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90">
                                              <span>Upload document</span>
                                              <input
                                                id="document-upload"
                                                name="document-upload"
                                                type="file"
                                                className="sr-only"
                                                accept=".doc,.docx,.pdf,.txt,.rtf"
                                                onChange={handleWordFileChange}
                                              />
                                            </label>
                                          </div>
                                          <p className="text-xs text-muted-foreground">DOC, DOCX, PDF, TXT, RTF up to 10MB</p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            {wordFile && (
                              <div>
                                <Label>Edit Content</Label>
                                <RichTextEditor
                                  value={content}
                                  onChange={(value) => {
                                    setContent(value)
                                    if (errors.content) {
                                      setErrors(prev => ({ ...prev, content: '' }))
                                    }
                                  }}
                                  error={errors.content}
                                  required
                                  label="Content"
                                  autoSaveKey={`post-${post?.id ?? 'new'}`}
                                  onTitleExtract={handleTitleExtract}
                                  titleColor={titleColor}
                                  onTitleColorChange={setTitleColor}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          </div>
          <div className="flex-[3] space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Publishing Settings</CardTitle>
                <CardDescription>
                  Configure when and how your post will be published
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Publishing Time</Label>
                  <RadioGroup 
                    defaultValue="now" 
                    value={publishType}
                    onValueChange={setPublishType}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="now" id="now" />
                      <Label htmlFor="now" className="font-normal">Publish Now</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="later" id="later" />
                      <Label htmlFor="later" className="font-normal">Schedule for Later</Label>
                    </div>
                  </RadioGroup>
                </div>

                {publishType === 'later' && (
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-row space-x-4">
                      <div className="flex flex-col">
                        <Label htmlFor="date">Date</Label>
                        <div className="mt-1.5">
                          <DatePicker
                            date={date}
                            onSelect={setDate}
                            disabledDates={(date) => isBefore(date, startOfToday())}
                            className="[&_button]:w-[40px] [&_button]:px-2"
                          />
                          {errors.date && (
                            <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="time">Time</Label>
                        <div className="relative mt-1.5 pl-5">
                          <Input
                            type="time"
                            id="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="pl-10 pr-8"
                            required={publishType === 'later'}
                          />
                          {errors.time && (
                            <p className="text-sm text-red-500 mt-1">{errors.time}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Featured Image</Label>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div
                        className={cn(
                          "flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-muted hover:border-primary-400 transition-colors cursor-pointer rounded-lg",
                          isDragging && "border-primary-400 bg-primary/5"
                        )}
                        onDragEnter={() => setIsDragging(true)}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onDragOver={(e) => {
                          e.preventDefault()
                        }}
                      >
                        <div className="space-y-1 text-center">
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="mx-auto max-h-48 w-full object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setSelectedImage(null)
                                  setImagePreview(null)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                              <div className="flex text-sm">
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90">
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                  />
                                </label>
                                <p className="pl-1 text-muted-foreground">or drag and drop</p>
                              </div>
                              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {errors.image && (
                    <p className="mt-2 text-sm text-red-500">{errors.image}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                        placeholder="Add tags (press Enter)"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-primary-50/50 text-primary-600 hover:bg-primary-100/50 rounded-full px-3 py-0.5 text-sm font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 rounded-full hover:bg-primary/30 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {errors.tags && (
                      <p className="mt-2 text-sm text-red-500">{errors.tags}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <Button
        type="submit"
        className="w-full mt-6"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {post ? 'Updating...' : 'Publishing...'}
          </>
        ) : (
          post ? 'Update Post' : 'Publish Post'
        )}
      </Button>
    </form>
  )
}

