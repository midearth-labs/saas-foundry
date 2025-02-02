# Blog Components

A flexible, headless blog component system for SAASFoundry with default styled implementations.

## Features

- Headless components with default styling
- Markdown support
- Customizable layouts (grid/list)
- Extension points for custom sections
- Responsive design
- Dark mode support

## Installation

The blog components are part of the `@saas-foundry/ui` package. Make sure to import the styles:

```tsx
import '@saas-foundry/ui/styles.css';
```

## Basic Usage

### Blog List

```tsx
import { BlogList } from '@saas-foundry/ui/blog';

function MyBlogList() {
    const posts = [
    {
        id: '1',
        title: 'Getting Started with SAASFoundry',
        slug: 'getting-started',
        description: 'Learn how to build your SaaS with SAASFoundry',
        content: '# Getting Started...',
        publishedAt: new Date(),
        author: {
            name: 'John Doe',
            avatar: '/avatar.jpg'
        }
    }
    // ... more posts
    ];
    return (
        <BlogList
            posts={posts}
            layout="grid"
            columns={2}
            pageSize={10}
        />
    );
}
```

### Blog Post

```tsx
import { BlogPost } from '@saas-foundry/ui/blog';

function MyBlogPost() {
  const post = {
    id: '1',
    title: 'Getting Started with SAASFoundry',
    slug: 'getting-started',
    description: 'Learn how to build your SaaS with SAASFoundry',
    content: '# Getting Started...',
    publishedAt: new Date(),
    author: {
      name: 'John Doe',
      avatar: '/avatar.jpg'
    }
  };

  // Example of adding custom sections
  const customSections = {
    comments: <CommentsSection postId={post.id} />,
    relatedPosts: <RelatedPosts currentPostId={post.id} />
  };

  return (
    <BlogPost 
      post={post}
      sections={customSections}
    />
  );
}
```

## Customization

### Custom List Item Rendering

```tsx
import { BlogList } from '@saas-foundry/ui/blog';

function CustomBlogList() {
  const renderItem = (post) => (
    <div key={post.id} className="custom-post-card">
      <h2>{post.title}</h2>
      {/* Custom layout */}
    </div>
  );

  return (
    <BlogList 
      posts={posts}
      renderItem={renderItem}
    />
  );
}
```

### Custom Content Rendering

```tsx
import { BlogPost } from '@saas-foundry/ui/blog';
import CustomMarkdownRenderer from './custom-markdown';

function CustomBlogPost() {
  const renderContent = (content) => (
    <CustomMarkdownRenderer>
      {content}
    </CustomMarkdownRenderer>
  );

  return (
    <BlogPost 
      post={post}
      renderContent={renderContent}
    />
  );
}
```

### Using Base Components

For complete control over styling, use the base headless components:

```tsx
import { BaseBlogList, BaseBlogPost } from '@saas-foundry/ui/blog';

function CustomBlogComponents() {
  return (
    <div className="custom-container">
      <BaseBlogList
        posts={posts}
        renderItem={customRenderItem}
        renderPagination={customPagination}
      />
    </div>
  );
}
```

## TypeScript Support

All components are fully typed. Import types directly:

```tsx
import type { BlogPost, BlogListProps, BlogPostProps } from '@saas-foundry/ui/blog';
```

## Styling

The default implementation uses Tailwind CSS with the @tailwindcss/typography plugin for markdown content. You can override styles using Tailwind's configuration or by providing custom class names through the `className` prop.

## Dark Mode

The blog components support dark mode out of the box. The default styles are designed to be compatible with a dark mode system.

## Responsive Design

The components are responsive and will adapt to different screen sizes. The default grid layout will adjust the number of columns based on the screen width.

## Extension Points

You can extend the components by providing custom sections or content renderers. This allows you to integrate with your existing content management system or add additional features.

## Customization

### Custom List Item Rendering

```tsx
import { BlogList } from '@saas-foundry/ui/blog';

function CustomBlogList() {
  const renderItem = (post) => (
    <div key={post.id} className="custom-post-card">
      <h2>{post.title}</h2> 
      <p>{post.description}</p>
      <p>{post.publishedAt.toLocaleDateString()}</p>
      <p>{post.author.name}</p>
    </div>
  );

  return (  
    <BlogList
      posts={posts}
      renderItem={renderItem}
    />
  );
}
```

### Custom Content Rendering

```tsx
import { BlogPost } from '@saas-foundry/ui/blog';
import CustomMarkdownRenderer from './custom-markdown';

function CustomBlogPost() {
  const renderContent = (content) => (
    <CustomMarkdownRenderer>
      {content}
    </CustomMarkdownRenderer>
  );

  return (
    <BlogPost post={post} renderContent={renderContent} />
  );
}
```

### Using Base Components

For complete control over styling, use the base headless components:

```tsx
import { BaseBlogList, BaseBlogPost } from '@saas-foundry/ui/blog';

function CustomBlogComponents() {
  return (
    <div className="custom-container">
      <BaseBlogList
        posts={posts}
        renderItem={customRenderItem}
        renderPagination={customPagination}
      />
    </div>
  );
}
```
