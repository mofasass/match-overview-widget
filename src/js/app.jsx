import { coreLibrary, eventsModule, widgetModule } from 'kambi-widget-core-library';
import kambi from './Services/kambi';
import Widget from './Widget';

/**
 * Removes widget on fatal errors.
 * @param {Error} error Error instance
 */
const onFatal = function(error) {
   console.error(error);
   widgetModule.removeWidget();
};

coreLibrary.init({
   widgetTrackingName: 'gm-match-overview-widget',
   filter: [
      '/football/champions_league',
      '/football/england/premier_league',
      '/football/europa_league',
      '/football/france/ligue_1',
      '/football/germany/bundesliga',
      '/football/international_friendly_matches',
      '/football/italy/serie_a',
      '/football/norway/tippeligaen',
      '/football/spain/laliga',
      '/football/sweden/allsvenskan',
      '/football/world_cup_qualifying_-_asia',
      '/football/world_cup_qualifying_-_europe',
      '/football/world_cup_qualifying_-_north__central___caribbean',
      '/football/world_cup_qualifying_-_south_america',
      '/football/belgium/jupiler_pro_league',
      '/football/netherlands/eredivisie',
      '/football/england/fa_cup',
      '/football/iceland/league_cup',
      '/football/italy/serie_b',
      '/football/spain/copa_del_rey',
      '/football/italy/tim_cup',
      '/football/england/efl_cup'
   ],
   combineFilters: false,
   pollingInterval: 30000,
   pollingCount: 4,
   eventsRefreshInterval: 120000
})
.then(() => {
   coreLibrary.widgetTrackingName = coreLibrary.args.widgetTrackingName;
   eventsModule.liveEventPollingInterval = coreLibrary.args.pollingInterval;
   return kambi.getHighlightedFilters(coreLibrary.args.filter);
})
.then((filters) => {
   if (filters.length === 0) {
      onFatal(new Error('No matching filters in highlight'));
      return;
   }

   const widget = new Widget(
      filters,
      {
         combineFilters: coreLibrary.args.combineFilters,
         eventsRefreshInterval: coreLibrary.args.eventsRefreshInterval,
         pollingCount: coreLibrary.args.pollingCount,
         onFatal
      }
   );

   widget.init();
})
.catch(onFatal);
