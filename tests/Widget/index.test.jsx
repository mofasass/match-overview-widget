import React, { Children } from 'react';
import ReactDOM from 'react-dom';
import Widget from '../../src/js/Widget';
import kambi from '../../src/js/Services/kambi'
import live from '../../src/js/Services/live'
import { widgetModule } from 'kambi-wc-widget-core-library';

jest.mock('../../src/js/Services/kambi', () => ({
   getEvents: jest.fn(() => Promise.resolve({events: [], filter: 'test/filter/1'}))
}));

jest.mock('../../src/js/Services/live', () => ({
   subscribeToEvents: jest.fn()
}));

jest.mock('react-dom', () => ({
   render: jest.fn()
}));

jest.mock('kambi-wc-widget-core-library', () => ({
   widgetModule: {
      setWidgetHeight: jest.fn()
   },
   translationModule: {
      getTranslation: jest.fn(key => `Translated ${key}`)
   }
}));

jest.useFakeTimers();

describe('Widget DOM rendering', () => {

   beforeEach(() => {
      kambi.getEvents = jest.fn(() => Promise.resolve({events: [], filter: 'test/filter/1'}));
      ReactDOM.render = jest.fn();
      console.warn = jest.fn();
      widgetModule.setWidgetHeight.mockClear();
      live.subscribeToEvents = jest.fn();
   });

   it('emits fatal error on empty response from kambi\'s getEvents', () => {
      kambi.getEvents = jest.fn(() => Promise.resolve({events: [], filter: 'test/filter/1'}));
      const mockOnFatal = jest.fn(error => expect(error).toMatchSnapshot());

      const widget = new Widget(
         ['test/filter/1'],
         {
            combineFilters: true,
            eventsRefreshInterval: 100,
            pollingCount: 100,
            onFatal: mockOnFatal
         }
      );

      return widget.init()
         .then(() => {
            expect(kambi.getEvents).toHaveBeenCalledTimes(1);
            expect(kambi.getEvents).toHaveBeenLastCalledWith(['test/filter/1'], true);
            expect(mockOnFatal).toHaveBeenCalledTimes(1);
         });
   });

   it('throws error on empty response from kambi\'s getEvents', () => {
      kambi.getEvents = jest.fn(() => Promise.resolve({events: [], filter: 'test/filter/1'}));

      const widget = new Widget(
         ['test/filter/1'],
         {
            combineFilters: true,
            eventsRefreshInterval: 100,
            pollingCount: 100
         }
      );

      return widget.init()
         .catch(error => {
            expect(widgetModule.setWidgetHeight).toHaveBeenCalledTimes(1);
            expect(widgetModule.setWidgetHeight).toHaveBeenLastCalledWith(150);
            expect(error).toMatchSnapshot();
         });
   });

   it('works correctly without live events', () => {
      kambi.getEvents = jest.fn(() => Promise.resolve({
         events: [{event: {}}],
         filter: 'test/filter/1'
      }));

      const widget = new Widget(
         ['test/filter/1'],
         {}
      );

      return widget.init()
         .then(() => expect(ReactDOM.render).toHaveBeenCalledTimes(1));
   });

   it('works correctly without live events and combined filters', () => {
      kambi.getEvents = jest.fn(() => Promise.resolve({
         events: [{event: {}}],
         filter: 'test/filter/1'
      }));

      const widget = new Widget(
         ['test/filter/1'],
         {combineFilters: true}
      );

      return widget.init()
         .then(() => expect(ReactDOM.render).toHaveBeenCalledTimes(1));
   });

   it('works correctly with live events', () => {
      kambi.getEvents = jest.fn(() => Promise.resolve({
         events: [{event: {id: 100, openForLiveBetting: true}}],
         filter: 'test/filter/1'
      }));

      live.subscribeToEvents = jest.fn((eventIds, onUpdate, onDrained) => {
         expect(eventIds).toMatchSnapshot();

         onUpdate({
            eventId: 100
         });
      });

      const widget = new Widget(
         ['test/filter/1'],
         {}
      );

      return widget.init()
         .then(() => {
            expect(live.subscribeToEvents).toHaveBeenCalledTimes(1);
         });
   });

   it('works correctly with exceeded live events count', () => {
      kambi.getEvents = jest.fn(() => Promise.resolve({
         events: [
            {event: {id: 100, openForLiveBetting: true}},
            {event: {id: 200, openForLiveBetting: true}}
         ],
         filter: 'test/filter/1'
      }));

      live.subscribeToEvents = jest.fn((eventIds, onUpdate, onDrained) =>
         expect(eventIds).toMatchSnapshot());

      const widget = new Widget(
         ['test/filter/1'],
         {pollingCount: 1}
      );

      return widget.init()
         .then(() => expect(live.subscribeToEvents).toHaveBeenCalledTimes(1));
   });

   it('works correctly with invalid live update', () => {
      kambi.getEvents = jest.fn(() => Promise.resolve({
         events: [{event: {id: 100, openForLiveBetting: true}}],
         filter: 'test/filter/1'
      }));

      live.subscribeToEvents = jest.fn((eventIds, onUpdate, onDrained) => {
         onUpdate({eventId: 666});
      });

      console.warn = jest.fn((msg) => expect(msg).toMatchSnapshot());

      const widget = new Widget(
         ['test/filter/1'],
         {}
      );

      return widget.init()
         .then(() => {
            expect(live.subscribeToEvents).toHaveBeenCalledTimes(1);
            expect(console.warn).toHaveBeenCalledTimes(1);
         });
   });

   it('picks correct tournament logo when there is no applied filter', () => {
      kambi.getEvents = jest.fn(() => Promise.resolve({
         events: [{event: {}}],
         filter: ''
      }));

      const widget = new Widget(
         ['test/filter/1'],
         {}
      );

      return widget.init()
         .then(() => expect(ReactDOM.render).toHaveBeenCalledTimes(1));
   });

});
