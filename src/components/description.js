import React from "react"
import { StaticQuery, graphql } from "gatsby"

export default function Description() {
  return (
    <StaticQuery
      query={graphql`
        query {
          site {
            siteMetadata {
              description
            }
          }
        }
      `}
      render={data => (
        <h5 className="description">{data.site.siteMetadata.description}</h5>
      )}
    />
  )
}