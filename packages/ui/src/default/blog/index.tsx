import { useCustomized } from "../utilities/use-customized.tsx";

import { Card, CardContent } from "@/shadcn/components/ui/card.tsx";
import { Input } from "@/shadcn/components/ui/input.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { BlogPostsState } from '@/headless/blog';

export function DefaultBlogList({
    posts,
    loading,
    error,
    paginationInfo,
    goToPage,
    onSearch,
    refresh,
  }: Pick<BlogPostsState, 'posts' | 'loading' | 'error' | 'paginationInfo' | 'goToPage' | 'onSearch' | 'refresh'>) {
    return (
      <div className="space-y-4">
        <Input
          className="w-full mb-4"
          placeholder="Search posts..."
          onChange={(e) => onSearch(e.target.value)}
        />
        <button onClick={() => refresh()}>Search</button>
        
        {error && (
          <div className="text-red-500 p-4 rounded bg-red-50">
            {error.message}
          </div>
        )}
        
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-600">{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex justify-center gap-2 mt-4">
          {!paginationInfo.isFirstPage && (
            <Button 
              variant="outline" 
              onClick={() => goToPage(1)}
              className="px-3 py-2"
            >
              Back to First
            </Button>
          )}
          
          {paginationInfo.hasPreviousPage && (
            <Button 
              variant="outline" 
              onClick={() => { goToPage(paginationInfo.currentPage - 1); refresh(); }}
              className="px-3 py-2"
            >
              Previous
            </Button>
          )}
          
          <span className="px-3 py-2 border rounded">
            Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
          </span>
          
          {paginationInfo.hasNextPage && (
            <Button 
              variant="outline" 
              onClick={() => { goToPage(paginationInfo.currentPage + 1); refresh(); }}
              className="px-3 py-2"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Create the customizable version
  export const CustomizableBlogList = useCustomized(DefaultBlogList);