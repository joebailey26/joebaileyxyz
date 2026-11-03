<style scoped lang="scss">
* {
  margin: 0
}

// Outside @media screen so print doesn't inherit the dark theme's light body text.
.cv {
  color: var(--grey)
}
.header__title {
  text-align: center
}
.header__role {
  margin-top: .25rem;
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center
}
p.header__description {
  margin-top: .75rem;
  font-size: 1.1rem;
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
  p {
    white-space: nowrap
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
      <h2 class="header__role">
        Lead Project Engineer
      </h2>
      <p class="header__description">
        I turn client problems into engineering plans, and lead teams to deliver them.
      </p>
    </header>
    <section>
      <h2>Work History</h2>
      <div class="block">
        <div class="block__info">
          <h3>Lead Project Engineer at Priority Digital Health Ltd</h3>
          <h4>Remote, Full-time, January 2026 - Present</h4>
        </div>
        <div class="block__description">
          <p>PDH provides a patient management system for councils and charities: a Symfony 6.4 platform on AWS ECS, React / TypeScript front-ends on S3, and a Flutter app where patients track goals like stopping smoking or losing weight.</p>
          <p>I own projects end-to-end and lead the developers who deliver them, from designing the engineering solution and estimating the work to running stakeholder demos through to sign-off.</p>
          <p>I manage our external DevOps team. We moved ECS to scaling on PHP-FPM capacity, which ended outages from traffic spikes and cut costs by reducing our minimum containers from 8 to 3.</p>
          <p>I proposed and am leading our move from GoGrow to Grafana, cutting dashboard update times from 2 hours to near-instant and letting anyone in the business build reports.</p>
          <p>I replaced manual patient entry with an AI PDF reader that creates patients from GP forms, cutting the time to add a patient by 40%.</p>
          <p>I moved us from reactive to proactive, with uptime monitoring across 150+ sites and production errors raised automatically as Jira issues from New Relic, so we catch problems before clients report them.</p>
          <p>I rolled out GitHub Copilot and Claude to our developers, taking feature delivery from 1-2 a month to 3-4, and PRs from 5-6 a week to 10-15.</p>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Software Engineer at Priority Digital Health Ltd</h3>
          <h4>Hybrid, Full-time, July 2023 - January 2026</h4>
        </div>
        <div class="block__description">
          <p>I joined as a Backend Engineer building APIs and core platform features, and was delivering my own features independently within three months. I moved to full-stack work on our React front-ends at nine months and took on DevOps at twelve.</p>
          <p>Transactional emails were sent by a cron job that timed out on large batches, dropping client-critical comms. I moved sending onto a Symfony Messenger queue that now delivers every message. Event-driven comms also moved to the queue, making API response times 30% faster.</p>
          <p>I also upgraded the platform from PHP 7.4 to 8.4, connected it to the NHS Personal Demographics Service (PDS), and integrated GOV.UK Notify and Power2SMS.</p>
        </div>
      </div>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <div class="block">
        <div class="block__info">
          <h3>Web Developer at Rareloop Ltd</h3>
          <h4>Hybrid, Full-time, April 2022 - July 2023</h4>
        </div>
        <div class="block__description">
          <p>Rareloop is a B Corp–certified WordPress agency in Southampton working mainly with charities. I ramped up quickly on OOP PHP and Laravel, building MVC-based WordPress sites with ACF and Lumberjack, and improved the shared Canopy theme used across client projects.</p>
        </div>
      </div>
      <div class="block">
        <div class="block__info">
          <h3>Web Developer, then Development Liaison at Toolkit Websites Ltd</h3>
          <h4>Full-time, then part-time, October 2020 – March 2022</h4>
        </div>
        <div class="block__description">
          <p>Toolkit Websites is a Chichester agency supporting over 2,000 clients. I started as a Web Developer, designing and building client sites and supporting clients to a one-hour SLA.</p>
          <p>As Development Liaison, I trained new developers, wrote our coding standards and documentation, and ran code reviews. I briefed and oversaw new CRM and CMS features, migrated 1,400 domains from eNom to Cloudflare after a third-party outage, and supported a server move from Rackspace to Azure.</p>
        </div>
      </div>
    </section>
    <section>
      <h2>Education</h2>
      <div class="block">
        <div class="block__info">
          <h3>Digital Design and Development BSc with First Class Honours</h3>
          <h4>Southampton Solent University</h4>
          <h4>September 2018 – June 2022, completed alongside full-time work</h4>
        </div>
      </div>
    </section>
    <footer>
      <p>Cambridge, UK</p>
      <p><a href="mailto:joe@joebailey.xyz" target="_blank">joe@joebailey.xyz</a></p>
      <p><a href="tel:+447477737535" target="_blank">07477 737535</a></p>
      <p><a href="https://github.com/joebailey26" target="_blank">GitHub</a></p>
      <p><a href="https://www.linkedin.com/in/joe-bailey-b68b17171/" target="_blank">LinkedIn</a></p>
      <p><a href="https://joebailey.xyz" target="_blank">joebailey.xyz</a></p>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'empty'
})

usePageMeta({
  title: 'CV'
})
</script>
