import React from "react"
import styled from "styled-components"
import { useNavigate } from "@reach/router"
import { Icon } from "../Icon"
import { rhythm } from "../../utils/typography.js"

export const Header = () => {
  const navigate = useNavigate()
  const onClick = () => navigate("/", { replace: true })
  return (
    <Layout onClick={onClick}>
      janjan's blog
      <IconsLayout>
        <Icon iconName="home" />
        <Icon iconName="rss" />
        <Icon iconName="github" />
        <Icon iconName="twitter" />
      </IconsLayout>
    </Layout>
  )
}

const Layout = styled.header`
  background-color: #fff;
  position: sticky;
  top: 0;
  font-size: ${rhythm(1 * 0.9)};
  display: flex;
  align-items: center;
  z-index: 100;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.5);
  padding-left: 24px;
  text-decoration-line: underline;
  cursor: pointer;
  justify-content: space-between;
`

const IconsLayout = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 180px;
`
