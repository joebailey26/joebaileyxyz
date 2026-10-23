<template>
  <div v-if="project">
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <div class="navigation-index">
              <NuxtLink :to="'/projects/'" class="navigation-index__link">
                <font-awesome-icon :icon="['fa-regular', 'fa-hand-point-left']" class="navigation-link__icon" />
                Back to projects
              </NuxtLink>
            </div>
            <h1 class="page-header__title" v-text="project.title" />
            <LayoutTechStack v-if="project.acf && project.acf.icons" class="page-header__tech-stack page-header__description" :tech-stack="project.acf.icons" :show-post-name="true" />
          </div>
        </div>
      </div>
    </header>
    <main class="project-single">
      <div class="container ml-auto mr-auto">
        <section class="section">
          <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
              <article>
                <div class="post__content" v-html="project.content" />
                <div v-if="project.acf && (project.acf.project_url || project.acf.github)" class="post__buttons buttonsContainer">
                  <a v-if="project.acf.project_url" class="btn" :href="project.acf.project_url">View project</a>
                  <a v-if="project.acf.github" class="btn" :href="project.acf.github">View repo</a>
                </div>
                <ClientOnly>
                  <GalexiaShare :title="fullTitle(project.title)" :description="project.excerpt.plain" />
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
          <PostsNavigation post-type="projects" next-post-text="Next Project" previous-post-text="Previous Project" :show-post-name="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const project = await useCmsPost('projects', String(route.params.slug))

usePageMeta({
  title: () => project.value.title,
  description: () => project.value.excerpt.plain || undefined,
  image: () => project.value.featuredMedia || undefined,
  canonical: `https://joebailey.xyz/projects/${route.params.slug}/`
})
useCopyToClipboard()
</script>
