import React from "react";
import { Header } from "./../../components/Header";
import SEO from "./../../components/seo";
import styled from "styled-components";
import { Footer } from "./../../components/Footer";
import { ArticleItem } from "./../../components/ArticleItem";

export const Layout = ({ data, pageContext }) => {
  const { tag } = pageContext;
  const { edges } = data.allMarkdownRemark;

  return (
    <div>
      <Header />
      <MainLayout>
        <header>
          <h2>{tag}</h2>
        </header>
        <SEO title="All posts" />
        <>
          {edges.map(({ node }) => (
            <ArticleItem key={node.fields.slug} node={node} />
          ))}
        </>
      </MainLayout>
      <Footer />
    </div>
  );
};

const MainLayout = styled.main`
  padding: 30px;
`;
