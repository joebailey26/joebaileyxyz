import React from "react"
import { graphql } from "gatsby"

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
            <header>
              <SEO title="Website Designs | Archive" slug="/archive/website-templates" description={node.description}/>
              <h1 class="title">{node.name}</h1>
              <p className="description">{node.description}</p>
            </header>
          ])
        })}>
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
                  <div className="tech-stack">{tech(node.acf.icons)}</div>
                </header>
                <div
                  dangerouslySetInnerHTML={{
                    __html: node.content,
                  }}
                >
                </div>
                <footer>
                  <div className="buttonsContainer">
                    {button(node.acf.website, "View the website")}
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
    allWordpressCategory(filter: {name: {eq: "Website Templates"}}) {
      edges {
        node {
          name
          description
        }
      }
    },
    allWordpressPost(filter: {categories: {elemMatch: {name: {eq: "Website Templates"}}}, status: {eq: "publish"}}, sort: { fields: [date] order: DESC }) {
      edges {
        node {
          title
          content
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