import React from 'react';
import { Router } from 'react-easy-stack';
import styled from 'styled-components';
import { ease, layout } from './theme';

const StyledRouter = styled(Router)`
  position: relative;

  > * {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    will-change: auto;
    contain: style layout;
  }
`;

const enterAnimation = () => ({
  keyframes: layout.isMobile
    ? {
        transform: ['translateX(110%)', 'none']
      }
    : {
        opacity: [0, 1]
      },
  duration: 150,
  ease: ease.in,
  fill: 'both'
});

const leaveAnimation = () => {
  const scrollY = document.getElementById('root').scrollTop;

  return {
    keyframes: layout.isMobile
      ? {
          transform: [
            `translateY(-${scrollY}px)`,
            `translate3d(-110%, -${scrollY}px, 0)`
          ]
        }
      : {
          opacity: [1, 0],
          transform: [`translateY(-${scrollY}px)`, `translateY(-${scrollY}px)`]
        },
    duration: 150,
    ease: ease.out,
    fill: 'both'
  };
};

export default function AnimatedRouter({ children, ...rest }) {
  return (
    <StyledRouter
      {...rest}
      enterAnimation={enterAnimation}
      leaveAnimation={leaveAnimation}
    >
      {children}
    </StyledRouter>
  );
}
