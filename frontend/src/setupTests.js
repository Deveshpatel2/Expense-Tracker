// jest-dom adds custom matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// react-router v7 needs these; CRA's jsdom environment does not provide them.
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
