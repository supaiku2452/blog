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
        <Contents>
          <ArticleLayout>
          {blogPosts.map(({ node }) => (
            <ArticleItem key={node.fields.slug} node={node} />
          ))}
          </ArticleLayout>
           <Bio />
        </Contents>
      </MainLayout>
      <Footer />
    </div>
  )
}

const Contents = styled.div`
  display: flex;
`

const ArticleLayout = styled.div`
  display: block;
`

const MainLayout = styled.main`
  max-width: 1068px;
  padding: 0 30px 30px;
  margin: auto;
`

export default Layout
