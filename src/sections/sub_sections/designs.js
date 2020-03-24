/* 
    Designs Section
*/
import React from 'react'
import { useStaticQuery, graphql } from "gatsby"

import Icons from '../../components/icons';
import Item from '../../components/item';

const Designs = () => {
    const { allWordpressPost } = useStaticQuery(
        graphql`
            query {
                allWordpressPost(filter: {categories: {elemMatch: {name: {eq: "Website Templates"}}}, status: {eq: "publish"}}, limit: 6) {
                    edges {
                      node {
                        title
                        excerpt
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
      )
    const posts = allWordpressPost.edges
    return (
        <div class="items">
            <div className="row grid designs">{posts.map(({ node }) => {
                return (
                    <Item 
                        title={node.title}
                        tech={node.acf.icons}
                        desc={node.excerpt}
                        infoLink={node.slug}
                        projectLink={node.acf.project_url}
                        Link={node.slug}
                        docsLink={node.slug}
                        picture="no">
                    </Item>
                )
                })}
            </div>
            <Icons items="6"></Icons>
        </div>
    )
}

export default Designs
