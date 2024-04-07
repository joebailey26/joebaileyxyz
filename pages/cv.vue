<style scoped lang="scss">
* {
  margin: 0
}
.header__title {
  text-align: center
}
p.header__description {
  margin-top: 1rem;
  font-size: 1.2rem;
  text-align: center
}
p {
  text-align: justify
}
section {
  margin-top: 2rem;
  page-break-after: always
}
.block {
  display: grid;
  grid-template-columns: .66fr 1fr;
  gap: .5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  page-break-inside: avoid;
  border-top: 1.5px solid var(--grey)
}
h1 {
  font-size: 2.25rem
}
h2 {
  margin-bottom: .5rem;
  font-size: 1.5rem
}
h3 {
  font-size: 1.1rem
}
h4 {
  font-size: 1rem
}
ul {
  padding-left: 1.2em
}
p, li {
  font-weight: 400;
  line-height: 1.33;
  letter-spacing: -.05px
}
footer {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 1rem 20mm;
  color: white;
  font-weight: 300;
  font-size: .85rem;
  background-color: var(--dark-grey);
  :any-link {
    /* stylelint-disable-next-line declaration-no-important */
    color: white!important;
    &:hover {
      /* stylelint-disable-next-line declaration-no-important */
      color: var(--light-green)!important
    }
  }
  p:not(:last-child):after {
    padding-right: .5em;
    padding-left: .5em;
    content: '|'
  }
}
@media screen {
  .cv {
    position: relative;
    box-sizing: border-box; /* Ensures padding is included in the total width/height */
    width: 100%;
    max-width: 210mm; /* A4 width in millimeters */
    margin: 0 auto; /* Optional: centers the page horizontally */
    padding: 15mm 20mm; /* Optional: adds some padding inside the A4 page */
    color: var(--grey);
    background: white; /* Optional: sets a white background */
    border: 1px solid lightgray; /* Optional: adds a border around the A4 page */
  }
  footer {
    width: calc(100% + 40mm);
    margin-bottom: -15mm;
    margin-left: -20mm
  }
  @media (max-width: 210mm) {
    .cv {
      padding: 1rem
    }
    footer {
      width: calc(100% + 2rem);
      margin-bottom: -1rem;
      margin-left: -1rem
    }
  }
  @media (max-width: 150mm) {
    .block {
      grid-template-columns: 1fr
    }
    p {
      text-align: left
    }
    footer {
      flex-wrap: wrap;
      gap: .5rem;
      p:not(:last-child):after {
        content: none
      }
    }
  }
}
@media print {
  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    padding-right: 0;
    padding-left: 0;
    background: none;
    &,
    :any-link,
    :any-link:hover {
      /* stylelint-disable-next-line declaration-no-important */
      color: var(--grey)!important
    }
  }
}
</style>

