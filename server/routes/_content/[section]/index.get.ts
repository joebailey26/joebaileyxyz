import { defineEventHandler } from 'h3'
import { getSection } from '../../../utils/cms'

// The paginated post summaries for an index page, without the post content.
export default defineEventHandler((event): PostSummary[][] => getSection(event).map((page) => page.map(({ title, excerpt, slug, date, readingTime, acf }) => ({
  title,
  excerpt: { plain: excerpt.plain },
  slug,
  date,
  readingTime,
  acf
}))))
