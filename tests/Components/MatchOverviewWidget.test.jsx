/* eslint-env jest */
import React from 'react';
import ReactShallowRenderer from 'react-test-renderer/shallow';
import { mount } from 'enzyme';
import MatchOverviewWidget from '../../src/js/Components/MatchOverviewWidget';

let renderer;

const mockEvent = {
   event: {
      id: 100
   },
   liveData: {},
   betOffers: []
};

let mockMobile = false;

jest.mock('../../src/js/Services/mobile', () => () => mockMobile);

jest.useFakeTimers();

describe('MatchOverviewWidget DOM rendering', () => {

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
      mockMobile = false;
   });

   it('renders correctly with default props', () => {
      expect(renderer.render(
         <MatchOverviewWidget events={[]} />
      )).toMatchSnapshot();
   });

   it('renders correctly with tournament logo', () => {
      expect(renderer.render(
         <MatchOverviewWidget events={[]} tournamentLogo="test_tournament_logo" />
      )).toMatchSnapshot();
   });

   it('renders correctly with events', () => {
      expect(renderer.render(
         <MatchOverviewWidget
            events={[
               Object.assign({}, mockEvent, {event: {id: 100}}),
               Object.assign({}, mockEvent, {event: {id: 200}})
            ]} />
      )).toMatchSnapshot();
   });

   it('renders correctly with events and betoffers', () => {
      expect(renderer.render(
         <MatchOverviewWidget
            events={[
               Object.assign({}, mockEvent, {event: {id: 100}, betOffers: [{outcomes: []}]}),
               Object.assign({}, mockEvent, {event: {id: 200}, betOffers: [{outcomes: []}]})
            ]} />
      )).toMatchSnapshot();
   });

});

describe('MatchOverviewWidget behaviour', () => {

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
   });

   it('mounts correctly in desktop mode', () => {
      mockMobile = false;
      const wrapper = mount(<MatchOverviewWidget events={[]} />);
      expect(wrapper.debug()).toMatchSnapshot();

   });

   it('mounts correctly in mobile mode', () => {
      mockMobile = true;

      const wrapper = mount(<MatchOverviewWidget events={[]} />);

      expect(wrapper.debug()).toMatchSnapshot();

      jest.runAllTimers();

      expect(wrapper.debug()).toMatchSnapshot();
   });

});
