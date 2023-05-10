<style lang="scss">
@import '~assets/scss/mixins';
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  i {
    display: inline-flex;
    color: var(--grey);
    font-size: xx-large;
    @include dark-theme {
      color: var(--light-green)
    }
  }
}
</style>

<template>
  <div v-if="techStack" class="tech-stack">
    <template v-for="techName, index in techStack">
      <i v-if="techName === 'Firebase'" :key="techName + index + Math.random()" title="Firebase">
        <font-awesome-icon :icon="['fa-brands', 'fa-google']" />
      </i>
      <i v-if="techName === 'PHP'" :key="techName + index + Math.random()" title="PHP">
        <font-awesome-icon :icon="['fa-brands', 'fa-php']" />
      </i>
      <i v-if="techName === 'Vue'" :key="techName + index + Math.random()" title="Vue">
        <font-awesome-icon :icon="['fa-brands', 'fa-vuejs']" />
      </i>
      <i v-if="techName === 'React'" :key="techName + index + Math.random()" title="React">
        <font-awesome-icon :icon="['fa-brands', 'fa-react']" />
      </i>
      <i v-if="techName === 'WordPress'" :key="techName + index + Math.random()" title="WordPress">
        <font-awesome-icon :icon="['fa-brands', 'fa-wordpress']" />
      </i>
      <i v-if="techName === 'Figma'" :key="techName + index + Math.random()" title="Figma">
        <font-awesome-icon :icon="['fa-brands', 'fa-figma']" />
      </i>
      <i v-if="techName === 'Custom'" :key="techName + index + Math.random()" title="Custom Solution">
        <font-awesome-icon :icon="['fa-solid', 'fa-file-code']" />
      </i>
      <i v-if="techName === 'Netlify'" :key="techName + index + Math.random()" title="Netlify">
        <font-awesome-icon :icon="['fa-solid', 'fa-cloud']" />
      </i>
      <i v-if="techName === 'XD'" :key="techName + index + Math.random()" title="Adobe XD">
        <font-awesome-icon :icon="['fa-solid', 'fa-pen-nib']" />
      </i>
      <i v-if="techName === 'InDesign'" :key="techName + index + Math.random()" title="Adobe InDesign">
        <font-awesome-icon :icon="['fa-solid', 'fa-book']" />
      </i>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    techStack: {
      type: Array,
      required: true
    }
  }
}
</script>
