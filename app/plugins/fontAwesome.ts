import { config, library } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import {
  faLinkedin,
  faGithub,
  faGoogle,
  faPhp,
  faVuejs,
  faReact,
  faWordpress,
  faFigma,
  faFacebook,
  faTwitter,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons'
import {
  faFileCode,
  faCloud,
  faPenNib,
  faBook,
  faLongArrowAltLeft,
  faLongArrowAltRight,
  faPlus,
  faShareAlt
} from '@fortawesome/free-solid-svg-icons'
import { faHandPointLeft } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { defineNuxtPlugin } from '#imports'

// The stylesheet is bundled above, so server-rendered icons are sized before hydration.
config.autoAddCss = false

library.add(
  faLinkedin,
  faGithub,
  faGoogle,
  faPhp,
  faVuejs,
  faReact,
  faWordpress,
  faFigma,
  faFacebook,
  faTwitter,
  faWhatsapp,
  faFileCode,
  faCloud,
  faPenNib,
  faBook,
  faLongArrowAltLeft,
  faLongArrowAltRight,
  faHandPointLeft,
  faPlus,
  faShareAlt
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})
