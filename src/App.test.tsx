import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders file explorer', () => {
  const { getByText } = render(<App />);
  const fileExplorerElement = getByText(/项目文件夹/i);
  expect(fileExplorerElement).toBeInTheDocument();
});
