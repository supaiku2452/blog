import React from "react"
import styled from "styled-components"
import { Link } from "gatsby"
import { rhythm } from "../utils/typography.js"
import { Tags } from "./tags.js"
import { PublishDate } from "./publish-date.js"

export const ArticleItem = ({ node }) => {
  const title = node.frontmatter.title || node.fields.slug
  const tags = node.frontmatter.tags ?? []
  return (
    <article>
      <header>
        <H3>
          <ArticeLink to={node.fields.slug}>{title}</ArticeLink>
        </H3>
        <InfoHeader>
          <PublishDate date={node.frontmatter.date} />
          {tags.length > 0 && <Tags tags={tags} />}
        </InfoHeader>
      </header>
      <section>
        <p
          dangerouslySetInnerHTML={{
            __html: node.frontmatter.description || node.excerpt,
          }}
        />
      </section>
    </article>
  )
}

const H3 = styled.h3`
  margin-bottom: ${rhythm(1 / 4)};
`

const ArticeLink = styled(Link)`
  box-shadow: none;
`
const InfoHeader = styled.div`
  display: flex;
  > div:not(:first-child) {
    margin-left: 8px;
  }
`
