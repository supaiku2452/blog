import React from "react";
import styled from "styled-components";

import { Header } from "./../Header";
import SEO from "./../seo";
import { ArticleItem } from "./../ArticleItem";
import { Footer } from "./../Footer";
import Bio from "./../bio";

const Layout = ({ blogPosts }) => {
  return (
    <div>
      <Header />
      <Bio />
      <MainLayout>
        <SEO title="All posts" />
        <>
          {blogPosts.map(({ node }) => (
            <ArticleItem key={node.fields.slug} node={node} />
          ))}
        </>
      </MainLayout>
      <Footer />
    </div>
  );
};

const MainLayout = styled.main`
  width: calc(100% - 300px);
  padding: 30px;
`;

export default Layout;
