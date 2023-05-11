<style lang="scss" scoped>
@import '~assets/scss/mixins';
.git {
  margin-top: 50px;
  margin-right: -15px;
  margin-left: -15px;
  h3 {
    margin-top: 0;
    font-weight: 400
  }
  :any-link {
    display: block;
    color: var(--grey);
    transition: color .25s ease-in-out;
    &:hover,
    &:active,
    &:focus {
      color: var(--green)
    }
    .git__text-link {
      display: flex;
      flex-direction: row-reverse;
      gap: 1rem;
      align-items: center
    }
    .fa-github {
      height: 1.5rem;
      font-size: 1.5rem
    }
    img {
      height: auto;
      min-height: 114px;
      margin-bottom: .5rem
    }
  }
  @media (max-width: 768px) {
    margin-bottom: 50px;
    :any-link {
      overflow: hidden;
      &:before,
      &:after {
        display: table;
        content: ' '
      }
      &:after {
        clear: both
      }
      .git__text-link {
        display: block
      }
      img {
        float: right;
        width: 250%
      }
    }
  }
}
@include dark-theme {
  .git {
    :any-link {
      color: white;
      &:hover,
      &:active,
      &:focus {
        color: var(--light-green)
      }
    }
  }
}
</style>

<template>
  <div class="git">
    <div class="col-md-8 ml-auto mr-auto">
      <h3>GitHub Contributions</h3>
      <a title="GitHub Contributions" href="https://github.com/joebailey26">
        <img
          src="https://ghchart.rshah.org/joebailey26"
          alt="Joe's Github chart"
          width="100%"
          height="114px"
        >
        <div class="git__text-link">
          <font-awesome-icon :icon="['fa-brands', 'fa-github']" />
          <span>View my profile on GitHub.</span>
        </div>
      </a>
    </div>
  </div>
</template>
