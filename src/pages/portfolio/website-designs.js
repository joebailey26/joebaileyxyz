import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../components/layout"
import SEO from "../../components/seo"

import {picture, tech, button} from "../../components/individualItem"

const websiteDesignsIndex = ({ data }) => {
  const posts = data.allWordpressPost.edges
    return (
      <Layout>
        <SEO title="Website Designs" />
        {posts.map(({ node }) => {
          const title = node.title
          return (
              <article key={node.title} id={node.slug}>
                {picture(node.jetpack_featured_media_url, node.title)}
                <header>
                  <h2 className="title">
                    <Link to={node.slug}>
                      {title}
                    </Link>
                  </h2>
                  <div className="tech-stack">{tech(node.acf.icons)}</div>
                </header>
                <div
                  dangerouslySetInnerHTML={{
                    __html: node.excerpt,
                  }}
                >
                </div>
                <div className="buttonsContainer">
                    {button(node.acf.website, "View the website")}
                    {button(node.acf.behance, "View on Behance")}
                    {button(node.acf.slug, "Continue Reading")}
                </div>
              </article>
          )
        })}
      </Layout>
    )
}

export default websiteDesignsIndex

export const pageQuery = graphql`
  query {
    allWordpressPost(filter: {categories: {elemMatch: {name: {eq: "Website Templates"}}}, status: {eq: "publish"}}) {
      edges {
        node {
          title
          excerpt
          slug
          jetpack_featured_media_url
          acf {
            website
            behance
            icons
          }
        }
      }
    }
  }
`