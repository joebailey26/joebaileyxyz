import type { CmsFeedPost, CmsSection } from '../shared/types/cms'

interface FetchCmsContentOptions {
  baseUrl: string | undefined
  token: string | undefined
  fetchImpl: typeof fetch
  perPage?: number
}

declare const cmsContent: {
  fetchCmsContent (options: FetchCmsContentOptions): Promise<Record<CmsSection, CmsFeedPost[][]>>
}

export = cmsContent
