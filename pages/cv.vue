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
  margin-bottom: .66em
}
section {
  margin-top: 2rem;

  // page-break-after: always
}
.block {
  display: grid;
  gap: .5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;

  // page-break-inside: avoid;
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
  @page {
    margin-bottom: 0
  }
  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    margin-top: 15mm;
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
          <h3>Software Engineer at Priority Digital Health Ltd</h3>
          <h4>Remote, Full-time, July 2023 - Present</h4>
        </div>
        <div class="block__description">
          <p>PDH provides a patient management system for councils and charities, built with Symfony 6.4 and deployed to AWS ECS, alongside multiple React / TypeScript front-ends hosted on S3 via CloudFormation.</p>
          <p>I joined as a Backend Engineer, designing and building new APIs and core platform features. Within three months, I progressed to leading feature delivery end-to-end, working directly from client specifications through technical breakdown, development, testing, and deployment.</p>
          <p>After nine months, I transitioned into a Full-Stack Engineer, contributing extensively to the React front-end applications. At the twelve-month mark, I also took ownership of DevOps responsibilities, collaborating with our cloud partner to optimise deployment workflows, improve system stability under high concurrent load, and introduce proactive monitoring and bug-tracking capabilities.</p>
          <p>Over the past year, I have led multiple projects ranging from delivering new functionality (such as mailing list features) to optimising platform performance, including integrating Symfony Messenger to offload communication processing and significantly improve API response times.</p>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Web Developer at Rareloop Ltd</h3>
          <h4>Hybrid, Full-time, April 2022 - July 2023</h4>
        </div>
        <div class="block__description">
          <p>Rareloop is a WordPress agency in Southampton supporting a small roster of impactful clients, mainly charities.</p>
          <p>When I joined, I quickly ramped up on OOP PHP and Laravel, applying these principles to build and maintain MVC-based WordPress sites using ACF, Lumberjack, and Rareloop’s bespoke page builder.</p>
          <p>I contributed to the delivery of multiple client projects while continuously improving internal development processes, including iterating on the shared Canopy theme to improve maintainability and development efficiency.</p>
          <p>I valued working at a B Corp–certified company, focused on building high-quality, sustainable digital products and improving standards across the web.</p>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Development Liaison at Toolkit Websites Ltd</h3>
          <h4>Part-time, October 2021 – March 2022</h4>
        </div>
        <div class="block__description">
          <p>In a part-time capacity, I focused on higher-level technical initiatives while continuing my core responsibilities. I led the definition and technical breakdown of new features for internal CRM and CMS platforms, briefing backend developers and overseeing delivery.</p>
          <br />
          <br />
          <p>I managed critical infrastructure projects, including the migration of 1,400 domains from eNom to Cloudflare in response to a third-party outage, and supported the migration of the server stack from Rackspace to Azure.</p>
          <p>Alongside project delivery, I assessed team needs and implemented technical solutions to reduce operational friction, while ensuring thorough testing and stability across all internal systems.</p>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Development Liaison at Toolkit Websites Ltd</h3>
          <h4>Full-time, June 2021 – October 2021</h4>
        </div>
        <div class="block__description">
          <p>As my role at Toolkit Websites expanded, I took ownership of engineering standards, onboarding, and platform quality. I trained and onboarded new developers, creating comprehensive technical documentation, coding standards, and structured learning programmes to accelerate ramp-up time and ensure consistency across the codebase.</p>
          <p>I managed shared code snippets and style guides, reviewed development procedures and best practices, and performed regular code reviews and quality assurance across newly launched websites.</p>
          <p>In addition, I led the redesign of Toolkit’s main and support websites, carried out email migrations for clients, and managed client domain portfolios, including transfers and DNS configuration.</p>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Web Developer at Toolkit Websites Ltd</h3>
          <h4>Full-time, October 2020 – June 2021</h4>
        </div>
        <div class="block__description">
          <p>Toolkit Websites is a small Chichester agency supporting over 2,000 clients, emphasizing HTML5, CSS, and JavaScript to deliver responsive builds that stay easy to maintain.</p>
          <p>I worked across design, development, and client support, gaining hands-on experience in the full website delivery lifecycle. I designed logos and websites, built custom functionality to meet client requirements, and managed content using Toolkit’s bespoke CMS.</p>
          <p>Alongside delivery work, I provided direct client support via email and phone, consistently meeting a one-hour SLA, which helped build strong communication skills and an understanding of client needs.</p>
        </div>
      </div>
    </section>
    <section>
      <h2>Education</h2>
      <div class="block">
        <div class="block__info">
          <h3>Digital Design and Development Bsc with First Class Honours</h3>
          <h4>Southampton Solent University</h4>
          <h4>September 2018 – June 2022</h4>
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
