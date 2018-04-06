import React from 'react';
import { Router } from 'react-easy-stack';

const enterAnimation = {
  keyframes: {
    opacity: [0, 1],
    transform: ['translateX(100px)', 'none']
  },
  duration: 200
};

const leaveAnimation = {
  keyframes: {
    opacity: [1, 0],
    transform: ['none', 'translateX(100px)']
  },
  duration: 200
};

export default function AppRouter({ children, ...props }) {
  return (
    <Router
      {...props}
      enterAnimation={enterAnimation}
      leaveAnimation={leaveAnimation}
    >
      {children}
    </Router>
  );
}
