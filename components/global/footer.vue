<style lang="scss">
@import '~assets/scss/mixins';
footer {
  padding-top: 30px;
  padding-bottom: 15px
}
.copyright {
  padding-bottom: 15px
}
.socials {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  align-items: center;
  justify-content: center;
  :any-link {
    display: inline-flex;
    color: var(--grey);
    font-size: 1.5rem;
    transition: color .25s ease-in-out;
    &:hover,
    &:active,
    &:focus {
      color: var(--green)
    }
  }
}
@include dark-theme {
  .socials {
    :any-link {
      color: var(--light-green)
    }
  }
}
</style>

<template>
  <footer class="footer text-center">
    <div class="container ml-auto mr-auto">
      <div class="row">
        <div class="col-md-12">
          <div class="copyright">
            &copy; {{ new Date().getFullYear() }} Joe Bailey. All rights
            reserved.
          </div>
          <div class="socials">
            <a
              title="LinkedIn"
              aria-label="LinkedIn Social Profile Link"
              href="https://www.linkedin.com/in/joe-bailey-b68b17171/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <font-awesome-icon :icon="['fa-brands', 'fa-linkedin']" />
            </a>
            <a
              title="GitHub"
              aria-label="GitHub Social Profile Link"
              href="https://github.com/joebailey26"
              rel="noopener noreferrer"
              target="_blank"
            >
              <font-awesome-icon :icon="['fa-brands', 'fa-github']" />
            </a>
            <img src="https://api.netlify.com/api/v1/badges/0f6be2d7-6002-4d40-870b-9f3ad6ba7c49/deploy-status" height="20" width="auto" alt="Netlify Status">
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
