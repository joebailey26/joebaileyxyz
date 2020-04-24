/* 
    Blog Section
*/
import React from 'react'
import { useStaticQuery, graphql } from "gatsby"

import Icons from '../components/icons';
import Item from '../components/item';

const Blog = () => {
    const { allWordpressPost } = useStaticQuery(
        graphql`
            query {
                allWordpressPost(
                    filter: { 
                        categories: { 
                            elemMatch: {
                                id: {
                                    eq: "5dd9c949-a4d5-53db-85f7-b5375417cab6"
                                }
                            } 
                        }, 
                        status: {
                            eq: "publish"
                        }
                        },
                        limit: 6
                    ) 
                {
                edges {
                    node {
                    title
                    excerpt
                    slug
                    }
                }
                }
            }
        `
      )
    const posts = allWordpressPost.edges
    return (
        <section className="section section-blog" id="section-blog">
            <div className="row">
                <div className="col-md-8 ml-auto mr-auto">
                    <a href="/blog"><h2 className="text-center title">Blog</h2></a>
                </div>
            </div>
            <div className="items">
                <div className="row grid blog">{posts.map(({ node }) => {
                    return (
                        <Item 
                            key={node.title}
                            title={node.title}
                            desc={node.excerpt}
                            Link={node.slug}>
                        </Item>
                    )
                    })}
                </div>
                <Icons items="6"></Icons>
            </div>
        </section>
    )
}

export default Blog
