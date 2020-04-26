/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

const SEO = ({ title, slug, image, lang, type }) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            siteUrl
          }
        }
      }
    `
  )

  const metaImage = image || site.siteMetadata.siteUrl + "/assets/img/header.jpg"

  let schema = {
    "@context": "https://schema.org",
      "@type": "Person",
      "email": "joe@joebailey.xyz",
      "image": site.siteMetadata.siteUrl + "/assets/img/Me.jpg",
      "jobTitle": "Front-End Web Developer",
      "name": "Joe Bailey",
      "birthPlace": "Cambridge, UK",
      "birthDate": "2000-06-02",
      "gender": "male",
      "nationality": "English",
      "telephone": "+44 7477737535",
      "url": "https://joebailey.xyz",
	    "sameAs" : [ "https://www.linkedin.com/in/joe-bailey-b68b17171/",
      "https://twitter.com/JoeBailey26",
      "https://www.behance.net/joebailey26",
      "https://github.com/joebailey26",
      "https://codepen.io/joebailey26"]
  }

  return (
    <Helmet
      htmlAttributes={{lang}}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
    >
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
      <link rel="canonical" href={site.siteMetadata.siteUrl + slug} />
      <meta name="og:url" content={site.siteMetadata.siteUrl + slug} />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#004c3f"/>
      <meta name="msapplication-TileColor" content="#004c3f"/>
      <meta name="theme-color" content="#282828"/>
      <meta name="og:image" content={site.siteMetadata.siteUrl + metaImage} />
      <meta name="og:title" content={title} />
      <meta name="og:type" content={type} />
      <meta name="twitter:creator" content="@JoeBailey26" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:image" content={site.siteMetadata.siteUrl + metaImage} />
    </Helmet>
  )
}

SEO.defaultProps = {
  lang: `en-GB`,
  image: `/assets/img/header.jpg`,
  type: "website"
}

SEO.propTypes = {
  image: PropTypes.string,
  lang: PropTypes.string,
  type: PropTypes.string,
  title: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired  
}

export default SEO
