/* eslint-env jest */
import React from 'react';
import ReactShallowRenderer from 'react-test-renderer/shallow';
import TournamentLogo from '../../src/js/Components/TournamentLogo';

let renderer;

describe('Event DOM rendering', () => {

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
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
