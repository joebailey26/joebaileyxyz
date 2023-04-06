import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFacebook, faTwitter, faWhatsapp, faLinkedin, faGithub, faGoogle, faPhp, faVuejs, faReact, faWordpress, faFigma } from '@fortawesome/free-brands-svg-icons'
import { faFileCode, faCloud, faPenNib, faBook, faShareAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faShareAlt, faFacebook, faTwitter, faWhatsapp, faLinkedin, faGithub, faGoogle, faPhp, faVuejs, faReact, faWordpress, faFigma, faFileCode, faCloud, faPenNib, faBook)

Vue.component('FontAwesomeIcon', FontAwesomeIcon)