<template>
  <div class="cv">
    <header>
      <h1 class="header__title">
        Joe Bailey
      </h1>
      <p class="header__description">
        I deliver great websites, applications, and experiences.
      </p>
    </header>
    <section>
      <h2>Work History</h2>
      <div class="block">
        <div class="block__info">
          <h3>Software Engineer</h3>
          <h4>Full-time</h4>
          <h4>Priority Digital Health Ltd</h4>
          <h4>July 2023 - Present</h4>
        </div>
        <div class="block__description">
          <p>I had another steep learning curve to transition fully to backend development using Symfony. 6 months on and a team re-shuffle meant I could go back to being a full-stack developer. I now help build both our front-end (React) and back-end platforms. Having software that caters to thousands of users means code must be robust and thoroughly tested, quite a change from the small websites I was working on before. As part of our efforts to reduce bugs, I'm constantly suggesting improvements to our workflows both from a DevOps and business perspective.</p>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Web Developer</h3>
          <h4>Full-time</h4>
          <h4>Rareloop Ltd</h4>
          <h4>April 2022 - July 2023</h4>
        </div>
        <div class="block__description">
          <p>Starting at Rareloop, I had a steep learning curve to bring myself up to speed on OOP PHP and Laravel. I quickly got to grips and started building MVC WordPress sites with ACF, Lumberjack and Rareloop’s bespoke page builder. With each site, I continuously iterated on company processes, improving things for future developers. I am proud to have worked at a B-Corps company, helping to make the web a better place for all.</p>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Development Liaison</h3>
          <h4>Part-time</h4>
          <h4>Toolkit Websites Ltd</h4>
          <h4>October 2021 – March 2022</h4>
        </div>
        <div class="block__description">
          <p>Transitioning to a part-time role, I managed more high-level projects whilst continuing with my previous responsibilities:</p>
          <ul>
            <li>Come up with new ideas and brief up tasks for back-end developers to implement into our internal CRM and CMS</li>
            <li>Manage the migration of 1400 domains’ DNS from eNom to Cloudflare in response to a service provider outage</li>
            <li>Assess staff needs and provide technical solutions to everyday burdens</li>
            <li>Assist with migration of server stack from Rackspace to Azure</li>
            <li>Thorough testing of all internal systems</li>
          </ul>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Development Liaison</h3>
          <h4>Full-time</h4>
          <h4>Toolkit Websites Ltd</h4>
          <h4>June 2021 – October 2021</h4>
        </div>
        <div class="block__description">
          <p>As my role within Toolkit Websites grew, so did my responsibilities:</p>
          <ul>
            <li>Train new staff members</li>
            <li>Create coding documentation for new staff members</li>
            <li>Create an intricate learning program for new staff members</li>
            <li>Manage code snippets</li>
            <li>Create a coding style guide</li>
            <li>Review coding procedures and best practises</li>
            <li>Quality assure newly published websites</li>
            <li>Perform code reviews</li>
            <li>Manage a redesign of Toolkit’s support and main website</li>
            <li>Perform email migrations for clients</li>
            <li>Manage clients domain names, transfers, DNS, etc.</li>
          </ul>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Web Developer</h3>
          <h4>Full-time</h4>
          <h4>Toolkit Websites Ltd</h4>
          <h4>October 2020 – June 2021</h4>
        </div>
        <div class="block__description">
          <p>Working at Toolkit Websites, I had many varying responsibilities:</p>
          <ul>
            <li>Design logos</li>
            <li>Design websites</li>
            <li>Develop custom solutions for client requests on websites</li>
            <li>Add content to websites using Toolkit’s bespoke Content Management System</li>
            <li>Support clients via email with a 1 hour SLA</li>
            <li>Support clients via phone</li>
          </ul>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Senior Engineer</h3>
          <h4>Part-time</h4>
          <h4>Train In Blocks Ltd</h4>
          <h4>September 2020 – August 2022</h4>
        </div>
        <div class="block__description">
          <p>Train In Blocks developed an app for Personal Trainers to manage their clients more efficiently. I managed a team to develop and promote the app. My responsibilities included:</p>
          <ul>
            <li>Code reviewing other staff members work</li>
            <li>Testing the application for speed, use, and accessibility, among other things</li>
            <li>Managing the hosting of the application and website via Netlify</li>
            <li>Managing background functions needed to make the application work</li>
            <li>Managing the PHP API and adding new features and tables as and when needed</li>
            <li>Integrating the Stripe API with the application for payment processing for both us and our clients</li>
            <li>Managing the authentication flow of users via Okta</li>
            <li>Implementing new features within the VueJS application</li>
            <li>Responding to any bugs within the application</li>
            <li>Hiring staff members for our Marketing strategy</li>
            <li>Reviewing staff members performance</li>
            <li>Assigning tasks to marketing and development staff</li>
            <li>Analysing analytics to better serve our users</li>
            <li>Creating advertising campaigns to promote the application</li>
            <li>Planning marketing activities to promote the application</li>
            <li>Facilitating the necessary collaboration tools needed for staff members such as Jira, Discord, Google Drive</li>
            <li>Managing 3rd party suppliers of marketing services</li>
            <li>Writing technical dossiers for new staff members</li>
          </ul>
        </div>
      </div>
    </section>
    <section>
      <h2>Education</h2>
      <div class="block">
        <div class="block__info">
          <h3>Solent University</h3>
          <h4>Bsc with First Class Honours</h4>
          <h4>Web Design and Development</h4>
          <h4>September 2018 – June 2022</h4>
        </div>
        <div class="block__description">
          <p>Graduating Solent University with a First Class Honours took 4 years of hard work and dedication. My university experience as a whole helped build a strong foundation for my current development career.</p>
          <br>
          <p>Travelling to Denmark, I took part in a week long project working with students from around Europe to design a website for a real client. This gave me great independence, whilst also teaching me how to work as part of a team.</p>
          <br>
          <p>The Dynamo Challenge hosted at The University of Bournemouth and sponsored by Enterprise and IBM was a one-day event for students from different universities around the South of England. I teamed up with like-minded students to solve real-world problems that IBM were facing. This was a great day to network, problem-solve, and pitch ideas.</p>
        </div>
      </div>
    </section>
    <footer>
      <p>Portfolio: <a href="https://joebailey.xyz" target="_blank">https://joebailey.xyz</a></p>
      <p>GitHub: <a href="https://github.com/joebailey26" target="_blank">@joebailey26</a></p>
      <p>Email: <a href="mailto:joe@joebailey.xyz" target="_blank">joe@joebailey.xyz</a></p>
      <p>Phone: <a href="tel:+447477737535" target="_blank">07477737535</a></p>
    </footer>
  </div>
</template>

<script>
export default {
  layout: 'empty',
  data () {
    return {
      head: {
        title: 'CV'
      }
    }
  },
  head () {
    return {
      title: this.head.title,
      meta: [
        { hid: 'og:title', property: 'og:title', content: this.head.title },
        { hid: 'twitter:title', name: 'twitter:title', content: this.head.title }
      ]
    }
  }
}
</script>
