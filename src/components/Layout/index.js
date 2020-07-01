import React from "react"
import styled from "styled-components"

import { Header } from "../header"
import SEO from "../seo"
import { ArticleItem } from "../articleItem"
import { Footer } from "../footer"
import Bio from "../bio"

const Layout = ({ blogPosts }) => {
  console.log("")
  return (
    <div>
      <Header />
      <Bio />
      <MainLayout>
        <SEO title="All posts" />
        <>
          {blogPosts.map(({ node }) => (
            <ArticleItem key={node.fields.slug} node={node} />
          ))}
        </>
      </MainLayout>
      <Footer />
    </div>
  )
}

const MainLayout = styled.main`
  width: calc(100% - 300px);
  padding: 30px;
`

export default Layout
