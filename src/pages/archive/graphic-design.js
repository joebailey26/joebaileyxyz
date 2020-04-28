import React from "react"
import { graphql, Link } from "gatsby"

import IndexLayout from "../../components/indexLayout"
import SEO from "../../components/seo"
import {picture, tech, button} from "../../components/individualItem"

const Page = ({ data }) => {
  const posts = data.allWordpressPost.edges
  const categories = data.allWordpressCategory.edges
    return (
      <IndexLayout header=
        {categories.map(({ node }) => {
          return ([
            <header key={node.name}>
              <h1 className="title">{node.name}</h1>
              <p className="description">{node.description}</p>
            </header>
          ])
        })}>
        <SEO title="Graphic Design | Archive" slug="/archive/graphic-design" />
        {posts.map(({ node }) => {
          return (
              <article key={node.title} id={node.slug} className="with_featureImage">
                {picture(node.jetpack_featured_media_url, node.title)}
                <header>
                  <h2 className="title"dangerouslySetInnerHTML={{
                      __html: node.title
                    }}
                    >
                  </h2>
                </header>
                <div className="tech-stack">{tech(node.acf.icons)}</div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: node.content
                    }}
                  >
                  </div>
                <footer>
                  <div className="buttonsContainer">
                      {button(node.acf.behance, "View on Behance")}
                  </div>
                </footer>
              </article>
          )
        })}
      </IndexLayout>
    )
}

export default Page

export const pageQuery = graphql`
  query {
    allWordpressCategory(filter: {name: {eq: "Graphic Design"}}) {
      edges {
        node {
          name
          description
        }
      }
    },
    allWordpressPost(filter: {categories: {elemMatch: {name: {eq: "Graphic Design"}}}, status: {eq: "publish"}}, sort: { fields: [date] order: DESC }) {
        edges {
          node {
            title
            content
            slug
            jetpack_featured_media_url
            acf {
              behance
              icons
            }
          }
        }
      }
    }
`