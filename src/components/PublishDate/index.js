import React from "react"
import styled from "styled-components"

export const PublishDate = ({ date }) => {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = d.getMonth() + 1
  const dd = d.getDate()
  return <Layout>{`Published: ${yyyy}/${mm}/${dd}`}</Layout>
}

const Layout = styled.div`
  font-size: 16px;
`
