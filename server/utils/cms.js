import { createError, getRouterParam } from 'h3'
import content from '#cms-content'

export function getSection (event) {
  const section = getRouterParam(event, 'section')
  if (!Object.hasOwn(content, section)) {
    throw createError({ statusCode: 404, statusMessage: 'Section not found' })
  }

  return content[section]
}
