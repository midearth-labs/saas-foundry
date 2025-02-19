import { useState, useCallback, useMemo, useEffect } from 'react';
import { DataSourceConfig, PaginationState, PaginationInfo, BlogPost } from '../types';
  
  export function useBlogPosts(config: DataSourceConfig) {
    const [pagination, setPagination] = useState<PaginationState>({
      page: 1,
      pageSize: 10,
      totalItems: 0,
    });
    
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      isFirstPage: true,
      isLastPage: true,
    });
    
    const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
    const [searchCategories, setSearchCategories] = useState<string[] | undefined>(undefined);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    //@todo: check if this will work better for fetchPosts memoization const fetchPostsImpl = config.fetchPosts;

    const filters = useMemo(
      () => ({ search: searchQuery, categories: searchCategories }),
      [searchQuery, searchCategories]
    );
  
    const fetchPosts = useCallback(async () => {
      try {
        setLoading(true);
        const result = await config.fetchPosts({ pagination, filters });
        setPosts(result.posts);
        setPagination(prev => ({ ...prev, totalItems: result.total }));
        setPaginationInfo(result.paginationInfo);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
      } finally {
        setLoading(false);
      }
    }, [pagination, filters, config.fetchPosts]);

    useEffect(() => {
      fetchPosts();
    }, []);
  
    const goToPage = useCallback((page: number) => {
      setPagination(prev => ({ ...prev, page }));
    }, []);
  
    const onSearch = useCallback((term: string | undefined) => {
      setSearchQuery(term);
    }, []);
  
    const onCategoryFilter = useCallback((categories: string[] | undefined) => {
      setSearchCategories(categories);
    }, []);
  
    return {
      posts,
      pagination,
      paginationInfo,
      searchQuery,
      searchCategories,
      loading,
      error,
      setPagination,
      onSearch,
      onCategoryFilter,
      goToPage,
      refresh: fetchPosts,
    };
  }
  
  export type BlogPostsState = ReturnType<typeof useBlogPosts>;