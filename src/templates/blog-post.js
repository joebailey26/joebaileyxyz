import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql } from "gatsby"
import { Link } from "gatsby"

export default ({ data, pageContext }) => {
  const post = data.allWordpressPost.edges[0].node
  const {next, previous } = pageContext
  const nextArticle = next && (
    <Link to={next.slug} class="next">
      <strong>Next Article </strong>
      {next.title}
    </Link>
  )

  const prevArticle = previous && (
    <Link to={previous.slug} class="previous">
      <strong>Previous Article </strong>
      {previous.title}
    </Link>
  )
  return (
    <Layout>
      <SEO title={post.title} />
      <article>
        <div class="navigation">
          {prevArticle}
          <div class="indexlink">
            <Link to="/"><strong>Back</strong> Home</Link>
          </div>
          {nextArticle}
        </div>
        <h1>{post.title}</h1>
        <section dangerouslySetInnerHTML={{ __html: post.content }} ></section>
        <div class="navigation">
          {prevArticle}
          <div class="indexlink">
            <Link to="/"><strong>Back</strong> Home</Link>
          </div>
          {nextArticle}
        </div>
      </article>
    </Layout>
  )
}
export const query = graphql`
  query($slug: String!) {
    allWordpressPost(filter: { slug: { eq: $slug } }) {
      edges {
        node {
          title
          date
          content
          categories {
            name
          }
          slug
        }
        next {
          title
          slug
        }
        previous {
          title
          slug
        }
      }
    }
  }
`
