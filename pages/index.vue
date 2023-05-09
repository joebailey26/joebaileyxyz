<template>
  <div>
    <header class="page-header page-header--with-image">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <GalexiaImage
          class="page-header__image"
          :avif="avifImage"
          :webp="require('~/assets/img/joe-bailey.jpg?format=webp&resize&size=150')"
          :src="require('~/assets/img/joe-bailey.jpg?size=150')"
          width="150"
          loading="eager"
          fetchpriority="high"
          alt="Joe Bailey Portrait"
        />
        <div class="page-header__content">
          <h1 class="page-header__title">
            Hi, I’m Joe -<br>I make websites work
          </h1>
        </div>
      </div>
    </header>
    <main>
      <div class="container ml-auto mr-auto">
        <Projects />
        <Blog />
        <Contact />
      </div>
    </main>
  </div>
</template>

<script>
import Projects from '~/components/home/projects'
import Blog from '~/components/home/blog'
import Contact from '~/components/home/contact'

export default {
  components: {
    Projects,
    Blog,
    Contact
  },
  data () {
    return {
      avifImage: require('~/assets/img/joe-bailey.jpg?format=avif&resize&size=150'),
      head: {
        title: 'Home',
        description: 'I deliver great websites, applications, and experiences. I’m passionate about a privacy-first internet where everyone can feel safe. I code in VueJS and like to keep things front-end, utilising Netlify wherever possible. I have a thorough understanding of PHP to call on when working with WordPress sites.'
      }
    }
  },
  head () {
    return {
      title: this.head.title,
      meta: [
        { hid: 'description', name: 'description', content: this.head.description },
        { hid: 'og:title', property: 'og:title', content: this.head.title },
        { hid: 'og:description', property: 'og:description', content: this.head.description },
        { hid: 'twitter:title', name: 'twitter:title', content: this.head.title },
        { hid: 'twitter:description', name: 'twitter:description', content: this.head.description }
      ],
      link: [
        { rel: 'preload', as: 'image', href: this.avifImage }
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: [
        {
          innerHTML: `{
            "@context": "https://schema.org",
              "@type": "Person",
              "email": "joe@joebailey.xyz",
              "image": "https://joebailey.xyz/img/joe-bailey.jpg",
              "jobTitle": "Front-End Web Developer",
              "name": "Joe Bailey",
              "birthPlace": "Cambridge, UK",
              "birthDate": "2000-06-02",
              "gender": "male",
              "nationality": "English",
              "telephone": "+44 7477737535",
              "url": "https://joebailey.xyz",
              "sameAs" : [ "https://www.linkedin.com/in/joe-bailey-b68b17171/",
              "https://twitter.com/JoeBailey26",
              "https://www.behance.net/joebailey26",
              "https://github.com/joebailey26",
              "https://codepen.io/joebailey26"]
          }`,
          type: 'application/ld+json'
        }
      ]
    }
  }
}
</script>
