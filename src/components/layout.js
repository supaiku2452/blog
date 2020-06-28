import React from "react"
import styled from "styled-components"

import { Header } from "./header"
import SEO from "./seo"
import { rhythm } from "../utils/typography.js"
import { Link } from "gatsby"
import { Footer } from "./footer"

const Layout = ({ blogPosts }) => {
  return (
    <div>
      <Header />
      <MainLayout>
        <SEO title="All posts" />
        <>
          {blogPosts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug
            return (
              <article key={node.fields.slug}>
                <header>
                  <h3
                    style={{
                      marginBottom: rhythm(1 / 4),
                    }}
                  >
                    <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                      {title}
                    </Link>
                  </h3>
                  <small>{node.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: node.frontmatter.description || node.excerpt,
                    }}
                  />
                </section>
              </article>
            )
          })}
        </>
      </MainLayout>
      <Footer />
    </div>
  )
}

const MainLayout = styled.main`
  padding: 30px;
`

export default Layout
