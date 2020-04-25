import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../../components/layout"
import SEO from "../../../components/seo"

import {tech, button} from "../../../components/individualItem"

const websitesIndex = ({ data }) => {
  const posts = data.allWordpressPost.edges
    return (
      <Layout>
        <SEO title="Websites" />
        {posts.map(({ node }) => {
          const title = node.title
          return (
              <article key={node.title} id={node.slug}>
                <header>
                  <h2 className="title">
                    <Link to={node.slug}>
                      {title}
                    </Link>
                  </h2>
                </header>
                <div
                  dangerouslySetInnerHTML={{
                    __html: node.excerpt,
                  }}
                >
                </div>
                <div className="buttonsContainer">
                    {button(node.acf.slug, "Continue Reading")}
                </div>
              </article>
          )
        })}
      </Layout>
    )
}

export default websitesIndex

export const pageQuery = graphql`
  query {
    allWordpressPost(filter: {categories: {elemMatch: {id: {eq: "a6ddce2d-885a-5e1c-96f3-8647e5ebdb49"}}}, status: {eq: "publish"}}) {
        edges {
          node {
            title
            excerpt
            slug
          }
        }
      }
    }
`