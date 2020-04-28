/* 
    Designs Section
*/
import React from 'react'
import { useStaticQuery, graphql, Link } from "gatsby"

import Icons from '../components/icons';
import Item from '../components/item';

const Portfolio = () => {
    const { allWordpressPost } = useStaticQuery(
        graphql`
            query {
                allWordpressPost(filter: {tags: {eq: 99}, categories: {elemMatch: {name: {eq: "Websites"}}}, status: {eq: "publish"}}, limit: 6, sort: { fields: [date] order: DESC }) {
                    edges {
                      node {
                        title
                        excerpt
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
      )
    const posts = allWordpressPost.edges
    return (
        <div>
            <Link to="/portfolio"><h2 className="text-center title">Portfolio</h2></Link>
            <div className="items">
                <div className="row grid websites">{posts.map(({ node }) => {
                    return (
                        <Item 
                            key={node.title}
                            title={node.title}
                            tech={node.acf.icons}
                            desc={node.excerpt}
                            websiteLink={node.acf.website}
                            docsLink={node.acf.project_url}
                            imgURL={node.jetpack_featured_media_url}
                            >
                        </Item>
                    )
                    })}
                </div>
                <Icons items="6"></Icons>
            </div>
        </div>
    )
}

export default Portfolio
