<style lang="scss">
.contact-methods {
  text-align: center;
  :any-link,
  p {
    display: inline-grid;
    grid-template-columns: 24px auto;
    gap: 4px;
    margin-bottom: 1.5rem
  }
  svg {
    transition: fill .25s ease-in-out;
    fill: var(--grey);
    @media (prefers-color-scheme: dark) {
      fill: var(--light-grey)
    }
  }
  :any-link {
    color: var(--grey);
    transition: color .25s ease-in-out;
    &:hover {
      color: var(--green);
      svg {
        fill: var(--green)
      }
    }
  }
  * {
    display: inline;
    vertical-align: middle
  }
  address {
    font-style: normal
  }
}
.form-group {
  margin-bottom: 1rem;
  label {
    display: inline-block;
    margin-bottom: .5rem;
    line-height: 1.5
  }
  .form-control {
    width: 100%;
    padding: .5rem 1rem;
    color: var(--grey);
    font-size: 1rem;
    font-family: inherit;
    line-height: 1.25;
    border: 1px solid var(--grey);
    border-radius: 4px;
    resize: vertical
  }
}
</style>

<template>
  <section id="section-contact" class="section section-contact">
    <h2 class="text-center title">
      Get in touch
    </h2>
    <div class="row">
      <div class="col-md-8 ml-auto mr-auto">
        <div class="row contact-methods">
          <div class="col-md-4">
            <a href="tel:+447477737535">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                />
              </svg>
              07477 737535
            </a>
          </div>
          <div class="col-md-4">
            <a href="mailto:joe@joebailey.xyz">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                />
              </svg>
              joe@joebailey.xyz
            </a>
          </div>
          <div class="col-md-4">
            <address>
              <p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path
                    d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                  />
                </svg>
                Cambridge, UK
              </p>
            </address>
          </div>
        </div>
        <form
          class="contact-form"
          method="post"
          name="contactForm"
          netlify
          @submit.prevent="submit"
        >
          <input
            type="hidden"
            name="form-name"
            value="contactForm"
          >
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="name">Your Name*</label>
                <input
                  id="name"
                  v-model="form.name"
                  name="name"
                  class="form-control"
                  required
                >
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="email">Your Email*</label>
                <input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  class="form-control"
                  required
                >
              </div>
            </div>
            <div class="col-md-12">
              <div class="form-group">
                <label for="message">Your Message*</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  name="message"
                  class="form-control"
                  rows="4"
                  required
                />
              </div>
            </div>
            <div class="col-md-12">
              <input
                id="formSubmit"
                class="btn"
                value="Send Message"
                type="submit"
                disabled
              >
            </div>
            <div class="col-md-12">
              <p v-show="!submitted">
              &nbsp;
              </p>
              <transition name="fade">
                <p v-show="submitted" class="message" v-text="submitted" />
              </transition>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
      submitted: false,
      form: {
        name: '',
        email: '',
        message: ''
      }
    }
  },
  mounted () {
    // eslint-disable-next-line
    if (process.client) {
      if (localStorage.getItem('contactForm')) {
        this.form = JSON.parse(localStorage.getItem('contactForm'))
      } else {
        this.form = {}
      }
    }
  },
  updated () {
    this.checkform()
  },
  methods: {
    checkform () {
      localStorage.setItem('contactForm', JSON.stringify(this.form))
      const f = document.forms.contactForm.elements
      let cansubmit = true

      for (let i = 1; i < f.length - 1; i++) {
        if (f[i].required && (f[i].value.length === 0 || f[i].value === '')) {
          cansubmit = false
        }
      }

      if (document.querySelector('#formSubmit')) {
        document.querySelector('#formSubmit').disabled = !cansubmit
      }
    },
    submit () {
      try {
        const formData = new FormData()
        formData.append('form-name', 'contactForm')
        Object.keys(this.form).forEach((key) => {
          formData.append(key, this.form[key])
        })

        const timestamp = Math.floor(Date.now() / 1000)

        fetch(`/?t=${timestamp}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams(formData)
        })

        localStorage.setItem('contactForm', '')
        this.form = {}
        this.submitted = 'Message sent successfully! We\'ll be in touch within 2-3 working days'
      } catch (e) {
        this.submitted = e.toString() + ' Please try again.'
      }
    }
  }
}
</script>
