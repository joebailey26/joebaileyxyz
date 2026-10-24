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
                <template v-for="project in paginatedPosts" :key="project.title">
                  <article v-if="project && project.slug" :id="project.slug" class="post-index__post">
                    <header class="post__header">
                      <h2 class="post__title">
                        <NuxtLink :to="`/projects/${project.slug}/`">
                          {{ project.title }}
                        </NuxtLink>
                      </h2>
                      <LayoutTechStack v-if="project.acf && project.acf.icons" class="post__tech-stack" :tech-stack="acfList(project.acf.icons)" />
                    </header>
                    <p class="post__content" v-text="project.excerpt.plain" />
                    <div class="post__buttons buttonsContainer">
                      <NuxtLink class="btn" :to="`/projects/${project.slug}/`">
                        Continue Reading
                      </NuxtLink>
                      <a v-if="project.acf && project.acf.project_url" class="btn" :href="acfText(project.acf.project_url)">View project</a>
                      <a v-if="project.acf && project.acf.github" class="btn" :href="acfText(project.acf.github)">View repo</a>
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
  title: 'Projects',
  description: 'Some loose notes on tech demonstrations and projects that I have created.'
}

const route = useRoute()
const router = useRouter()
const { data: projects } = await useCmsIndex('projects')

const pageCount = computed(() => projects.value.length)
const currentPage = computed(() => {
  const p = route.query.p
  const page = Array.isArray(p) ? p[0] : p

  return page ? parseInt(page) : 1
})
const paginatedPosts = computed(() => projects.value[currentPage.value - 1])

if (!currentPage.value || currentPage.value < 1 || currentPage.value > pageCount.value) {
  throw createError({ status: 404, message: 'Page not found', fatal: true })
}

usePageMeta({
  title: head.title,
  description: head.description,
  canonical: 'https://joebailey.xyz/projects/'
})

function goToPage (page: number) {
  router.push({ path: route.path, query: { ...route.query, p: page.toString() } })
}
</script>
