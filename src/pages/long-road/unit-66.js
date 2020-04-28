import React from "react"
import { graphql } from "gatsby"

import IndexLayout from "../../components/indexLayout"
import SEO from "../../components/seo"

const Page = ({ data }) => {
  const posts = data.allWordpressPost.edges
  const categories = data.allWordpressCategory.edges
    return (
      <IndexLayout header=
        {categories.map(({ node }) => {
          return ([
            <header>
                <SEO title={node.name + " | Long Road"} slug="/long-road/unit-66" />
                <h1 class="title">{node.name}</h1>
            </header>
          ])
        })}>
        {posts.map(({ node }) => {
          return (
              <article key={node.title} id={node.slug}>
                <header>
                  <h2 className="title"dangerouslySetInnerHTML={{
                        __html: node.title
                      }}
                  >
                  </h2>
                </header>
                <div
                  dangerouslySetInnerHTML={{
                    __html: node.content,
                  }}
                >
                </div>
              </article>
          )
        })}
      </IndexLayout>
    )
}

export default Page

export const pageQuery = graphql`
  query {
    allWordpressCategory(filter: {name: {eq: "Unit 66 - Animation Production"}}) {
        edges {
          node {
            name
          }
        }
    },
    allWordpressPost(filter: {categories: {elemMatch: {name: {eq: "Unit 66 - Animation Production"}}}, status: {eq: "publish"}}, sort: { fields: [title] order: ASC }) {
        edges {
          node {
            title
            content
          }
        }
      }
  }
`
