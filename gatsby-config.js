module.exports = {
  siteMetadata: {
    title: `Joe Bailey | Front-End Web Developer | Southampton, UK / Cambridge, UK`,
    author: `Joe Bailey`,
    description: `My passion for web development has always been present. I am excited by building sites that are accessible, SEO friendly and fast. To do this I use a variety of tools such as WordPress, Gatsby, React, Vue, and other frameworks. Despite using many current frameworks, I have a strong grounding in HTML, CSS, and JavaScript. Whilst developing sites I have gained experience with CI/CD chains and a variety of hosting platforms such as Digital Ocean, Netlify, Firebase, and Cloudflare. I have been following the continuous growth of technologies such as PWAs and the Jamstack. I'm currently freelancing whilst studying at Southampton Solent University.`,
    siteUrl: `https://joebailey.xyz`,
    twitterHandle: `@joebailey26`,
  },
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        // your WordPress source
        baseUrl: `www.joebaileyphotography.com/Blog/`,
        protocol: `https`,
        // is it hosted on wordpress.com, or self-hosted?
        hostingWPCOM: false,
        // does your site use the Advanced Custom Fields Plugin?
        useACF: true,
        includedRoutes: [
          "**/posts",
          "**/categories",
        ],
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-netlify`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Joe Bailey`,
        short_name: `Joe Bailey`,
        start_url: `/`,
        background_color: `#004c3f`,
        theme_color: `#004c3f`,
        display: `browser`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-384x384.png`,
            sizes: `384x384`,
            type: `image/png`,
          },
        ],
      },
    },
  ],
}
