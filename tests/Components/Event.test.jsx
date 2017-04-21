/* eslint-env jest */
import React, { Children } from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';
import Event from '../../src/js/Components/Event';
import { widgetModule } from 'kambi-widget-core-library';

jest.mock('kambi-widget-core-library', () => ({
   widgetModule: {
      navigateToEvent: jest.fn(),
      navigateToLiveEvent: jest.fn()
   },
   translationModule: {
      getTranslation: jest.fn((key) => `Translated ${key}`)
   }
}));

let renderer;

const DAY = 24 * 60 * 60 * 1000;

const mockEvent = {
   id: 100,
   start: 10 * DAY,
   group: 'Test group',
   homeName: 'Sweden',
   homeFlag: {
      url: 'homeFlagUrl'
   },
   awayName: 'Poland',
   awayFlag: {
      url: 'awayFlagUrl'
   },
   openForLiveBetting: false
};

const mockLiveData = {
   score: {
      home: 1,
      away: 5
   }
};

const mockOutcomes = [
   {id: 200},
   {id: 300}
];

const originalDate = window.Date;

describe('Event DOM rendering', () => {

   beforeEach(() => {
      renderer = ReactTestUtils.createRenderer();

      window.Date = function(input = 10 * DAY) {

         this.date = new originalDate(input);

         this.getDate = () => this.date.getDate();
         this.getMonth = () => this.date.getMonth();
         this.getHours = () => this.date.getHours();
         this.getMinutes = () => this.date.getMinutes();
      };

      window.Date.now = () => {
         return 10 * DAY;
      };

   });

   afterEach(() => {
      window.Date = originalDate;
   });

   it('renders correctly with default props', () => {
      expect(renderer.render(
         <Event event={mockEvent} />
      )).toMatchSnapshot();
   });

   it('renders correctly with event starting today', () => {
      expect(renderer.render(
         <Event
            event={Object.assign(mockEvent, {start: 10 * DAY})}
         />
      )).toMatchSnapshot();
   });

   it('renders correctly with event starting tomorrow', () => {
      expect(renderer.render(
         <Event
            event={Object.assign(mockEvent, {start: 11 * DAY})}
         />
      )).toMatchSnapshot();
   });

   it('renders correctly with event starting later than tomorrow', () => {
      expect(renderer.render(
         <Event
            event={Object.assign(mockEvent, {start: 12 * DAY})}
         />
      )).toMatchSnapshot();
   });

   it('renders correctly with live data', () => {
      expect(renderer.render(
         <Event
            event={mockEvent}
            liveData={mockLiveData}
         />
      )).toMatchSnapshot();
   });

   it('renders correctly with outcomes', () => {
      expect(renderer.render(
         <Event
            event={mockEvent}
            outcomes={mockOutcomes}
         />
      )).toMatchSnapshot();
   });

});

describe('Event behaviour', () => {

   it('handles clicks correctly when not in live mode', () => {
      const wrapper = shallow(
         <Event event={mockEvent} />
      );

      expect(widgetModule.navigateToEvent).not.toHaveBeenCalled();

      wrapper.find('.header').simulate('click');

      expect(widgetModule.navigateToEvent).toHaveBeenCalledTimes(1);
      expect(widgetModule.navigateToEvent).toHaveBeenLastCalledWith(mockEvent.id);
   });

   it('handles clicks correctly when in live mode', () => {
      const wrapper = shallow(
         <Event event={Object.assign(mockEvent, {openForLiveBetting: true})} />
      );

      expect(widgetModule.navigateToLiveEvent).not.toHaveBeenCalled();

      wrapper.find('.header').simulate('click');

      expect(widgetModule.navigateToLiveEvent).toHaveBeenCalledTimes(1);
      expect(widgetModule.navigateToLiveEvent).toHaveBeenLastCalledWith(mockEvent.id);
   });

});
