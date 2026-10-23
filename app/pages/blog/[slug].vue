<template>
  <div v-if="post">
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <div class="navigation-index">
              <NuxtLink :to="'/blog/'" class="navigation-index__link">
                <font-awesome-icon :icon="['fa-regular', 'fa-hand-point-left']" class="navigation-link__icon" />
                Back to blog
              </NuxtLink>
            </div>
            <h1 class="page-header__title" v-text="post.title" />
            <p class="page-header__description">
              <span>Published </span><time :datetime="post.date.toISOString().substring(0, 10)" v-text="`${post.date.getDate()} ${months[post.date.getMonth()]} '${post.date.getFullYear().toString().substring(2)}`" />
            </p>
          </div>
        </div>
      </div>
    </header>
    <main class="post-single">
      <div class="container ml-auto mr-auto">
        <section class="section">
          <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
              <article>
                <div class="post__content" v-html="post.content" />
                <div v-if="post.acf && (post.acf.project_url || post.acf.github)" class="post__buttons buttonsContainer">
                  <a v-if="post.acf.project_url" class="btn" :href="post.acf.project_url">View project</a>
                  <a v-if="post.acf.github" class="btn" :href="post.acf.github">View repo</a>
                </div>
                <ClientOnly>
                  <GalexiaShare :title="fullTitle(post.title)" :description="post.excerpt.plain" />
                </ClientOnly>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
    <div class="container ml-auto mr-auto">
      <div class="row">
        <div class="col-md-8 ml-auto mr-auto">
          <PostsNavigation post-type="blog" next-post-text="Next Blog Post" previous-post-text="Previous Blog Post" :show-post-name="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const route = useRoute()
const post = await useCmsPost('blog', route.params.slug)

usePageMeta({
  title: () => post.value.title,
  description: () => post.value.excerpt.plain || undefined,
  image: () => post.value.featuredMedia || undefined,
  canonical: `https://joebailey.xyz/blog/${route.params.slug}/`
})
useCopyToClipboard()
</script>
