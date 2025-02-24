
export interface BlogPost {
    id: string;
    title: string;
    content: string;
    slug: string;
    blurb: string;
    author: {
        name: string;
        avatar: string;
    };
    coverImage?: string;
    categories?: string[];
    publishedAt: Date;
  }
  
  export interface PaginationState {
    page: number;
    pageSize: number;
    totalItems: number;
  }
  
  export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
  }
  
  export interface FilterState {
    search?: string;
    categories?: string[];
  }
  
  export interface DataSourceConfig {
    fetchPosts: (params: {
      pagination: PaginationState;
      filters: FilterState;
    }) => Promise<{ 
      posts: BlogPost[]; 
      total: number;
      paginationInfo: PaginationInfo;
    }>;
  }
  