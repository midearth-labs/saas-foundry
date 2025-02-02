import { BlogPostProps } from '../../types';
import ReactMarkdown from 'react-markdown';

/**
 * Base headless component for blog post
 * Provides core functionality without styling
 */
export function BaseBlogPost({
  post,
  sections = {},
  renderContent,
}: BlogPostProps) {
  // Default content renderer using ReactMarkdown
  const defaultRenderContent = (content: string) => (
    <ReactMarkdown>{content}</ReactMarkdown>
  );

  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        {post.author && (
          <div>
            {post.author.avatar && (
              <img src={post.author.avatar} alt={post.author.name} />
            )}
            <span>{post.author.name}</span>
          </div>
        )}
        <time dateTime={post.publishedAt.toISOString()}>
          {post.publishedAt.toLocaleDateString()}
        </time>
      </header>

      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} />
      )}

      <div>
        {renderContent ? renderContent(post.content) : defaultRenderContent(post.content)}
      </div>

      {/* Render custom sections */}
      {Object.entries(sections).map(([key, component]) => (
        <section key={key}>{component}</section>
      ))}
    </article>
  );
} 