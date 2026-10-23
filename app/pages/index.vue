<template>
  <div>
    <header class="page-header page-header--with-image">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <picture class="page-header__image">
          <img
            src="/img/joe-bailey.jpg"
            decoding="async"
            loading="eager"
            fetchpriority="high"
            alt="Joe Bailey Portrait"
            width="150"
            height="150"
          >
        </picture>
        <div class="page-header__content">
          <h1 class="page-header__title">
            Hi, I’m Joe -<br>I make websites work
          </h1>
        </div>
      </div>
    </header>
    <main>
      <div class="container ml-auto mr-auto">
        <HomeProjects />
        <HomeBlog />
        <HomeContact />
      </div>
    </main>
  </div>
</template>

<script setup>
usePageMeta({
  title: 'Home'
})

useHead({
  link: [
    { rel: 'preload', as: 'image', href: '/img/joe-bailey.jpg' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        email: 'joe@joebailey.xyz',
        image: 'https://joebailey.xyz/img/joe-bailey.jpg',
        jobTitle: 'Software Engineer',
        name: 'Joe Bailey',
        birthPlace: 'Cambridge, UK',
        birthDate: '2000-06-02',
        gender: 'male',
        nationality: 'English',
        telephone: '+44 7477737535',
        url: 'https://joebailey.xyz',
        sameAs: [
          'https://www.linkedin.com/in/joe-bailey-b68b17171/',
          'https://twitter.com/JoeBailey26',
          'https://www.behance.net/joebailey26',
          'https://github.com/joebailey26',
          'https://codepen.io/joebailey26'
        ]
      })
    }
  ]
})
</script>
