import React from "react"
import { graphql } from "gatsby"

import Layout from "./../components/Layout"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges
  return <Layout location={location} title={siteTitle} blogPosts={posts} />
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt(truncate: true)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            tags
          }
        }
      }
      group(field: frontmatter___tags) {
        tag: fieldValue
        totalCount
      }
    }
  }
`
