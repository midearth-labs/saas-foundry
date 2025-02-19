import { useBlogPosts, createStaticDataSource } from '@/headless/blog';
import { CustomizableBlogList } from '.';

const staticDataSource = createStaticDataSource([
  { id: '1', title: 'First Post', content: 'Content... Lorem Ipsum Stuff', slug: 'first-post', blurb: 'Blurb...', author: { name: 'John Doe', avatar: 'https://via.placeholder.com/150' }, publishedAt: new Date() },
  // ... more posts
]);

export function BlogPage() {
  const blogState = useBlogPosts(staticDataSource);
  
  return (
    <div className="container mx-auto py-8">
      <CustomizableBlogList
        {...blogState}
        topSection={<h1 className="text-3xl font-bold">My Blog</h1>}
      />
    </div>
  );
}
