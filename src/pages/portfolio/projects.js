import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../components/layout"
import SEO from "../../components/seo"

import {tech, button} from "../../components/individualItem"

const ProjectsIndex = ({ data }) => {
  const posts = data.allWordpressPost.edges
    return (
      <Layout>
        <SEO title="Projects" />
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
                  <div className="tech-stack">{tech(node.acf.icons)}</div>
                </header>
                <div
                  dangerouslySetInnerHTML={{
                    __html: node.excerpt,
                  }}
                >
                </div>
                <div className="buttonsContainer">
                    {button(node.acf.project_url, "View the project")}
                    {button(node.acf.github, "View on GitHub")}
                    {button(node.acf.slug, "Continue Reading")}
                </div>
              </article>
          )
        })}
      </Layout>
    )
}

export default ProjectsIndex

export const pageQuery = graphql`
  query {
    allWordpressPost(filter: {categories: {elemMatch: {id: {eq: "625c7672-54a8-58c8-8055-a10672bcf3f6"}}}, status: {eq: "publish"}}) {
        edges {
          node {
            title
            excerpt
            slug
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
