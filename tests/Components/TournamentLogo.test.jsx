/* eslint-env jest */
import React, { Children } from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import TournamentLogo from '../../src/js/Components/TournamentLogo';

let renderer;

describe('Event DOM rendering', () => {

   beforeEach(() => {
      renderer = ReactTestUtils.createRenderer();
   });

   it('renders correctly with default props', () => {
      expect(renderer.render(
         <TournamentLogo />
      )).toMatchSnapshot();
   });

   it('renders correctly with custom logo CSS class name', () => {
      expect(renderer.render(
         <TournamentLogo logoClassName="test_logo_class_name" />
      )).toMatchSnapshot();
   });

});
