import React from "react"
import styled from "styled-components"
import { Tag } from "./tag"

export const Tags = ({ tags }) => {
  return (
    <Layout>
      Tags:&nbsp;
      {tags.map(tag => (
        <Tag key={tag} tagName={tag} />
      ))}
    </Layout>
  )
}

const Layout = styled.div`
  font-size: 16px;
  > *:not(:first-child) {
    margin-left: 4px;
  }
`
