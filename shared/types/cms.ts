export type CmsSection = 'blog' | 'projects'

/* eslint-disable @typescript-eslint/naming-convention -- these field names come from the CMS payload */
export interface PostAcf {
  icons?: string[]
  project_url?: string
  github?: string
}

export interface PostExcerpt {
  raw: string
  plain: string
}

// A post as the CMS feed delivers it, in the shape that WordPress used.
export interface CmsFeedPost {
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  slug: string
  date: string
  acf: PostAcf | null | undefined
  featured_media: number | string | undefined
  featured_media_url: string | undefined
}

/* eslint-enable @typescript-eslint/naming-convention */

// A post as the CMS content is stored at build time and served by server/routes/_content.
export interface Post {
  title: string
  excerpt: PostExcerpt
  slug: string
  rawDate: string
  // An ISO string, because the content is serialised as JSON.
  date: string
  content: string
  readingTime: number
  acf: PostAcf | null | undefined
  featuredMedia: string | null
}

// What the index route returns: a post without its content.
export interface PostSummary extends Pick<Post, 'title' | 'slug' | 'date' | 'readingTime' | 'acf'> {
  excerpt: Pick<PostExcerpt, 'plain'>
}

// Both sections, split into the pages that the site paginates by.
export type CmsContent = Record<CmsSection, Post[][]>

// The app turns the ISO date back into a Date.
export type WithDate<T extends { date: string }> = Omit<T, 'date'> & { date: Date }
