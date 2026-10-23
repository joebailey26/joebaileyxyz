<template>
  <div>
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <h1 class="page-header__title" v-text="head.title" />
            <p class="page-header__description" v-text="head.description" />
          </div>
        </div>
      </div>
    </header>
    <main class="post-index">
      <div class="container ml-auto mr-auto">
        <section class="section">
          <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
              <div v-if="paginatedPosts" class="post-index__loop">
                <template v-for="post in paginatedPosts" :key="post.title">
                  <article v-if="post && post.slug" :id="post.slug" class="post-index__post" :class="{'post-index__post--with-date': shouldShowDates}">
                    <GalexiaDate
                      v-if="shouldShowDates"
                      class="post__date"
                      :date="post.date"
                      day-text-color="#ffffff"
                      day-background-color="var(--green)"
                      month-year-text-color="#ffffff"
                      month-year-background-color="var(--grey)"
                    />
                    <header class="post__header">
                      <h2 class="post__title">
                        <NuxtLink :to="`/blog/${post.slug}/`">
                          {{ post.title }}
                        </NuxtLink>
                      </h2>
                      <span class="post__read-time">{{ post.readingTime }} minute read</span>
                    </header>
                    <p class="post__content" v-text="post.excerpt.plain" />
                    <div class="post__buttons buttonsContainer">
                      <NuxtLink class="btn" :to="`/blog/${post.slug}/`">
                        Continue Reading
                      </NuxtLink>
                    </div>
                  </article>
                </template>
                <GalexiaPagination
                  :page-count="pageCount"
                  :current-page="currentPage"
                  :go-to-page="goToPage"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const head = {
  title: 'Blog',
  description: 'Some of my ramblings on tech, websites, and self-development.'
}

const route = useRoute()
const router = useRouter()
const { data: blog } = await useCmsIndex('blog')

const pageCount = computed(() => blog.value.length)
const currentPage = computed(() => {
  const p = route.params.page
  const page = Array.isArray(p) ? p[0] : p

  return page ? parseInt(page) : 1
})
const paginatedPosts = computed(() => blog.value[currentPage.value - 1])
const shouldShowDates = computed(() => {
  const latestPostDate = blog.value[0]?.[0]?.date
  if (!latestPostDate) {
    return false
  }
  const currentDate = new Date()
  const sixMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 6))

  return latestPostDate >= sixMonthsAgo || latestPostDate > currentDate
})

if (currentPage.value < 1 || currentPage.value > pageCount.value) {
  throw createError({ status: 404, message: 'Page not found', fatal: true })
}

usePageMeta({
  title: head.title,
  description: head.description,
  canonical: `https://joebailey.xyz/blog/${route.params.page ? `page/${route.params.page}/` : ''}`
})

function goToPage (page: number) {
  const path = page > 1 ? `/blog/page/${page}/` : '/blog/'
  router.push({ path })
}
</script>
