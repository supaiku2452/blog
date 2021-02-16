import React from "react"
import styled from "styled-components"

import { Header } from "./../Header"
import SEO from "./../seo"
import { ArticleItem } from "./../ArticleItem"
import { Footer } from "./../Footer"
import Bio from "./../bio"

const Layout = ({ blogPosts }) => {
  return (
    <div>
      <Header />
      <MainLayout>
        <SEO title="All posts" />
        <>
          {blogPosts.map(({ node }) => (
            <ArticleItem key={node.fields.slug} node={node} />
          ))}
        </>
      </MainLayout>
      <Bio />
      <Footer />
    </div>
  )
}

const MainLayout = styled.main`
  width: calc(100% - 300px);
  @media (max-width: 768px) {
    width: 100%;
  }
  padding: 0 30px 30px;
`

export default Layout
