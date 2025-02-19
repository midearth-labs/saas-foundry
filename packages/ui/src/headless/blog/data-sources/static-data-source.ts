import { BlogPost, DataSourceConfig, FilterState, PaginationInfo } from "../types";


export const createStaticDataSource = (staticPosts: BlogPost[]): DataSourceConfig => {
    let lastFilters: FilterState | undefined;
    // Cache for storing filtered results based on filter state
    let cachedFilteredPosts: BlogPost[] | undefined;

    return {
        fetchPosts: async ({ pagination, filters }) => {
        let filtered: BlogPost[];
        
        // Check if we can use cached results
        if (filters == lastFilters && cachedFilteredPosts) {
            filtered = cachedFilteredPosts;
        } else if ((filters.search && filters.search.length > 0) || 
            (filters.categories && filters.categories.length > 0)) {
            filtered = [...staticPosts];
        
            if (filters.search) {
                const search = filters.search.toLowerCase();
                filtered = filtered.filter(post => 
                    post.title.toLowerCase().includes(search) ||
                    post.content.toLowerCase().includes(search)
                );
            }

            if (filters.categories) {
                filtered = filtered.filter(post => 
                    post.categories?.some(category => filters.categories!.includes(category))
                );
            }

            // Cache will be updated after all filters are applied
            lastFilters = filters;
            cachedFilteredPosts = filtered;
        } else {
            filtered = staticPosts;
        }
        console.log("filtered", filtered);
        
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / pagination.pageSize);
        const currentPage = pagination.page;
        
        const start = (currentPage - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        
        const paginationInfo: PaginationInfo = {
            currentPage,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
            isFirstPage: currentPage === 1,
            isLastPage: currentPage === totalPages
        };
        
        return {
            posts: filtered.slice(start, end),
            total: totalItems,
            paginationInfo,
        };
        },
  }
};