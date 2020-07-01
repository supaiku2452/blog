import React from "react";
import styled from "styled-components";
import { useNavigate } from "@reach/router";
import { Icon } from "./../Icon";

export const Header = () => {
  const navigate = useNavigate();
  const onClick = (path) => navigate(path, { replace: true });
  const onClickSafetyMoveWindow = (url) =>
    window.open(url, "_blank", "noopener,noreferrer");

  return (
    <Layout>
      janjan's blog
      <IconsLayout>
        <Icon iconName="home" onClick={() => onClick("/")} />
        {/* <Icon iconName="rss" /> */}
        <Icon
          iconName="github"
          onClick={() =>
            onClickSafetyMoveWindow("https://github.com/supaiku2452")}
        />
        <Icon
          iconName="twitter"
          onClick={() =>
            onClickSafetyMoveWindow("https://twitter.com/supaiku2452")}
        />
      </IconsLayout>
    </Layout>
  );
};

const Layout = styled.header`
  height: 48px;
  background-color: #fff;
  position: sticky;
  top: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  z-index: 100;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.5);
  padding-left: 24px;
  text-decoration-line: underline;
  cursor: pointer;
  justify-content: space-between;
`;

const IconsLayout = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 180px;
`;
