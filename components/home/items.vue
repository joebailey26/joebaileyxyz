<style lang="scss" scoped>
.items {
  @media (max-width: 768px) {
    margin-bottom: 50px
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding-right: 15px;
    padding-left: 15px;
    column-gap: 2rem;
    row-gap: 3rem;
    @media (max-width: 1024px) {
      grid-template-columns: 1fr 1fr
    }
    @media (max-width: 768px) {
      grid-auto-flow: column;
      grid-template-columns: 30px repeat(6, calc(var(--100vw) - 80px)) 30px;
      max-width: var(--100vw);
      margin-right: calc(-1 * ((var(--100vw) - 100%) / 2));
      margin-left: calc(-1 * ((var(--100vw) - 100%) / 2));
      padding: 0;
      overflow-x: auto;
      column-gap: 10px;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x mandatory;
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
      &::-webkit-scrollbar {
        display: none
      }
      &:before,
      &:after {
        display: table;
        height: 100%;
        content: ''
      }
      @for $i from 1 through 6 {
        article:nth-of-type(#{$i}) {
          grid-column: $i + 1
        }
      }
    }
    @media (max-width: 576px) {
      grid-template-columns: 10px repeat(6, calc(var(--100vw) - 40px)) 10px
    }
  }
  .drag-scroll--enabled {
    cursor: grab
  }
  .drag-scroll--scrolling {
    cursor: grabbing;
    user-select: none;
    scroll-snap-type: none
  }
}
</style>

<template>
  <div v-if="items" class="items">
    <div ref="container" class="row grid" @scroll="containerScroll">
      <template v-for="item, index in items">
        <Item
          ref="item"
          :key="`${item.title}${index}`"
          :item="item"
          :link-prefix="linkPrefix"
          :show-link="showLinks"
          :show-tech-stack="showTechStack"
        />
      </template>
    </div>
    <Icons :items="items.length" :current="current" @iconClicked="iconScroll" />
  </div>
</template>

<script>
import Item from '~/components/home/item'
import Icons from '~/components/home/icons'

export default {
  components: {
    Item,
    Icons
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    linkPrefix: {
      type: String,
      required: true
    },
    showLinks: {
      type: Boolean,
      default: true
    },
    showTechStack: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      current: 0,
      itemWidth: 0,
      position: {
        left: 0,
        x: 0
      }
    }
  },
  mounted () {
    this.updateWidth()
    window.addEventListener('resize', this.updateWidth)
    this.dragScrollWatcher()
    window.addEventListener('resize', this.dragScrollWatcher)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.updateWidth)
    this.stopDragScroll()
    window.removeEventListener('resize', this.dragScrollWatcher)
  },
  methods: {
    dragScrollWatcher () {
      if (!this.hasTouchScreen() && this.hasOverflowAuto()) {
        this.startDragScroll()
      } else {
        this.stopDragScroll()
      }
    },
    startDragScroll () {
      document.addEventListener('mousedown', this.mouseDownHandler)
      this.$refs.container.classList.add('drag-scroll--enabled')
    },
    stopDragScroll () {
      document.removeEventListener('mousedown', this.mouseDownHandler)
      this.$refs.container.classList.remove('drag-scroll--enabled')
      // This clears up some event listeners and resets our classes
      this.mouseUpHandler()
    },
    hasTouchScreen () {
      return ('ontouchstart' in window)
    },
    hasOverflowAuto () {
      /*
        Rather than worrying about breakpoints here, we let CSS handle it, as they may be different for each component
        If overflow-x: auto is not on the element, then it is not a scrolling element, so we don't need to run DragToScroll
      */
      return (getComputedStyle(this.$refs.container).getPropertyValue('overflow-x') === 'auto')
    },
    mouseDownHandler (e) {
      this.$refs.container.classList.add('drag-scroll--scrolling')

      this.position = {
        // The current scroll
        left: this.$refs.container.scrollLeft,
        // Get the current mouse position
        x: e.clientX
      }
      document.addEventListener('mousemove', this.mouseMoveHandler)
      document.addEventListener('mouseup', this.mouseUpHandler)
    },
    mouseMoveHandler (e) {
      // How far the mouse has been moved
      const dx = e.clientX - this.position.x

      // Scroll the element
      this.$refs.container.scrollLeft = this.position.left - dx
    },
    mouseUpHandler () {
      document.removeEventListener('mousemove', this.mouseMoveHandler)
      document.removeEventListener('mouseup', this.mouseUpHandler)

      this.$refs.container.classList.remove('drag-scroll--scrolling')
    },
    updateWidth () {
      if (this.$refs.item[0]) {
        this.itemWidth = this.$refs.item[0].$el.offsetWidth
      } else if (this.$refs.item) {
        this.itemWidth = this.$refs.item.$el.offsetWidth
      } else {
        this.itemWidth = 0
      }
    },
    containerScroll () {
      this.current = Math.round(this.$refs.container.scrollLeft / this.itemWidth)
    },
    iconScroll (i) {
      this.$refs.container.scrollTo({
        left: this.itemWidth * i,
        behavior: 'smooth'
      })
    }
  }
}
</script>
