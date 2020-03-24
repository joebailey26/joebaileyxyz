import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const BlogIndex = ({ data }) => {
  const posts = data.allWordpressPost.edges
    return (
      <Layout>
        <SEO title="Blog" />
        {posts.map(({ node }) => {
          const title = node.title
            let t = node.date;
            t = t.substring(0, t.indexOf('T'));
          return (
              <article key={node.title} id={node.slug}>
                <header>
                  <h2 className="title">
                    <Link to={node.slug}
                      dangerouslySetInnerHTML={{
                      __html: title,
                      }}>
                    </Link>
                  </h2>
                  <time>{t}</time>
                </header>
                <div
                    dangerouslySetInnerHTML={{
                      __html: node.excerpt,
                    }}
                  >
                </div>
              </article>
          )
        })}
      </Layout>
    )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    allWordpressPost(filter: { 
        categories: { 
            elemMatch: {
                id: {
                    eq: "5dd9c949-a4d5-53db-85f7-b5375417cab6"
                }
            } 
        }, 
        status: {
            eq: "publish"
        }
    }) {
      edges {
        node {
          title
          date
          excerpt
          slug
        }
      }
    }
  }
`
