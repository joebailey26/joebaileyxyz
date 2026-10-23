// The paginated post summaries for an index page, without the post content.
export default defineEventHandler((event) => getSection(event).map((page) => page.map(({ title, excerpt, slug, date, readingTime, acf }) => ({
  title,
  excerpt: { plain: excerpt.plain },
  slug,
  date,
  readingTime,
  acf
}))))
