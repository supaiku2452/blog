import React from "react"
import styled from "styled-components"
import { useNavigate } from "@reach/router"

export const Header = () => {
  const navigate = useNavigate()
  const onClick = () => navigate("/", { replace: true })
  return <Layout onClick={onClick}>janjan's blog</Layout>
}

// TODO: 右側にホームとかアイコンもろもろおきたい

const Layout = styled.header`
  height: 64px;
  background-color: #fff;
  position: sticky;
  top: 0;
  font-size: 30px;
  display: flex;
  align-items: center;
  z-index: 100;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.5);
  padding-left: 24px;
  text-decoration-line: underline;
  cursor: pointer;
`
