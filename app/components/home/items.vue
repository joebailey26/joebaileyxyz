<style lang="scss" scoped>
@import '~/assets/scss/mixins';
.items {
  @media (max-width: 768px) {
    margin-bottom: 50px
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 3rem 2rem;
    padding-right: 15px;
    padding-left: 15px;
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
    &:hover {
      .view-more-items__plus {
        transform: scale(1.1)
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
  svg {
    margin-top: 2px;
    margin-left: 2px
  }
}
@include dark-theme {
  .view-more-items {
    background-color: var(--dark-grey);
    border-color: white;
    :any-link,
    :any-link:hover {
      color: white
    }
  }
  .view-more-items__plus {
    border-color: white
  }
}
</style>

<template>
  <div v-if="items" class="items">
    <div ref="container" class="row grid" @scroll="containerScroll">
      <template v-for="item, index in items" :key="`${item.title}${index}`">
        <HomeItem
          ref="item"
          :item="item"
          :link-prefix="linkPrefix"
          :show-link="showLinks"
          :show-tech-stack="showTechStack"
        />
      </template>
      <article v-if="items.length === 6" class="view-more-items">
        <NuxtLink :to="`/${linkPrefix}/`">
          <h3 class="view-more-items__title">
            View more
          </h3>
          <div class="view-more-items__plus">
            <font-awesome-icon :icon="['fa-solid', 'fa-plus']" />
          </div>
        </NuxtLink>
      </article>
    </div>
    <HomeIcons :items="items.length === 6 ? items.length + 1 : items.length" :current="current" @icon-clicked="iconScroll" />
  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { CmsPostSummary } from '@joebailey26/nuxt-static-wordpress'

withDefaults(defineProps<{
  // The home page passes the first page of the section, which is missing for an empty section
  items: CmsPostSummary[] | undefined
  linkPrefix: string
  showLinks?: boolean
  showTechStack?: boolean
}>(), {
  showLinks: true,
  showTechStack: true
})

const container = useTemplateRef<HTMLElement>('container')
const itemComponents = useTemplateRef<ComponentPublicInstance[]>('item')

const current = ref(0)
const itemWidth = ref(0)
const position = ref({
  left: 0,
  x: 0
})

function dragScrollWatcher () {
  if (!hasTouchScreen() && hasOverflowAuto()) {
    startDragScroll()
  } else {
    stopDragScroll()
  }
}

function startDragScroll () {
  container.value?.addEventListener('mousedown', mouseDownHandler)
  container.value?.classList.add('drag-scroll--enabled')
}

function stopDragScroll () {
  container.value?.removeEventListener('mousedown', mouseDownHandler)
  container.value?.classList.remove('drag-scroll--enabled')
  // This clears up some event listeners and resets our classes
  mouseUpHandler()
}

function hasTouchScreen () {
  return ('ontouchstart' in window)
}

function hasOverflowAuto () {
  /*
    Rather than worrying about breakpoints here, we let CSS handle it, as they may be different for each component
    If overflow-x: auto is not on the element, then it is not a scrolling element, so we don't need to run DragToScroll
  */
  return !!container.value && (getComputedStyle(container.value).getPropertyValue('overflow-x') === 'auto')
}

function mouseDownHandler (e: MouseEvent) {
  if (!container.value) {
    return
  }
  container.value.classList.add('drag-scroll--scrolling')

  position.value = {
    // The current scroll
    left: container.value.scrollLeft,
    // Get the current mouse position
    x: e.clientX
  }
  container.value.addEventListener('mousemove', mouseMoveHandler)
  container.value.addEventListener('mouseup', mouseUpHandler)
}

function mouseMoveHandler (e: MouseEvent) {
  if (!container.value) {
    return
  }
  // How far the mouse has been moved
  const dx = e.clientX - position.value.x

  // Scroll the element
  container.value.scrollLeft = position.value.left - dx
}

function mouseUpHandler () {
  container.value?.removeEventListener('mousemove', mouseMoveHandler)
  container.value?.removeEventListener('mouseup', mouseUpHandler)

  container.value?.classList.remove('drag-scroll--scrolling')
}

function updateWidth () {
  // Each item is a HomeItem, whose root element is its <article>
  const firstItem = itemComponents.value?.[0]?.$el
  itemWidth.value = firstItem instanceof HTMLElement ? firstItem.offsetWidth : 0
}

function containerScroll () {
  if (container.value) {
    current.value = Math.round(container.value.scrollLeft / itemWidth.value)
  }
}

function iconScroll (i: number) {
  container.value?.scrollTo({
    left: itemWidth.value * i,
    behavior: 'smooth'
  })
}

onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
  dragScrollWatcher()
  window.addEventListener('resize', dragScrollWatcher)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth)
  stopDragScroll()
  window.removeEventListener('resize', dragScrollWatcher)
})
</script>
