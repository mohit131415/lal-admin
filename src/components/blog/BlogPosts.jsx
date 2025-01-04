'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostList } from './post-list';
import { PostForm } from './post-form';
import { useBlog } from '@/hooks/useBlog';
import { toast } from 'react-toastify';

export default function BlogPosts() {
  const [activeTab, setActiveTab] = useState('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const { data, loading, error, getPosts, createPost, updatePost, deletePost } = useBlog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState(null);

  // Initialize posts as an empty array if data is not available
  const posts = data?.posts ?? [];

  useEffect(() => {
    getPosts()
      .then(() => setActiveTab('view'))
      .catch(err => {
        toast.error(err.message || 'Failed to load posts');
      });
  }, [getPosts]);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (data.id) {
        await updatePost(data.id, data);
        toast.success('Post updated successfully');
      } else {
        await createPost(data);
        toast.success('Post created successfully');
      }
      setActiveTab('view');
      setPost(null);
      getPosts(); // Refresh the posts list
    } catch (err) {
      toast.error(err.message || 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      toast.success('Post deleted successfully');
      getPosts(); // Refresh the posts list
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  const handleEdit = (post) => {
    setPost(post);
    setActiveTab('upload');
  };

  // Safe filtering with null checks
  const filteredPosts = posts.filter(post => {
    if (!post) return false;
    
    const matchesSearch = searchTerm ? (
      (post.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(post.tags) && post.tags.some(tag => 
        tag?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    ) : true;

    const matchesDate = filterDate ? (
      post.published_at && 
      new Date(post.published_at).toLocaleDateString() === new Date(filterDate).toLocaleDateString()
    ) : true;

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Info className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading posts</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => getPosts()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Create and manage your blog posts</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowHelp(!showHelp)}
          className="relative"
        >
          <HelpCircle className="h-5 w-5" />
          {!showHelp && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-white border-primary-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Quick Help Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Creating a Post</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Click "Upload Post" tab</li>
                      <li>Fill in the title and content</li>
                      <li>Add a featured image (optional)</li>
                      <li>Add relevant tags</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Publishing Options</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Publish immediately</li>
                      <li>Schedule for later</li>
                      <li>Save as draft</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Managing Posts</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Edit existing posts</li>
                      <li>Delete unwanted posts</li>
                      <li>Search and filter posts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-white p-1 text-muted-foreground gap-1 border border-input">
          <TabsTrigger 
            value="upload" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-primary-500/90 hover:text-white"
          >
            Upload Post
          </TabsTrigger>
          <TabsTrigger 
            value="view" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-primary-500/90 hover:text-white"
          >
            View Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">
          <PostList
            posts={filteredPosts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterDate={filterDate}
            onFilterDateChange={setFilterDate}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <PostForm onSubmit={handleSubmit} post={post} isSubmitting={isSubmitting} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
