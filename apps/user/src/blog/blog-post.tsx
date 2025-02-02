"use client";

import { DefaultBlogPost } from "@saas-foundry/ui/blog";
import { BLOG_POSTS } from "./blog-posts";
import "./styles2.css";
import { useParams } from "react-router";
import { CreateLink } from "./link-generator";


/*
interface BlogPostPageProps {
  slug: string;
}

/**
 * Generate static params for all blog posts at build time
 * /
export function generateStaticParamss() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate metadata for each blog post
 * /
export function generateMetadatas({ params }: BlogPostPageProps) {
  const post = BLOG_POSTS.find((post) => post.slug === params.slug);
  
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Blog`,
    description: post.description,
  };
}
*/

/**
 * Blog post page component that displays a single blog post
 */
export default function BlogPostPage() {
  const params = useParams()/* as BlogPostPageProps*/;
  const post = BLOG_POSTS.find((post) => post.slug === params.slug);

  if (!post) {
    return <div>Blog post not found</div>;
  }

  return (
    <div>
      Viterrrr based
      <DefaultBlogPost post={post} linkGenerator={CreateLink} />
    </div>
  );
}