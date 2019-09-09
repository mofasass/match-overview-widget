/* eslint-env jest */
import React from 'react';
import ReactShallowRenderer from 'react-test-renderer/shallow';
import { shallow } from 'enzyme';
import Event from '../../src/js/Components/Event';
import { widgetModule } from 'kambi-wc-widget-core-library';

jest.mock('kambi-wc-widget-core-library', () => ({
   widgetModule: {
      navigateToEvent: jest.fn(),
      navigateToLiveEvent: jest.fn()
   },
   translationModule: {
      getTranslation: jest.fn((key) => `Translated ${key}`)
   }
}));

let renderer;

const BEGIN_TIME = new Date('2017-01-09 09:00:00').getTime();
const BEGIN_TIME_2 = new Date('2017-01-10 09:00:00').getTime();
const BEGIN_TIME_3 = new Date('2017-01-11 09:00:00').getTime();

const mockEvent = {
   id: 100,
   start: BEGIN_TIME,
   group: 'Test group',
   homeName: 'Sweden',
   homeFlag: {
      url: 'homeFlagUrl'
   },
   awayName: 'Poland',
   awayFlag: {
      url: 'awayFlagUrl'
   },
   openForLiveBetting: false,
   toJSON: function() {
      return {id: 100};
   }
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
      renderer = new ReactShallowRenderer();

      window.Date = function(input = BEGIN_TIME) {

         this.date = new originalDate(input);

         this.getDate = () => this.date.getDate();
         this.getMonth = () => this.date.getMonth();
         this.getHours = () => this.date.getHours();
         this.getMinutes = () => this.date.getMinutes();
      };

      window.Date.now = () => {
         return BEGIN_TIME;
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
            event={Object.assign(mockEvent, {start: BEGIN_TIME})}
         />
      )).toMatchSnapshot();
   });

   it('renders correctly with event starting tomorrow', () => {
      expect(renderer.render(
         <Event
            event={Object.assign(mockEvent, {start: BEGIN_TIME_2})}
         />
      )).toMatchSnapshot();
   });

   it('renders correctly with event starting later than tomorrow', () => {
      expect(renderer.render(
         <Event
            event={Object.assign(mockEvent, {start: BEGIN_TIME_3})}
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

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
   });

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
