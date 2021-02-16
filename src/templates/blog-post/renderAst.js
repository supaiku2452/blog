import React from 'react'
import RehypeReact from 'rehype-react'
import styled from 'styled-components'

const h2 = styled.h2`
  margin-top: 2rem;
  margin-bottom: 1rem;
`

const h3 = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 1rem;
`

const p = styled.p`
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
`

const li = styled.li`
  margin-bottom: 0.5rem;
  > p {
    margin-bottom: 0.5rem;
  }
`;

const ul = styled.ul`
  margin-top: 0;
  margin-bottom: 0;
`

export const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: {
    h2,
    h3,
    p,
    ul,
    li
  }
}).Compiler;
