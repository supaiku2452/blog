import React from "react";
import { Header } from "./../../components/Header";
import SEO from "./../../components/seo";
import { rhythm } from "./../../utils/typography.js";
import { Link } from "gatsby";
import { Tags } from "./../../components/Tags";
import styled from "styled-components";
import { PublishDate } from "./../../components/PublishDate";
import { Footer } from "./../../components/Footer";
import { renderAst } from "./renderAst";

export const Layout = ({ data, pageContext }) => {
  const post = data.markdownRemark;
  const { previous, next } = pageContext;
  const tags = post.frontmatter.tags ?? [];
  return (
    <div>
      <Header />
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <Article>
        <ArticleHeader>
          <H1>{post.frontmatter.title}</H1>
          <InfoHeader>
            <PublishDate date={post.frontmatter.date} />
            {tags.length > 0 && <Tags tags={tags} />}
          </InfoHeader>
        </ArticleHeader>
        {renderAst(post.htmlAst)}
        <HR />
        <footer />
      </Article>

      <Nav>
        <UL>
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </UL>
      </Nav>
      <Footer />
    </div>
  );
};

const Article = styled.article`
  max-width: 768px;
  padding: 0 30px;
  margin: auto;
`;
const ArticleHeader = styled.header`
  margin-bottom: 16px;
`;

const H1 = styled.h1`
  margin-top: ${rhythm(1)};
  margin-bottom: 0;
`;
const InfoHeader = styled.div`
  display: flex;
  > div:not(:first-child) {
    margin-left: 8px;
  }
`;
const Nav = styled.nav`
  padding: 0 30px;
  max-width: 768px;
  margin: auto;
`;
const HR = styled.hr`
  margin-bottom: ${rhythm(1)};
`;
const UL = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  list-style: none;
  padding: 0;
  margin-left: 0;
`;
