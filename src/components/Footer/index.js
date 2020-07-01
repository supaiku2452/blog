import React from "react"
import styled from "styled-components"

export const Footer = () => {
  return (
    <FooterLayout>
      © {new Date().getFullYear()}, Built with
      {` `}
      <a href="https://www.gatsbyjs.org">Gatsby</a>
    </FooterLayout>
  )
}

const FooterLayout = styled.footer`
  padding: 0 30px;
`
