import kambi from '../../src/js/Services/kambi';
import { coreLibrary, offeringModule, widgetModule } from 'kambi-wc-widget-core-library';


jest.mock('kambi-wc-widget-core-library', () => ({
   coreLibrary: {
      config: {
         routeRoot: ''
      }
   },
   offeringModule: {
      getHighlight: jest.fn(),
      getEventsByFilter: jest.fn()
   },
   widgetModule: {
      createFilterUrl: jest.fn()
   }
}));

const mockHighlightGroup = {pathTermId: 'test'};

const mockEvent = {
   event: {
      type: 'ET_MATCH'
   }
};

describe('Kambi service highlights', () => {

   beforeEach(() => {
      offeringModule.getHighlight = jest.fn();
   });

   it('returns highlighted filters correctly', () => {
      offeringModule.getHighlight = jest.fn(() => new Promise(resolve => resolve({
         groups: [mockHighlightGroup, Object.assign({}, mockHighlightGroup, {pathTermId: 'test2'})]
      })));

      expect(offeringModule.getHighlight).not.toHaveBeenCalled();

      return kambi.getHighlightedFilters(['test2'])
         .then((filters) => {
            expect(filters).toMatchSnapshot();
            expect(offeringModule.getHighlight).toHaveBeenCalledTimes(1);
         });
   });

   it('throws error on malformed highlights result', () => {
      offeringModule.getHighlight = jest.fn(() => new Promise(resolve => resolve({groups: false})));

      expect(offeringModule.getHighlight).not.toHaveBeenCalled();

      return kambi.getHighlightedFilters([])
         .catch(error => expect(error).toMatchSnapshot());
   });

});

describe('Kambi service combined events', () => {

   beforeEach(() => {
      widgetModule.createFilterUrl = jest.fn(() => '#filter/test/combined/filter');
      offeringModule.getEventsByFilter = jest.fn(() => new Promise(resolve => resolve({
         events: [
            mockEvent,
            Object.assign({}, mockEvent, {event: {type: 'ET_COMPETITION'}})
         ]
      })));
      coreLibrary.config.routeRoot = '';
   });

   it('returns events correctly', () => {
      const filters = ['test/filter/1', 'test/filter/2'];

      expect(widgetModule.createFilterUrl).not.toHaveBeenCalled();
      expect(offeringModule.getEventsByFilter).not.toHaveBeenCalled();

      return kambi.getEvents(filters)
         .then((events) => {
            expect(events).toMatchSnapshot();
            expect(widgetModule.createFilterUrl).toHaveBeenCalledTimes(1);
            expect(widgetModule.createFilterUrl).toHaveBeenLastCalledWith(filters);
            expect(offeringModule.getEventsByFilter).toHaveBeenCalledTimes(1);
            expect(offeringModule.getEventsByFilter).toHaveBeenLastCalledWith('test/combined/filter');
         });
   });

   it('returns football events on createFilterUrl malfunction', () => {
      const filters = ['test/filter/1', 'test/filter/2'];

      widgetModule.createFilterUrl = jest.fn(() => null);

      expect(widgetModule.createFilterUrl).not.toHaveBeenCalled();
      expect(offeringModule.getEventsByFilter).not.toHaveBeenCalled();

      return kambi.getEvents(filters)
         .then((events) => {
            expect(events).toMatchSnapshot();
            expect(widgetModule.createFilterUrl).toHaveBeenCalledTimes(1);
            expect(widgetModule.createFilterUrl).toHaveBeenLastCalledWith(filters);
            expect(offeringModule.getEventsByFilter).toHaveBeenCalledTimes(1);
            expect(offeringModule.getEventsByFilter).toHaveBeenLastCalledWith('football');
         });
   });

   it('returns empty events list on getEventsByFilter malfunction', () => {
      offeringModule.getEventsByFilter = jest.fn(() => new Promise(resolve => resolve({
         events: false
      })));

      return kambi.getEvents(['test/filter/1'])
         .then(events => expect(events).toMatchSnapshot());
   });

   it('uses correct filter when routeRoot is set', () => {
      coreLibrary.config.routeRoot = 'test/route/root';
      widgetModule.createFilterUrl = jest.fn(() => '#test/route/root/filter/test/combined/filter');

      return kambi.getEvents(['/test/filter/1'])
         .then((events) => {
            expect(events).toMatchSnapshot()
            expect(offeringModule.getEventsByFilter).toHaveBeenCalledTimes(1);
            expect(offeringModule.getEventsByFilter).toHaveBeenLastCalledWith('test/combined/filter');
         });
   });

});

describe('Kambi service progressive events', () => {

   beforeEach(() => {
      offeringModule.getEventsByFilter = jest.fn();
   });

   it('returns events correctly', () => {
      const filters = ['test/filter/1', 'test/filter/2'];

      offeringModule.getEventsByFilter.mockReturnValueOnce(new Promise(resolve => resolve({events: []})));
      offeringModule.getEventsByFilter.mockReturnValueOnce(new Promise(resolve => resolve({events: [
         mockEvent,
         Object.assign({}, mockEvent, {event: {type: 'ET_COMPETITION'}})
      ]})));

      expect(offeringModule.getEventsByFilter).not.toHaveBeenCalled();

      return kambi.getEvents(filters, false)
         .then((events) => {
            expect(events).toMatchSnapshot();
            expect(offeringModule.getEventsByFilter).toHaveBeenCalledTimes(2);
            expect(offeringModule.getEventsByFilter).toHaveBeenLastCalledWith('test/filter/2');
         });
   });

   it('behaves correctly when no events were found', () => {
      const filters = ['test/filter/1'];

      offeringModule.getEventsByFilter.mockReturnValueOnce(new Promise(resolve => resolve({events: []})));

      expect(offeringModule.getEventsByFilter).not.toHaveBeenCalled();

      return kambi.getEvents(filters, false)
         .then((events) => {
            throw new Error('Not supposed to reach here');
         })
         .catch((err) => {
            expect(err.message === 'No matches available in any of the supported filters');
         })
   });

});
