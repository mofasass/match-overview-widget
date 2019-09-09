import live from '../../src/js/Services/live';
import { eventsModule } from 'kambi-wc-widget-core-library';


jest.mock('kambi-wc-widget-core-library', () => ({
   eventsModule: {
      subscribe: jest.fn(),
      unsubscribe: jest.fn()
   }
}));

const mockOnDrained = jest.fn();
const mockOnUpdate = jest.fn();
console.warn = jest.fn();

describe('Kambi service highlights', () => {

   beforeEach(() => {
      eventsModule.subscribe = jest.fn();
      eventsModule.unsubscribe = jest.fn();
      mockOnDrained.mockClear();
      mockOnUpdate.mockClear();
      console.warn.mockClear();
   });

   it('subscribes to live updates correctly', () => {
      const mockLiveEventData = {
         open: true,
         eventId: 1
      };

      eventsModule.subscribe = jest.fn((event, handler) => {
         switch (event) {
            case 'LIVE:EVENTDATA:1':
               handler(mockLiveEventData);
               return;

            case 'LIVE:EVENTDATA:1:REMOVED':
               return;

            default:
               throw new Error('Invalid event');
         }
      });

      live.subscribeToEvents([1], mockOnUpdate, mockOnDrained);

      expect(mockOnUpdate).toHaveBeenCalledTimes(1);
      expect(mockOnUpdate).toHaveBeenLastCalledWith(mockLiveEventData);

      expect(eventsModule.subscribe).toHaveBeenCalledTimes(2);
   });

   it('unsubscribes from live updates correctly', () => {
      live.subscribeToEvents([1, 2], mockOnUpdate, mockOnDrained);
      expect(eventsModule.subscribe).toHaveBeenCalledTimes(4);
      live.unsubscribeFromEvents([1, 2]);
      expect(eventsModule.unsubscribe).toHaveBeenCalledTimes(4);
   });

   it('unsubscribes from live updates when they finish', () => {
      eventsModule.subscribe = jest.fn((event, handler) => {
         switch (event) {
            case 'LIVE:EVENTDATA:1':
               return;

            case 'LIVE:EVENTDATA:1:REMOVED':
               handler(1);
               return;

            default:
               throw new Error('Invalid event');
         }
      });

      live.subscribeToEvents([1], mockOnUpdate, mockOnDrained);

      expect(eventsModule.subscribe).toHaveBeenCalledTimes(2);
      expect(mockOnDrained).toHaveBeenCalledTimes(1);
   });

   it('behaves correctly when receives notification on unregistered event removal', () => {
      eventsModule.subscribe = jest.fn((event, handler) => {
         switch (event) {
            case 'LIVE:EVENTDATA:1':
               return;

            case 'LIVE:EVENTDATA:1:REMOVED':
               handler(100);
               return;

            default:
               throw new Error('Invalid event');
         }
      });

      console.warn = jest.fn(msg => expect(msg).toMatchSnapshot());

      live.subscribeToEvents([1], mockOnUpdate, mockOnDrained);
   });

   it('doesn\'t call onDrained when there are still active live events', () => {
      eventsModule.subscribe = jest.fn((event, handler) => {
         switch (event) {
            case 'LIVE:EVENTDATA:1':
               return;

            case 'LIVE:EVENTDATA:1:REMOVED':
               handler(1);
               return;

            case 'LIVE:EVENTDATA:2':
               return;

            case 'LIVE:EVENTDATA:2:REMOVED':
               return;

            default:
               throw new Error('Invalid event');
         }
      });

      live.subscribeToEvents([1, 2], mockOnUpdate, mockOnDrained);
      expect(mockOnDrained).not.toHaveBeenCalled();
   });

   it('unsubscribes from live event when event is not open', () => {
      const mockLiveEventData = {
         open: false,
         eventId: 1
      };

      let mockHandler;

      eventsModule.subscribe = jest.fn((event, handler) => {
         switch (event) {
            case 'LIVE:EVENTDATA:1':
               mockHandler = handler;
               return;

            case 'LIVE:EVENTDATA:1:REMOVED':
               if (mockHandler) {
                  mockHandler(mockLiveEventData);
               }
               return;

            default:
               throw new Error('Invalid event');
         }
      });

      live.subscribeToEvents([1], mockOnUpdate, mockOnDrained);

      expect(mockOnUpdate).toHaveBeenCalledTimes(1);
      expect(mockOnUpdate).toHaveBeenLastCalledWith(mockLiveEventData);

      expect(eventsModule.subscribe).toHaveBeenCalledTimes(2);
      expect(eventsModule.unsubscribe).toHaveBeenCalledTimes(2);
   });

});
