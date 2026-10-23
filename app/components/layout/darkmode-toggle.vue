<style scoped lang="scss">
  /* Toggle */
  .switch {
    position: relative;
    width: 56px;
    height: 46px;
    cursor: pointer;
    input {
      width: 0;
      height: 0;
      opacity: 0
    }
  }
  .slider {
    position: absolute;
    top: 10px;
    bottom: 10px;
    min-width: 50px;
    background-color: #CCCCCC;
    border-radius: 34px;
    &:before,
    &:after {
      position: absolute;
      bottom: 3px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      transition: transform .4s;
      content: ''

    }
    &:before {
      left: 4px;
      background-color: white
    }
    &:after {
      left: 3.5px;
      background-color: var(--dark-grey);
      mask-image: var(--sun-icon);
      mask-repeat: no-repeat;
      mask-position: center;
      mask-size: 14px
    }
  }
  input {
    &:checked + .slider {
      &:before,
      &:after {
        transform: translateX(20px)
      }
      &:before {
        background-color: var(--dark-grey)
      }
      &:after {
        mask-size: 12px;
        background-color: white;
        mask-image: var(--moon-icon)
      }
    }
    &:focus + .slider {
      box-shadow: 0 0 1px var(--dark-grey)
    }
  }
</style>

<template>
  <label class="switch darkmode-toggle" :class="{toggled: inputVal}" :style="`--sun-icon: url(${sunIcon}); --moon-icon: url(${moonIcon})`">
    <input v-model="inputVal" type="checkbox" aria-label="Toggle Darkmode">
    <span class="slider round" />
  </label>
</template>

<script setup lang="ts">
import { toHtml, icon } from '@fortawesome/fontawesome-svg-core'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
  model?: boolean
}>()

const emit = defineEmits<{
  input: [value: boolean]
}>()

function getSvgForCSS (svg: IconDefinition) {
  const { abstract } = icon(svg)
  const iconAsSVG = toHtml(abstract[0])

  // The SVG markup is ASCII, so btoa encodes it the same on the server and in the browser.
  return `data:image/svg+xml;base64,${btoa(iconAsSVG)}`
}

const sunIcon = getSvgForCSS(faSun)
const moonIcon = getSvgForCSS(faMoon)

const inputVal = computed({
  get: () => props.model ?? false,
  set: (val) => emit('input', val)
})
</script>
