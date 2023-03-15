<style lang="scss" scoped>
.sr-only {
  display: none
}
.active .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%)
}
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin: 0;
  padding: 0;
  list-style-type: none
}
.active :any-link,
.disabled :any-link {
  color: var(--dark-grey);
  pointer-events: none
}
</style>

<template>
  <ul v-if="pageCount > 1" class="pagination">
    <li v-if="!(firstPageSelected())" :class="[firstPageSelected() ? 'disabled' : '']">
      <nuxt-link
        v-if="currentPage - 1 === 1"
        :to="`/${linkPrefix}/`"
        aria-label="Previous Page"
        :tabindex="firstPageSelected() ? -1 : 0"
      >
        Prev
      </nuxt-link>
      <nuxt-link
        v-else
        :to="`/${linkPrefix}/page/${currentPage - 1}/`"
        aria-label="Previous Page"
        :tabindex="firstPageSelected() ? -1 : 0"
      >
        Prev
      </nuxt-link>
    </li>

    <li v-for="(page, idx) in pages" :key="idx" :class="[page.selected ? 'active' : '', page.disabled ? 'disabled' : '']">
      <span
        v-if="page.breakView"
        aria-label="Pages hidden"
        tabindex="-1"
        aria-hidden="true"
      >
        <slot name="breakViewContent">...</slot>
      </span>
      <span v-else-if="page.disabled" aria-label="Page">
        {{ page.content }}
      </span>
      <nuxt-link
        v-if="page.index + 1 === 1"
        :to="`/${linkPrefix}/`"
        :aria-label="'Page' + ' ' + page.content"
        :aria-current="page.selected"
        :tabindex="page.selected ? '-1' : '0'"
        :aria-hidden="page.selected ? 'true' : 'false'"
      >
        {{ page.content }} <span class="sr-only">(current)</span>
      </nuxt-link>
      <nuxt-link
        v-else
        :to="`/${linkPrefix}/page/${page.index + 1}/`"
        :aria-label="'Page' + ' ' + page.content"
        :aria-current="page.selected"
        :tabindex="page.selected ? '-1' : '0'"
        :aria-hidden="page.selected ? 'true' : 'false'"
      >
        {{ page.content }} <span class="sr-only">(current)</span>
      </nuxt-link>
    </li>

    <li v-if="!(lastPageSelected())" :class="[lastPageSelected() ? 'disabled' : '']">
      <nuxt-link
        :to="`/${linkPrefix}/page/${currentPage + 1}/`"
        aria-label="Next Page"
        :tabindex="lastPageSelected() ? -1 : 0"
      >
        Next
      </nuxt-link>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    pageCount: {
      type: Number,
      required: true
    },
    linkPrefix: {
      type: String,
      required: true
    }
  },
  computed: {
    currentPage () {
      return parseInt(this.$route.params.page) || 1
    },
    pages () {
      const items = {}
      if (this.pageCount <= 3) {
        for (let index = 0; index < this.pageCount; index++) {
          const page = {
            index,
            content: index + 1,
            selected: index === (this.currentPage - 1)
          }
          items[index] = page
        }
      } else {
        const halfPageRange = Math.floor(3 / 2)

        const setPageItem = (index) => {
          const page = {
            index,
            content: index + 1,
            selected: index === (this.currentPage - 1)
          }

          items[index] = page
        }

        const setBreakView = (index) => {
          const breakView = {
            disabled: true,
            breakView: true
          }

          items[index] = breakView
        }

        // 1st - loop thru low end of margin pages
        for (let i = 0; i < 1; i++) {
          setPageItem(i)
        }

        // 2nd - loop thru selected range
        let selectedRangeLow = 0
        if (this.currentPage - halfPageRange > 0) {
          selectedRangeLow = this.currentPage - 1 - halfPageRange
        }

        let selectedRangeHigh = selectedRangeLow + 2
        if (selectedRangeHigh >= this.pageCount) {
          selectedRangeHigh = this.pageCount - 1
          selectedRangeLow = selectedRangeHigh - 4
        }

        for (let i = selectedRangeLow; i <= selectedRangeHigh && i <= this.pageCount - 1; i++) {
          setPageItem(i)
        }

        // Check if there is breakView in the left of selected range
        if (selectedRangeLow > 1) {
          setBreakView(selectedRangeLow - 1)
        }

        // Check if there is breakView in the right of selected range
        if (selectedRangeHigh + 1 < this.pageCount - 1) {
          setBreakView(selectedRangeHigh + 1)
        }

        // 3rd - loop thru high end of margin pages
        for (let i = this.pageCount - 1; i >= this.pageCount - 1; i--) {
          setPageItem(i)
        }
      }
      return items
    }
  },
  methods: {
    firstPageSelected () {
      return this.currentPage === 1
    },
    lastPageSelected () {
      return (this.currentPage === this.pageCount) || (this.pageCount === 0)
    }
  }
}
</script>
