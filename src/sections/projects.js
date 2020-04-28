/* 
    Projects Section
*/
import React from 'react'
import { useStaticQuery, graphql, Link } from "gatsby"

import Icons from '../components/icons';
import Item from '../components/item';

const Projects = () => {
    const { allWordpressPost } = useStaticQuery(
        graphql`
            query {
                allWordpressPost(filter: {categories: {elemMatch: {id: {eq: "625c7672-54a8-58c8-8055-a10672bcf3f6"}}}, status: {eq: "publish"}}, limit: 6, sort: { fields: [date] order: DESC }) {
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
        <div>
            <Link to="projects"><h2 className="text-center title">Projects</h2></Link>
            <div id="git">
                <div className="col-md-8 ml-auto mr-auto">
                    <h3>GitHub Contributions</h3>
                    <a title="GitHub Contributions" href="https://github.com/joebailey26">
                        <img src="https://ghchart.rshah.org/joebailey26" alt="Joe's Github chart" width="100%" />
                        <i className="fab fa-github"></i>
                        <h5>View my profile on GitHub.</h5>
                    </a>
                </div>
            </div>
            <div className="items">
                <div className="row grid projects">{posts.map(({ node }) => {
                    return (
                        <Item
                            key={node.title} 
                            title={node.title}
                            tech={node.acf.icons}
                            desc={node.excerpt}
                            projectLink={node.acf.project_url}
                            gitHubLink={node.acf.github}>
                        </Item>
                    )
                    })}
                </div>
                <Icons items="6"></Icons>
            </div>
        </div>
    )
}

export default Projects
