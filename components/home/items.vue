<style lang="scss" scoped>
@import '~assets/scss/mixins';
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
      grid-template-columns: 30px repeat(7, calc(var(--100vw) - 80px)) 30px;
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
      @for $i from 1 through 7 {
        article:nth-of-type(#{$i}) {
          grid-column: $i + 1
        }
      }
    }
    @media (max-width: 576px) {
      grid-template-columns: 10px repeat(7, calc(var(--100vw) - 40px)) 10px
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
.view-more-items {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 100px;
  padding: 20px;
  text-align: center;
  background-color: white;
  border: 1px solid var(--grey);
  border-radius: 4px;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  @include dark-theme {
    background-color: var(--dark-grey);
    border-color: white
  }
  @media (min-width: 769px) {
    display: none
  }
  :any-link {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: fit-content;
    color: var(--grey);
    .view-more-items__plus {
      transition: transform 150ms ease-in-out
    }
    @include dark-theme {
      color: white
    }
    &:hover {
      .view-more-items__plus {
        transform: scale(1.1)
      }
      @include dark-theme {
        color: white
      }
    }
  }
}
.view-more-items__plus {
  display: block;
  width: fit-content;
  margin-right: auto;
  margin-left: auto;
  padding: .5rem;
  font-size: 2rem;
  border: 2px solid var(--grey);
  border-radius: 50%;
  aspect-ratio: 1;
  @include dark-theme {
    border-color: white
  }
  svg {
    margin-top: 2px;
    margin-left: 2px
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
      <article v-if="items.length === 6" class="view-more-items">
        <nuxt-link :to="`/${linkPrefix}/`">
          <h3 class="view-more-items__title">
            View more
          </h3>
          <div class="view-more-items__plus">
            <font-awesome-icon :icon="['fa-solid', 'fa-plus']" />
          </div>
        </nuxt-link>
      </article>
    </div>
    <Icons :items="items.length === 6 ? items.length + 1 : items.length" :current="current" @iconClicked="iconScroll" />
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
      this.$refs.container.addEventListener('mousedown', this.mouseDownHandler)
      this.$refs.container.classList.add('drag-scroll--enabled')
    },
    stopDragScroll () {
      this.$refs.container.removeEventListener('mousedown', this.mouseDownHandler)
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
      this.$refs.container.addEventListener('mousemove', this.mouseMoveHandler)
      this.$refs.container.addEventListener('mouseup', this.mouseUpHandler)
    },
    mouseMoveHandler (e) {
      // How far the mouse has been moved
      const dx = e.clientX - this.position.x

      // Scroll the element
      this.$refs.container.scrollLeft = this.position.left - dx
    },
    mouseUpHandler () {
      this.$refs.container.removeEventListener('mousemove', this.mouseMoveHandler)
      this.$refs.container.removeEventListener('mouseup', this.mouseUpHandler)

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
