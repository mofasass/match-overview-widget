import { eventsModule } from 'kambi-widget-core-library';

const handlers = {};

const unsubscribeFromEvents = function(eventIds) {
   eventIds.map((eventId) => {
      eventsModule.unsubscribe(`LIVE:EVENTDATA:${eventId}`, handlers[eventId].onData);
      eventsModule.unsubscribe(`LIVE:EVENTDATA:${eventId}:REMOVED`, handlers[eventId].onRemoved);
      delete handlers[eventId];
      console.debug('unsubscribed', eventId);
   });
};

const createEventDataHandler = function() {
   return (liveEventData) => {
      if (!liveEventData.open) {
         handlers[liveEventData.eventId].onRemoved(liveEventData.eventId);
      }
   }
};

const createEventRemovedHandler = function(activeEventIds, onDrained) {
   return (eventId) => {
      unsubscribeFromEvents([eventId]);

      const idx = activeEventIds.indexOf(eventId);

      if (idx == -1) {
         console.warn(`Event not found in active events set: ${eventId}`);
         return;
      }

      activeEventIds.splice(idx, 1);

      if (activeEventIds.length == 0) {
         onDrained();
      }
   };
};

const subscribeToEvents = function(eventIds, onData, onDrained) {
   const activeEventIds = eventIds.slice();

   eventIds.map((eventId) => {
      handlers[eventId] = {
         onData: createEventDataHandler.call(handlers[eventId]),
         onRemoved: createEventRemovedHandler(activeEventIds, onDrained)
      };

      eventsModule.subscribe(`LIVE:EVENTDATA:${eventId}`, handlers[eventId].onData);
      eventsModule.subscribe(`LIVE:EVENTDATA:${eventId}:REMOVED`, handlers[eventId].onRemoved);

      console.debug('subscribed', eventId);
   });
};

export default { subscribeToEvents, unsubscribeFromEvents };
