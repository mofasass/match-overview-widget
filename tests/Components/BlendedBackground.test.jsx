/* eslint-env jest */
import React, { Children } from 'react';
import ReactShallowRenderer from 'react-test-renderer/shallow';
import ReactTestRenderer from 'react-test-renderer';
import { mount } from 'enzyme';
import BlendedBackground from '../../src/js/Components/BlendedBackground';

let renderer;
let mockMobile = false;

jest.mock('../../src/js/Services/mobile', () => () => mockMobile);
jest.mock('../../src/custom/overview-bw-bg-desktop.jpg', () => 'overview-bw-bg-desktop.jpg');
jest.mock('../../src/custom/overview-bw-bg-mobile.jpg', () => 'overview-bw-bg-mobile.jpg');

describe('BlendedBackground DOM rendering', () => {

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
      mockMobile = false;
   });

   it('renders correctly with default props', () => {
      expect(renderer.render(
         <BlendedBackground />
      )).toMatchSnapshot();
   });

   it('renders correctly on mobile device', () => {
      mockMobile = true;

      expect(renderer.render(
         <BlendedBackground />
      )).toMatchSnapshot();
   });

   it('resizes correctly to mobile mode', () => {
      mockMobile = false;

      const tree = ReactTestRenderer.create(
         <BlendedBackground />
      );

      expect(tree).toMatchSnapshot();

      mockMobile = true;

      window.dispatchEvent(new Event('resize'));

      expect(tree).toMatchSnapshot();
   });

   it('resizes correctly to desktop mode', () => {
      mockMobile = true;

      const tree = ReactTestRenderer.create(
         <BlendedBackground />
      );

      expect(tree).toMatchSnapshot();

      mockMobile = false;

      window.dispatchEvent(new Event('resize'));

      expect(tree).toMatchSnapshot();
   });

   it('stays in proper mode on non-significant screen size change', () => {
      const tree = ReactTestRenderer.create(
         <BlendedBackground />
      );

      expect(tree).toMatchSnapshot();

      window.dispatchEvent(new Event('resize'));

      expect(tree).toMatchSnapshot();
   });

});

describe('BlendedBackground interface', () => {

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
   });

   it('unmounts correctly', () => {
      const wrapper = mount(
         <BlendedBackground />
      );
      wrapper.unmount();
   });

});
