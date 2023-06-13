import { load } from 'cheerio'
import he from 'he'
import { makeConfig, Block, torchlight, FileCache } from '@torchlight-api/client'

export async function syntaxHighlightCodeWithTorchlight (postContent) {
  const regex = /<pre.*?>/g
  const matches = postContent.match(regex)
  if (!matches) {
    return postContent
  }
  const $ = load(postContent, null, false)
  $('pre').removeClass('wp-block-code')

  torchlight.init(
    await makeConfig({
      theme: 'dark-plus'
    }),
    new FileCache({
      directory: './.torchlight-cache'
    })
  )
  const torchlightBlocks = []

  // Highlight all code
  $('pre code').each((i, code) => {
    const $code = $(code)
    let language = $code.parent().attr('class').split(' ').find((className) => className.startsWith('language-')) || null
    // Code block has a class starting with "language-"
    if (language) {
      language = language.replace('language-', '')
      $code.parent().attr('data-language', language)
    }
    const torchlightBlock = new Block({
      code: he.decode($code.html()),
      language
    })
    torchlightBlocks.push(torchlightBlock)
    $code.attr('data-torchlight-id', torchlightBlock.id) // Set data-torchlight-id attribute to retrieve later
  })
  // Process all blocks together and get the highlighted code
  const highlightedBlocks = await torchlight.highlight(torchlightBlocks)

  // Replace code blocks with highlighted code
  highlightedBlocks.forEach((highlightedBlock) => {
    const $code = $(`pre code[data-torchlight-id="${highlightedBlock.id}"]`)

    $code.parent().addClass(highlightedBlock.classes)

    $code.html(highlightedBlock.highlighted)

    $(`
    <div class="copy-button__container js-copy-to-clipboard-container">
      <div class="copy-button__text js-copy-to-clipboard-notification">Copied!</div>
      <button
        type="button"
        title="Copy to clipboard"
        class="copy-button__button js-copy-to-clipboard-button"
      >
      </button>
    </div>
    <span class="torchlight-copy-target js-copy-to-clipboard-target" style="display: none">${he.encode(highlightedBlock.code)}</span>
    `).appendTo($code.parent())
  })
  // Return the blog post html
  return $.html()
}
