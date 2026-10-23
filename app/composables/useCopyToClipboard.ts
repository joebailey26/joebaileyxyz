import { onMounted } from '#imports'

class CopyToClipboard {
  container: HTMLElement
  notification: HTMLElement | null
  button: HTMLElement | null
  textToBeCopied: HTMLElement | null | undefined

  constructor (container: HTMLElement) {
    this.container = container
    this.notification = this.container.querySelector<HTMLElement>('.js-copy-to-clipboard-notification')
    this.button = this.container.querySelector<HTMLElement>('.js-copy-to-clipboard-button')
    this.textToBeCopied = this.container.parentElement?.querySelector<HTMLElement>('.js-copy-to-clipboard-target')

    this.button?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.textToBeCopied?.innerHTML ?? '')
      this.notification?.classList.add('copied')
      setTimeout(() => {
        this.notification?.classList.remove('copied')
      }, 2000)
    })
  }
}

// Wires up the copy buttons that the build adds to highlighted code blocks in post content.
export function useCopyToClipboard () {
  onMounted(() => {
    document.querySelectorAll<HTMLElement>('.js-copy-to-clipboard-container').forEach((element) => new CopyToClipboard(element))
  })
}
