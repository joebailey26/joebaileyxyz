// @torchlight-api/client ships no types. This covers what the build uses to highlight code blocks.
declare module '@torchlight-api/client' {
  export interface TorchlightConfig {
    theme?: string
    [option: string]: unknown
  }

  export interface BlockOptions {
    id?: string
    code: string
    language?: string | null
    theme?: string
  }

  export class Block {
    constructor (options: BlockOptions)
    id: string
    code: string
    language: string | null | undefined
    theme: string
    // Filled in by torchlight.highlight().
    highlighted: string | null
    classes: string | null
    styles: string | null
  }

  export class FileCache {
    constructor (options: { directory: string })
    get (key: string, fallback?: unknown): unknown
  }

  export function makeConfig (config?: string | TorchlightConfig): Promise<TorchlightConfig>

  export const torchlight: {
    init (config: TorchlightConfig, cache: FileCache, force?: boolean): void
    highlight (blocks: Block[]): Promise<Block[]>
  }
}
