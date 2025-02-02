import { cn } from '../../../utils/cn';
import { BlogListProps, BlogPost, PaginationProps } from '../../types';
import { BaseBlogList } from '../base/blog-list';

/**
 * Default styled blog list implementation
 * Uses Tailwind CSS for styling
 */
export function BlogList({ layout = 'list', columns = 2, className, linkGenerator, ...props }: BlogListProps) {
  const renderItem = (post: BlogPost) => (
    <article
      key={post.id}
      className={cn(
        'group relative flex flex-col space-y-2',
        'rounded-lg border p-6 hover:border-foreground/20',
        className
      )}
    >
      {post.coverImage && (
        <div className="aspect-video overflow-hidden rounded-lg">
          <img
            src={post.coverImage}
            alt=""
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      
      <h2 className="text-2xl font-bold">
      {linkGenerator({ href: `/blog/${post.slug}`, children: post.title })}</h2>
      
      {post.author && (
        <div className="flex items-center space-x-2">
          {post.author.avatar && (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-8 w-8 rounded-full"
            />
          )}
          <span className="text-sm text-muted-foreground">{post.author.name}</span>
        </div>
      )}
      
      <p className="text-muted-foreground">{post.description}</p>
      
      <div className="flex items-center justify-between">
        <time className="text-sm text-muted-foreground">
          {new Date(post.publishedAt).toLocaleDateString()}
        </time>
        {linkGenerator({ href: `/blog/${post.slug}`, children: "Read more →", className: "text-sm font-medium hover:underline" })}
      </div>
    </article>
  );

  const renderPagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-center space-x-2 py-4"
    >
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md',
            'text-sm font-medium transition-colors',
            currentPage === i + 1
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {i + 1}
        </button>
      ))}
    </nav>
  );

  return (
    <div
      className={cn(
        'container mx-auto',
        layout === 'grid' && 'grid gap-6',
        layout === 'grid' && {
          'grid-cols-1': columns === 1,
          'grid-cols-2': columns === 2,
          'grid-cols-3': columns === 3,
          'grid-cols-4': columns === 4,
        }
      )}
    >
      <BaseBlogList
        {...props}
        linkGenerator={linkGenerator}
        renderItem={renderItem}
        renderPagination={renderPagination}
      />
    </div>
  );
} 