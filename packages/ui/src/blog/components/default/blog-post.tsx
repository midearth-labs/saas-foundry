import ReactMarkdown from 'react-markdown';
import { cn } from '../../../utils/cn';
import { BlogPostProps } from '../../types';
import { BaseBlogPost } from '../base/blog-post';

/**
 * Default styled blog post implementation
 * Uses Tailwind CSS for styling
 */
export function BlogPost({ className, linkGenerator, ...props }: BlogPostProps & { className?: string }) {
  // Custom markdown content renderer with Tailwind styles
  const renderContent = (content: string) => (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold tracking-tight">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-6 border-l-2 pl-6 italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className={cn('container mx-auto py-10', className)}>
      <BaseBlogPost
        {...props}
        linkGenerator={linkGenerator}
        renderContent={renderContent}
      />
      <div className="mt-8">
       {linkGenerator({ href: "/blog", children: "← Back to blog", className: "text-sm font-medium hover:underline" })}
      </div>
    </div>
  );
} 