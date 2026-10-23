import { createError, getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import content from '#cms-content'

const isSection = (section: string | undefined): section is CmsSection => !!section && Object.hasOwn(content, section)

export function getSection (event: H3Event) {
  const section = getRouterParam(event, 'section')
  if (!isSection(section)) {
    throw createError({ statusCode: 404, statusMessage: 'Section not found' })
  }

  return content[section]
}
