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
      overflow-x: scroll;
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
        />
      </template>
    </div>
    <Icons :items="6" :current="current" @iconClicked="iconScroll" />
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
      default () {
        return []
      }
    },
    linkPrefix: {
      type: String,
      default: ''
    },
    showLinks: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      current: 0,
      itemWidth: 0
    }
  },
  mounted () {
    this.updateWidth()
    window.addEventListener('resize', this.updateWidth)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.updateWidth)
  },
  methods: {
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
