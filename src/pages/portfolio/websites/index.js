import React from "react"
import { graphql } from "gatsby"

import IndexLayout from "../../../components/indexLayout"
import SEO from "../../../components/seo"
import Share from "../../../components/share"
import {picture, tech, button} from "../../../components/individualItem"

const websitesIndex = ({ data }) => {
  const posts = data.allWordpressPost.edges
  const categories = data.allWordpressCategory.edges
  const site = data.site.siteMetadata
    return (
      <IndexLayout>
        <SEO title="Websites" slug="/portfolio/websites" />
        {categories.map(({ node }) => {
          return (
            <header>
              <h1 class="title">{node.name}</h1>
              <p className="description">{node.description}</p>
            </header>
          )
        })}
        {posts.map(({ node }) => {
          const title = node.title
          return (
              <article key={node.title} id={node.slug} className="with_featureImage">
                {picture(node.jetpack_featured_media_url, node.title)}
                <header>
                  <h2 className="title">
                      {title}
                  </h2>
                </header>
                <div className="tech-stack">{tech(node.acf.icons)}</div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: node.content,
                  }}
                >
                </div>
                <footer>
                  <div className="buttonsContainer">
                      {button(node.acf.project_url, "Read the docs")}
                      {button(node.acf.website, "View the website")}
                  </div>
                  <Share url={site.siteUrl} title={node.title} twitterHandle={site.twitterHandle}></Share>
                </footer>
              </article>
          )
        })}
      </IndexLayout>
    )
}

export default websitesIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        siteUrl
        twitterHandle
      }
    },
    allWordpressCategory(filter: {name: {eq: "Websites"}}) {
      edges {
        node {
          name
          description
        }
      }
    },
    allWordpressPost(filter: {categories: {elemMatch: {name: {eq: "Websites"}}}, status: {eq: "publish"}}) {
        edges {
          node {
            title
            content
            slug
            jetpack_featured_media_url
            acf {
              project_url
              website
              icons
            }
          }
        }
      }
    }
`