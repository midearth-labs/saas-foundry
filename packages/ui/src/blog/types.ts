import { ReactNode } from 'react';

/**
 * Represents a blog post
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage?: string;
  publishedAt: Date;
  author?: {
    name: string;
    avatar?: string;
  };
}

export type BlogLink = (props: BlogLinkProps) => ReactNode;

interface BlogLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
};

/**
 * Props for customizing blog list layout
 */
export interface BlogListLayoutProps {
  /** Layout style for the blog list */
  layout?: 'grid' | 'list';
  /** Number of columns in grid layout */
  columns?: 1 | 2 | 3 | 4;
  /** Items per page */
  pageSize?: number;
}

/**
 * Props for the blog list component
 */
export interface BlogListProps extends BlogListLayoutProps {
  /** Array of blog posts */
  posts: BlogPost[];
  /** Current page number */
  currentPage?: number;
  /** Total number of posts (for pagination) */
  totalPosts?: number;
  /** Custom renderer for list items */
  renderItem?: (post: BlogPost) => ReactNode;
  /** Custom renderer for pagination */
  renderPagination?: (props: PaginationProps) => ReactNode;

  className?: string;

  linkGenerator: BlogLink;
}

/**
 * Props for the blog post component
 */
export interface BlogPostProps {
  /** Blog post data */
  post: BlogPost;
  /** Custom sections to render after the post content */
  sections?: {
    [key: string]: ReactNode;
  };
  /** Custom renderer for the post content */
  renderContent?: (content: string) => ReactNode;

  linkGenerator: BlogLink;
}

/**
 * Props for pagination component
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
} 