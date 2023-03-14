
/**
 * https://destroytoday.com/blog/100vw-and-the-horizontal-overflow-you-probably-didnt-know-about
 * "If you use width: 100vw on a website, there’s a good chance the horizontal scrollbar is visible for many users.
 * Setting an element’s width to 100vw does tell the browser to span the entire viewport width, but what is considered
 * the viewport? Many assume that width: 100vw is the same as width: 100%. This is true on a page that doesn’t scroll
 * vertically, but what you might not realize is that the viewport actually includes the scrollbars, too.
 * This isn’t a problem for anyone using a touch device or trackpad, where the scroll indicator overlays the content,
 * but for folks who keep the vertical scrollbar visible, your website is busted."
 *
 * This class sets a CSS variable "--scrollbar-width" that's equal to the width of the scrollbar, allowing you to
 * calculate 100% of the screen's width accurately
 */
class ScrollbarWidth {
  constructor () {
    this.width = window.innerWidth - document.documentElement.clientWidth
    this.oldWidth = null
    this.ticking = false

    this.update()

    window.addEventListener('resize', () => {
      this.width = window.innerWidth - document.documentElement.clientWidth

      if (this.oldWidth === this.width) {
        return
      }

      this.requestTick()
    })
  }

  requestTick () {
    if (this.ticking) {
      return
    }

    requestAnimationFrame(() => {
      this.update()
    })

    this.ticking = true
  }

  update () {
    document.documentElement.style.setProperty('--scrollbar-width', `${this.width}px`)

    this.oldWidth = this.width
    this.ticking = false
  }
}
// eslint-disable-next-line no-new
new ScrollbarWidth()
