<template>
  <div>
    <header class="page-header page-header--with-image">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <img class="page-header__image" :src="require('~/assets/img/joe-bailey.jpg?format=webp&resize&size=200')" width="150" alt="Joe Bailey Portrait">
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
  head () {
    return {
      title: 'Home',
      meta: [
        { hid: 'description', name: 'description', content: 'I deliver great websites, applications, and experiences. I’m passionate about a privacy-first internet where everyone can feel safe. I code in VueJS and like to keep things front-end, utilising Netlify wherever possible. I have a thorough understanding of PHP to call on when working with WordPress sites.' },
        { hid: 'og:title', property: 'og:title', content: 'Home' },
        { hid: 'og:description', property: 'og:description', content: 'I deliver great websites, applications, and experiences. I’m passionate about a privacy-first internet where everyone can feel safe. I code in VueJS and like to keep things front-end, utilising Netlify wherever possible. I have a thorough understanding of PHP to call on when working with WordPress sites.' },
        { hid: 'twitter:title', name: 'twitter:title', content: 'Home' },
        { hid: 'twitter:description', name: 'twitter:description', content: 'I deliver great websites, applications, and experiences. I’m passionate about a privacy-first internet where everyone can feel safe. I code in VueJS and like to keep things front-end, utilising Netlify wherever possible. I have a thorough understanding of PHP to call on when working with WordPress sites.' }
      ]
    }
  }
}
</script>
