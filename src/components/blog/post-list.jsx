'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Search, Filter, X, Globe, Timer, Edit2, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker } from '@/components/ui/date-picker';
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
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function PostList({
  posts,
  onEdit,
  onDelete,
  searchTerm,
  onSearchChange,
  filterDate,
  onFilterDateChange,
}) {
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = posts.filter((post) => {
    const titleMatch = searchTerm
      ? post.title.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const postDate = post.published_at ? parseISO(post.published_at) : null;
    const matchesDate = !filterDate || (postDate && format(postDate, 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd'));
    return titleMatch && matchesDate;
  });

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Card className="bg-white border-primary-100">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search posts by title or tags..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Filter className="text-muted-foreground w-5 h-5" />
                </TooltipTrigger>
                <TooltipContent>Filter posts by date</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex gap-2">
              <DatePicker
                date={filterDate}
                onSelect={(newDate) => onFilterDateChange(newDate)}
                className="w-[200px]"
              />
              {filterDate && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onFilterDateChange(null)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 gap-6 p-1">
            {paginatedPosts.map((post) => {
              const postDate = post.published_at ? parseISO(post.published_at) : null;

              return (
                <div key={post.id} className="group">
                  <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-primary-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-[300px] h-[200px] relative rounded-lg overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="absolute inset-0 object-cover w-full h-full transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {postDate <= new Date() ? (
                                <Badge className="bg-primary-500 hover:bg-primary-600">
                                  <Globe className="w-3 h-3 mr-1" />
                                  Live
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary-100 text-primary-700 hover:bg-primary-200"
                                >
                                  <Timer className="w-3 h-3 mr-1" />
                                  Scheduled
                                </Badge>
                              )}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {format(postDate, 'MMM dd, yyyy')}
                              </div>
                              {post.updatedAt && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  Updated: {format(parseISO(post.updatedAt), 'MMM dd, yyyy')}
                                </div>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-primary-50 text-primary-600 hover:bg-primary-100 border-primary-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end mt-4">
                            <Button
                              variant="outline"
                              className="border-primary-200 hover:bg-primary-50 hover:text-primary-600"
                              onClick={() => onEdit(post)}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Post
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Post
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this post? This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(post.id)}
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
                </div>
              );
            })}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="space-y-4">
                  <Search className="w-12 h-12 mx-auto text-primary-200" />
                  <p className="text-lg">
                    No posts found for the selected filters
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-between px-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
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
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
