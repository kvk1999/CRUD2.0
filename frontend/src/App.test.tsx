import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the authentication entry view', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /welcome back/i });
  expect(headingElement).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /new here/i })).toBeInTheDocument();
});
