import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../components/layout"
import SEO from "../../components/seo"

const BlogIndex = ({ data }) => {
  const posts = data.allWordpressPost.edges
    return (
      <Layout>
        <SEO title="Projects" />
        {posts.map(({ node }) => {
          const title = node.title
            let t = node.date;
            t = t.substring(0, t.indexOf('T'));
          return (
              <article key={node.title} id={node.slug}>
                <header>
                  <h2 className="title">
                    <Link to={node.slug}>
                      {title}
                    </Link>
                  </h2>
                  <time>{t}</time>
                  <div>{JSON.stringify(node.categories.name)}</div>
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
                name: {
                    eq: "Projects"
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
