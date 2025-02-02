"use client";

import { BLOG_POSTS } from "./blog-posts";
import { DefaultBlogList } from "@saas-foundry/ui/blog";
import "./styles2.css";
import { CreateLink } from "./link-generator";
/*
export const metadata = {
  title: "Store | Kitchen Sink",
};
*/

export default function BlogPage() {
  return (
    <div>
      Viteeee based
      <DefaultBlogList posts={BLOG_POSTS} linkGenerator={CreateLink} />
    </div>
  );
}
