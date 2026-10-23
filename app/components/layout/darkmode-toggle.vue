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

<script>
import { toHtml, icon } from '@fortawesome/fontawesome-svg-core'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

export default {
  props: {
    modelValue: {
      type: Boolean
    }
  },
  emits: ['update:modelValue'],
  data () {
    return {
      sunIcon: this.getSvgForCSS(faSun),
      moonIcon: this.getSvgForCSS(faMoon)
    }
  },
  computed: {
    inputVal: {
      get () {
        return this.modelValue
      },
      set (val) {
        this.$emit('update:modelValue', val)
      }
    }
  },
  methods: {
    getSvgForCSS (svg) {
      const { abstract } = icon(svg)
      const iconAsSVG = toHtml(abstract[0])

      // The SVG markup is ASCII, so btoa encodes it the same on the server and in the browser.
      return `data:image/svg+xml;base64,${btoa(iconAsSVG)}`
    }
  }
}
</script>
