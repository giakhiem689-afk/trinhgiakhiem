import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { profile } from '../data/profile';

export async function GET(context: any) {
  const blog = await getCollection('blog');
  
  return rss({
    title: `Blog | ${profile.name}`,
    description: profile.tagline,
    site: context.site,
    items: blog
      .filter((post) => !post.data.draft)
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.publishedDate,
        description: post.data.description,
        link: `/bai-viet/${post.id}/`,
      })),
    customData: `<language>vi-vn</language>`,
  });
}
