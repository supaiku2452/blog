import React from "react"
import styled from "styled-components"

import { Header } from "../header"
import SEO from "../seo"
import { ArticleItem } from "../articleItem"
import { Footer } from "../footer"

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
      <Footer />
    </div>
  )
}

const MainLayout = styled.main`
  padding: 30px;
`

export default Layout
