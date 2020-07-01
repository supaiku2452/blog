import React from "react";
import { graphql } from "gatsby";

import SEO from "./../components/seo";
import { Header } from "./../components/Header";
import styled from "styled-components";

const NotFoundPage = ({ data }) => {
  return (
    <div>
      <Header />
      <SEO title="404: Not Found" />
      <Layout>
        <h1>Not Found</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      </Layout>
    </div>
  );
};

const Layout = styled.div`
  padding: 30px;
`;

export default NotFoundPage;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
