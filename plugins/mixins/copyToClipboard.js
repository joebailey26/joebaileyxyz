import Vue from 'vue'

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
export function registerCopyToClipboardContainers () {
  document.querySelectorAll('.js-copy-to-clipboard-container').forEach((element) => {
    return new CopyToClipboard(element)
  })
}

Vue.mixin({
  methods: {
    registerCopyToClipboardContainers
  }
})
