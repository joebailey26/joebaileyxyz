<style lang="scss">
@import '~assets/scss/mixins';
.icons {
  display: none
}

@media (max-width: 768px) {
  .icons {
    position: sticky;
    display: grid;
    grid-auto-rows: 30px;
    grid-auto-columns: 30px;
    grid-auto-flow: column;
    grid-column: 1;
    gap: 5px;
    align-items: center;
    justify-content: center;
    justify-items: center;
    width: auto;
    margin: -60px auto auto
  }
  .icon {
    width: 15px;
    height: 15px;
    border: 3px solid var(--dark-grey);
    border-radius: 7.5px;
    cursor: pointer;
    &.current {
      background-color: var(--dark-grey)
    }
  }
}

@include dark-theme {
  .icon {
    border: 2px solid white;
    &.current {
      background-color: white
    }
  }
}
</style>

<template>
  <div v-if="items" class="icons">
    <template v-for="item, index in items">
      <div :key="item" class="icon" :class="{ 'current': index === current }" @click="bubble(index)" />
    </template>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    }
  },
  methods: {
    bubble (i) {
      this.$emit('iconClicked', i)
    }
  }
}
</script>
