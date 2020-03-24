module.exports = {
  siteMetadata: {
    title: `Joe Bailey | Web Designer, Developer, Photographer | Southampton, UK`,
    author: `Joe Bailey`,
    description: `Joe Bailey.`,
    siteUrl: `https://joebailey.xyz/`,
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
  ],
}
