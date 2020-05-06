import React from "react"
import { graphql, Link } from "gatsby"

import IndexLayout from "../../components/indexLayout"
import SEO from "../../components/seo"
import {picture, tech, button} from "../../components/individualItem"

const Page = ({ data }) => {
  const posts = data.allWordpressPost.edges
  const categories = data.allWordpressCategory.edges
  function readDocs(link) {
    if (link) {
        return <Link to={link} className="btn">Read the docs</Link>
    }
  }
    return (
      <IndexLayout header=
        {categories.map(({ node }) => {
          return ([
            <header key={node.name}>
              <SEO title="Websites | Archive" slug="/archive/websites" description={node.description}/>
              <h1 className="title">{node.name}</h1>
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
                      {readDocs(node.acf.project_url)}
                      {button(node.acf.website, "View the website")}
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
    allWordpressCategory(filter: {name: {eq: "Websites"}}) {
      edges {
        node {
          name
          description
        }
      }
    },
    allWordpressPost(filter: {categories: {elemMatch: {name: {eq: "Websites"}}}, status: {eq: "publish"}, tags: { eq: 101 }}, sort: { fields: [date] order: DESC }) {
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