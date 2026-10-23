class CopyToClipboard {
  constructor (container) {
    this.container = container
    this.notification = this.container.querySelector('.js-copy-to-clipboard-notification')
    this.button = this.container.querySelector('.js-copy-to-clipboard-button')
    this.textToBeCopied = this.container.parentElement.querySelector('.js-copy-to-clipboard-target')

    this.button.addEventListener('click', () => {
      navigator.clipboard.writeText(this.textToBeCopied.innerHTML)
      this.notification.classList.add('copied')
      setTimeout(() => {
        this.notification.classList.remove('copied')
      }, 2000)
    })
  }
}

// Wires up the copy buttons that the build adds to highlighted code blocks in post content.
export function useCopyToClipboard () {
  onMounted(() => {
    document.querySelectorAll('.js-copy-to-clipboard-container').forEach((element) => new CopyToClipboard(element))
  })
}
