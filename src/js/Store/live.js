import { eventsModule } from 'kambi-widget-core-library';

const handlers = {};

const unsubscribeFromEvents = function(eventIds) {
   eventIds.map((eventId) => {
      eventsModule.unsubscribe(`LIVE:EVENT:${eventId}`, handlers[eventId].data);
      eventsModule.unsubscribe(`LIVE:EVENT:${eventId}:REMOVED`, handlers[eventId].removed);
      delete handlers[eventId];
      console.debug('unsubscribed', eventId);
   });
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
   eventIds.map((eventId) => {
      handlers[eventId] = {
         data: onData,
         removed: createEventRemovedHandler(eventIds.slice(), onDrained)
      };

      eventsModule.subscribe(`LIVE:EVENT:${eventId}`, handlers[eventId].data);
      eventsModule.subscribe(`LIVE:EVENT:${eventId}:REMOVED`, handlers[eventId].removed);

      console.debug('subscribed', eventId);
   });
};

export default { subscribeToEvents, unsubscribeFromEvents };
