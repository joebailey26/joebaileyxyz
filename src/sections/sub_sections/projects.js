/* 
    Projects Section
*/
import React from 'react'
import { useStaticQuery, graphql } from "gatsby"

import Icons from '../../components/icons';
import Item from '../../components/item';

const Projects = () => {
    const { allWordpressPost } = useStaticQuery(
        graphql`
            query {
                allWordpressPost(filter: {categories: {elemMatch: {id: {eq: "625c7672-54a8-58c8-8055-a10672bcf3f6"}}}, status: {eq: "publish"}}, limit: 6) {
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
      )
    const posts = allWordpressPost.edges
    return (
        <div class="items">
            <div className="row grid projects">{posts.map(({ node }) => {
                return (
                    <Item 
                        title={node.title}
                        tech={node.acf.icons}
                        desc={node.excerpt}
                        infoLink={node.slug}
                        projectLink={node.acf.project_url}
                        Link={node.slug}
                        docsLink={node.slug}>
                    </Item>
                )
                })}
            </div>
            <Icons items="6"></Icons>
        </div>
    )
}

export default Projects
