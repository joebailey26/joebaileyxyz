// The feed types custom fields (cms/cms.config.json) as unknown; these read the Project details ones.
export const acfText = (value: unknown) => (typeof value === 'string' ? value : undefined)

export const acfList = (value: unknown) => (Array.isArray(value) && value.every((item): item is string => typeof item === 'string') ? value : undefined)
