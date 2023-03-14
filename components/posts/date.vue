<style lang="scss" scoped>
.date {
  grid-row: span 3;
  grid-column: 1;
  margin-top: 8px;
  color: white;
  text-align: center;
  .day {
    display: grid;
    width: 65px;
    height: 40px;
    font-size: 1.5rem;
    font-style: italic;
    background-color: var(--green);
    place-items: center
  }
  .monthYear {
    width: 65px;
    height: 48px;
    margin-top: -1px;
    padding-top: 4px;
    background-color: var(--grey);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)
  }
  @media (max-width: 576px) {
    margin-bottom: 1rem
  }
}
</style>

<template>
  <div class="date">
    <div class="day" v-html="date.day" />
    <div class="monthYear" v-html="`${date.month} '${date.year}`" />
  </div>
</template>

<script>
export default {
  props: {
    date: {
      type: Object,
      default () {
        return {
          day: 0,
          month: 0,
          year: 0
        }
      }
    }
  }
}
</script>
