import React from "react"
import { graphql } from "gatsby"
import { Layout } from "./layout"

const BlogPostTemplate = ({ data, pageContext }) => {
  return <Layout data={data} pageContext={pageContext} />
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      htmlAst
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        tags
      }
    }
  }
`
