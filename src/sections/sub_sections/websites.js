/* 
    Designs Section
*/
import React from 'react'
import { useStaticQuery, graphql } from "gatsby"

import Icons from '../../components/icons';
import Item from '../../components/item';

const Websites = () => {
    const { allWordpressPost } = useStaticQuery(
        graphql`
            query {
                allWordpressPost(filter: {tags: {eq: 99}, categories: {elemMatch: {name: {eq: "Websites"}}}, status: {eq: "publish"}}, limit: 6) {
                    edges {
                      node {
                        title
                        excerpt
                        slug
                        jetpack_featured_media_url
                        acf {
                          website
                          icons
                        }
                      }
                    }
                  }
            }
        `
      )
    const posts = allWordpressPost.edges
    return (
        <div className="items">
            <div className="row grid websites">{posts.map(({ node }) => {
                return (
                    <Item 
                        key={node.title}
                        title={node.title}
                        tech={node.acf.icons}
                        desc={node.excerpt}
                        websiteLink={node.acf.website}
                        imgURL={node.jetpack_featured_media_url}
                        >
                    </Item>
                )
                })}
            </div>
            <Icons items="6"></Icons>
        </div>
    )
}

export default Websites
