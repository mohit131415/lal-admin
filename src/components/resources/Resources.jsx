'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, Download, Trash2, FileText, ImageIcon, File, Upload, X, ChevronLeft, ChevronRight, Loader2, Eye } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useResource } from '@/hooks/useResource'
import { getResourceUrl } from '@/api/config/apiConfig'
import { toast } from 'react-toastify'

const ITEMS_PER_PAGE = 5;

const getFileIcon = (type) => {
  switch(type?.toLowerCase()) {
    case 'pdf':
      return FileText;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return ImageIcon;
    default:
      return File;
  }
};

// Helper function to format file size
function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function Resources() {
  const { resources, loading, error, getResources, uploadResource, updateResource, deleteResource } = useResource()
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('view')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null,
    thumbnail: null
  })
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [selectedResource, setSelectedResource] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewResource, setPreviewResource] = useState(null)

  useEffect(() => {
    getResources().catch(err => {
      toast.error(err.message || "Failed to load resources", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    })
  }, [getResources])

  const totalPages = Math.ceil(resources.length / ITEMS_PER_PAGE)
  const paginatedResources = resources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
      
      // If it's an image, show preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setThumbnailPreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = selectedResource 
        ? await updateResource(selectedResource.id, formData)
        : await uploadResource(formData)

      if (response?.success) {
        toast.success(response.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        handleReset()
        setActiveTab('view')
        await getResources()
      } else {
        throw new Error(response?.message || 'Operation failed')
      }
    } catch (err) {
      toast.error(err.message || "Failed to process resource", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      file: null,
      thumbnail: null
    })
    setThumbnailPreview(null)
    setSelectedResource(null)
  }

  const handleEdit = (resource) => {
    setSelectedResource(resource)
    setFormData({
      name: resource.title || '',
      description: resource.description || '',
      file: null,
      thumbnail: null
    })
    setThumbnailPreview(
      resource.thumbnail_path 
        ? getResourceUrl(resource.thumbnail_path)
        : null
    )
    setActiveTab('update')
  }

  const handleDelete = async (id) => {
    try {
      const response = await deleteResource(id)
      if (response?.success) {
        toast.success(response.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        await getResources()
      } else {
        throw new Error(response?.message || 'Delete failed')
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete resource", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  const handleDownload = async (resource) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/admin-api/resources/download-resource-api.php?file=${resource.file_path}`;
    
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
    
      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = resource.title;
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
    
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    
      // Clean up
      window.URL.revokeObjectURL(objectUrl);
    
      toast.success('Download started successfully');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file. Please try again.');
    }
  };

  const handlePreview = (resource) => {
    setPreviewResource(resource)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <File className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading resources</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => getResources()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600 mt-1">Manage downloadable resources and materials</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-white p-1 text-muted-foreground gap-1 border border-input">
          <TabsTrigger 
            value="view" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-primary-500/90 hover:text-white"
          >
            View Resources
          </TabsTrigger>
          <TabsTrigger 
            value="update"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-primary-500/90 hover:text-white"
          >
            Upload Resource
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedResources.length > 0 ? (
                    paginatedResources.map((resource) => (
                      <Card key={resource.id}>
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            <div className="w-[200px] h-[120px] relative rounded-lg overflow-hidden bg-muted shrink-0">
                              {resource.thumbnail_path ? (
                                <img
                                  src={getResourceUrl(resource.thumbnail_path)}
                                  alt={resource.title}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                  {React.createElement(getFileIcon(resource.file_type), { 
                                    className: "w-12 h-12 text-muted-foreground" 
                                  })}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 flex justify-between gap-6">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg">{resource.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {resource.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{resource.file_type}</span>
                                  <span>•</span>
                                  <span>{formatFileSize(resource.file_size)}</span>
                                  <span>•</span>
                                  <span>Uploaded on {format(new Date(resource.created_at), 'PP')}</span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePreview(resource)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(resource)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(resource)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this resource? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(resource.id)}
                                        className="bg-red-500 text-white hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="space-y-4">
                        <File className="w-12 h-12 mx-auto text-primary-200" />
                        <p className="text-lg">No resources found</p>
                      </div>
                    </div>
                  )}

                  {paginatedResources.length > 0 && (
                    <div className="flex items-center justify-between px-2 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="update">
          <Card>
            <CardHeader>
              <CardTitle>{selectedResource ? 'Update Resource' : 'Upload New Resource'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Resource Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Resource File</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${formData.file ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-8 h-8 mb-2 ${formData.file ? 'text-primary' : 'text-muted-foreground'}`} />
                        {formData.file ? (
                          <>
                            <p className="mb-2 text-sm text-primary font-medium">File selected:</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{formData.file.name}</p>
                          </>
                        ) : (
                          <>
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, DOC, ZIP (MAX. 100MB)
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        required={!selectedResource}
                        disabled={isSubmitting}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-40 h-40 border rounded-lg overflow-hidden">
                      {thumbnailPreview ? (
                        <>
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setThumbnailPreview(null)
                              setFormData(prev => ({ ...prev, thumbnail: null }))
                            }}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block">
                        <div className="flex flex-col items-start">
                          <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                            <label>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                disabled={isSubmitting}
                              />
                              Choose Thumbnail
                            </label>
                          </Button>
                          <span className="text-xs text-muted-foreground mt-2">
                            Recommended: 600x400px or larger
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {selectedResource ? 'Updating...' : 'Uploading...'}
                      </>
                    ) : (
                      selectedResource ? 'Update Resource' : 'Upload Resource'
                    )}
                  </Button>
                  {selectedResource && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleReset}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resource Preview Dialog */}
      <Dialog open={!!previewResource} onOpenChange={() => setPreviewResource(null)}>
        <DialogContent 
          className="max-w-4xl h-[80vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          aria-describedby="preview-description"
        >
          
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewResource?.title}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(previewResource)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="bg-[#FF5722] hover:bg-[#FF5722]/90"
                  onClick={() => setPreviewResource(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription id="preview-description">
              Preview and download resource content
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex-1 overflow-auto">
            {previewResource?.file_type?.toLowerCase().match(/^(jpg|jpeg|png|gif)$/) ? (
              <div className="relative h-full flex items-center justify-center bg-muted/30 rounded-lg p-4">
                <img
                  src={getResourceUrl(previewResource.file_path)}
                  alt={previewResource.title}
                  className="max-h-full max-w-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.svg?height=400&width=600';
                  }}
                />
              </div>
            ) : previewResource?.file_type?.toLowerCase().match(/^(mp4|webm|ogg)$/) ? (
              <video
                controls
                className="w-full max-h-[600px] rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              >
                <source src={getResourceUrl(previewResource.file_path)} type={`video/${previewResource.file_type.toLowerCase()}`} />
                <div className="hidden flex-col items-center justify-center py-12 text-muted-foreground">
                  <File className="w-16 h-16 mb-4" />
                  <p>Unable to play video. Please download to view.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(previewResource)}
                    className="mt-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                </div>
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-muted/30 rounded-lg">
                <File className="w-16 h-16 mb-4" />
                <p className="text-muted-foreground">Preview not available for {previewResource?.file_type?.toUpperCase()} files</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(previewResource)}
                  className="mt-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download to view
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

