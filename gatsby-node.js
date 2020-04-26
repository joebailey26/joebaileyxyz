const path = require(`path`)
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  const blogs =  graphql(`
    {
      allWordpressPost(sort: { fields: [date] }, filter: { 
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
    if (result.errors) {
			Promise.reject(result.errors);
		}
    result.data.allWordpressPost.edges.forEach(({ node, next, previous }) => {
        createPage({
          path: "blog/" + node.slug,
          component: path.resolve(`./src/templates/blog-post.js`),
          context: {
            slug: node.slug,
            next,
            previous
          },
        })
    })
  })
  const joebaileyphoto = graphql(`
    {
      allWordpressPost(sort: { fields: [date] }, filter: { 
        categories: { 
          elemMatch: {
            id: {
              eq: "a6ddce2d-885a-5e1c-96f3-8647e5ebdb49"
            }
          } 
        },
        status: {
          eq: "publish"
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
    if (result.errors) {
      Promise.reject(result.errors);
    }
    result.data.allWordpressPost.edges.forEach(({ node, next, previous }) => {
      createPage({
        path: "portfolio/websites/joe-bailey-photography/" + node.slug,
        component: path.resolve(`./src/templates/joebaileyphoto-post.js`),
        context: {
          slug: node.slug,
          next,
          previous
        },
      })
  })
})
  const joebailey = graphql(`
    {
      allWordpressPost(sort: { fields: [date] }, filter: { 
        categories: { 
          elemMatch: {
            name: {
              eq: "Joe Bailey XYZ"
            }
          } 
        },
        status: {
          eq: "publish"
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
    if (result.errors) {
      Promise.reject(result.errors);
    }
    result.data.allWordpressPost.edges.forEach(({ node, next, previous }) => {
      createPage({
        path: "portfolio/websites/joe-bailey-xyz/" + node.slug,
        component: path.resolve(`./src/templates/joebailey-post.js`),
        context: {
          slug: node.slug,
          next,
          previous
        },
      })
  })
})

// Return a Promise which would wait for both the queries to resolve
return Promise.all([blogs, joebaileyphoto, joebailey]);

}
