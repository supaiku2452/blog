/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import { rhythm } from "./../utils/typography"
import { Icon } from "./Icon"
import styled from "styled-components"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/logo.png/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `)

  const { author } = data.site.siteMetadata
  const onClickSafetyMoveWindow = url =>
    window.open(url, "_blank", "noopener,noreferrer")
  return (
    <Layout>
      <IconsLayout>
        <Image
          fixed={data.avatar.childImageSharp.fixed}
          alt={author.name}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            minWidth: 50,
            borderRadius: `100%`,
          }}
          imgStyle={{
            borderRadius: `50%`,
          }}
        />
        <IconLayout>
          <IconWithText
            text="@supaiku2452"
            iconName="github"
            onClick={() =>
              onClickSafetyMoveWindow("https://github.com/supaiku2452")
            }
          />
          <IconWithText
            text="@supaiku2452"
            iconName="twitter"
            onClick={() =>
              onClickSafetyMoveWindow("https://twitter.com/supaiku2452")
            }
          />
        </IconLayout>
      </IconsLayout>
      <Paragraph>
        Written by <strong>{author.name}</strong>
        <br />
        <Summary>{author.summary}</Summary>
      </Paragraph>
    </Layout>
  )
}

const IconsLayout = styled.div`
  display: flex;
  align-items: center;
`

const IconLayout = styled.div`
  display: flex;
  flex-direction: column;
`

const IconWithText = ({ text, iconName, onClick }) => (
  <LayoutButton
    onClick={onClick}
    onKeyDown={onClick}
    role="button"
    tabIndex="-1"
  >
    <Icon iconName={iconName} />
    <Text>{text}</Text>
  </LayoutButton>
)

const Layout = styled.div`
  width: 300px;
  right: 0;
  top: 60px;
  position: absolute;
  @media (max-width: 768px) {
    width: auto;
    position: initial;
  }
  margin: 16px 16px 0;
  border: 1px solid black;
  padding: 12px;
  background-color: #ffffff;
`

const LayoutButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`
const Text = styled.span`
  line-height: 1;
`
const Summary = styled.div`
  line-height: 1.2;
`

const Paragraph = styled.p`
  margin: 0;
`
export default Bio
