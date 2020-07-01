import React from "react"
import styled from "styled-components"
import { Link } from "gatsby"

export const Tag = ({ tagName }) => {
  return <Layout to={`/tags/${tagName}`}>{tagName}</Layout>
}

const Layout = styled(Link)`
  font-size: 16px;
  display: inline-block;
  cursor: pointer;
`
