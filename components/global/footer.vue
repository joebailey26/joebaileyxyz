<style lang="scss">
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
    @media (prefers-color-scheme: dark) {
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
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
