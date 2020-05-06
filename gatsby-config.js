module.exports = {
  siteMetadata: {
    title: `Joe Bailey | Web Designer, Developer, Photographer | Southampton, UK`,
    author: `Joe Bailey`,
    description: `My passion for web development has always been present both prior to, and at College and University. As a result, I have gained experience in a variety of areas. This includes developing bespoke WordPress sites, creating PWAs and APIs, static HTML, CSS, and JavaScript sites, dynamic Jamstack sites, and working with clients. I'm currently freelancing whilst studying at Southampton Solent University.`,
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
