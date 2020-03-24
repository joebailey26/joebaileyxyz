const path = require(`path`)
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  return graphql(`
    {
      allWordpressPost(sort: { fields: [date] }, filter: { 
        categories: { 
          elemMatch: {
            name: {
              eq: "Web Design"
            }
          } 
        }
      }) {
        edges {
          node {
            title
            date
            content
            slug
            categories {
              name
            }
          }
          next {
            slug
            title
          }
          previous {
            slug
            title
          }
        }
      }
    }
  `).then(result => {
    result.data.allWordpressPost.edges.forEach(({ node, next, previous }) => {
        createPage({
          path: node.slug,
          component: path.resolve(`./src/templates/blog-post.js`),
          context: {
            slug: node.slug,
            next,
            previous
          },
        })
    })
  })
}