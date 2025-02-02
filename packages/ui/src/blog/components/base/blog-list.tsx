import { BlogListProps, BlogPost, PaginationProps } from '../../types';

/**
 * Base headless component for blog list
 * Provides core functionality without styling
 */
export function BaseBlogList({
  posts,
  currentPage = 1,
  totalPosts = 0,
  pageSize = 10,
  renderItem,
  renderPagination,
}: BlogListProps) {
  const totalPages = Math.ceil(totalPosts / pageSize);

  // Default item renderer
  const defaultRenderItem = (post: BlogPost) => (
    <div key={post.id}>
      <h2>{post.title}</h2>
      <p>{post.description}</p>
    </div>
  );

  // Default pagination renderer
  const defaultRenderPagination = ({ totalPages, onPageChange }: PaginationProps) => (
    <div>
      {Array.from({ length: totalPages }, (_, i) => (
        <button key={i + 1} onClick={() => onPageChange(i + 1)}>
          {i + 1}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div role="feed" aria-label="Blog posts">
        {posts.map((post) => (renderItem ? renderItem(post) : defaultRenderItem(post)))}
      </div>
      {totalPages > 1 &&
        (renderPagination
          ? renderPagination({
              currentPage,
              totalPages,
              onPageChange: (page) => console.log('Page changed:', page),
            })
          : defaultRenderPagination({
              currentPage,
              totalPages,
              onPageChange: (page) => console.log('Page changed:', page),
            }))}
    </div>
  );
} 