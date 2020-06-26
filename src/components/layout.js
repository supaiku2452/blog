import React from "react"
import styled from "styled-components"

import { Header } from "./header"

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <MainLayout>{children}</MainLayout>
      <FooterLayout>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.org">Gatsby</a>
      </FooterLayout>
    </div>
  )
}

const MainLayout = styled.main`
  padding: 0 30px;
`

const FooterLayout = styled.footer`
  padding: 0 30px;
`

export default Layout
