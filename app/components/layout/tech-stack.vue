<style lang="scss">
@import '~/assets/scss/mixins';
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  i {
    display: inline-flex;
    color: var(--grey);
    font-size: xx-large
  }
}
@include dark-theme {
  .tech-stack i{
    color: var(--light-green)
  }
}
</style>

<template>
  <div v-if="techStack" class="tech-stack">
    <template v-for="techName, index in techStack" :key="techName + index">
      <i v-if="techName === 'Firebase'" title="Firebase">
        <font-awesome-icon :icon="['fa-brands', 'fa-google']" />
      </i>
      <i v-if="techName === 'PHP'" title="PHP">
        <font-awesome-icon :icon="['fa-brands', 'fa-php']" />
      </i>
      <i v-if="techName === 'Vue'" title="Vue">
        <font-awesome-icon :icon="['fa-brands', 'fa-vuejs']" />
      </i>
      <i v-if="techName === 'React'" title="React">
        <font-awesome-icon :icon="['fa-brands', 'fa-react']" />
      </i>
      <i v-if="techName === 'WordPress'" title="WordPress">
        <font-awesome-icon :icon="['fa-brands', 'fa-wordpress']" />
      </i>
      <i v-if="techName === 'Figma'" title="Figma">
        <font-awesome-icon :icon="['fa-brands', 'fa-figma']" />
      </i>
      <i v-if="techName === 'Custom'" title="Custom Solution">
        <font-awesome-icon :icon="['fa-solid', 'fa-file-code']" />
      </i>
      <i v-if="techName === 'Netlify'" title="Netlify">
        <font-awesome-icon :icon="['fa-solid', 'fa-cloud']" />
      </i>
      <i v-if="techName === 'XD'" title="Adobe XD">
        <font-awesome-icon :icon="['fa-solid', 'fa-pen-nib']" />
      </i>
      <i v-if="techName === 'InDesign'" title="Adobe InDesign">
        <font-awesome-icon :icon="['fa-solid', 'fa-book']" />
      </i>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  techStack: string[] | undefined
}>()
</script>
