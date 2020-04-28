import React from "react"
import { graphql } from "gatsby"

import IndexLayout from "../components/indexLayout"
import SEO from "../components/seo"
import {tech, button} from "../components/individualItem"

const Page = ({ data }) => {
  const posts = data.allWordpressPost.edges
  const categories = data.allWordpressCategory.edges
    return (
      <IndexLayout header=        
        {categories.map(({ node }) => {
          return ([
            <header>
              <h1 class="title">{node.name}</h1>
              <p className="description">{node.description}</p>
            </header>
          ])
        })}>
        <SEO title="Projects" slug="/projects" />
        {posts.map(({ node }) => {
          return (
              <article key={node.title} id={node.slug}>
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
                      {button(node.acf.project_url, "View the project")}
                      {button(node.acf.github, "View on GitHub")}
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
    allWordpressCategory(filter: {name: {eq: "Projects"}}) {
      edges {
        node {
          name
          description
        }
      }
    },
    allWordpressPost(filter: {categories: {elemMatch: {id: {eq: "625c7672-54a8-58c8-8055-a10672bcf3f6"}}}, status: {eq: "publish"}}, sort: { fields: [date] order: DESC }) {
        edges {
          node {
            title
            content
            acf {
              project_url
              github
              icons
            }
          }
        }
      }
  }
`