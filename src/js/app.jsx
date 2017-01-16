import { coreLibrary, eventsModule, widgetModule } from 'kambi-widget-core-library';
import kambi from './Services/kambi';
import Widget from './Widget';

/**
 * Removes widget on fatal errors.
 * @param {Error} error Error instance
 */
const onFatal = function(error) {
   widgetModule.removeWidget();
   throw error;
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
      '/football/netherlands/eredivisie'
   ],
   combineFilters: false,
   customCssUrl: 'https://d1fqgomuxh4f5p.cloudfront.net/customcss/match-overview-widget/{customer}/style.css',
   customCssUrlFallback: 'https://d1fqgomuxh4f5p.cloudfront.net/customcss/match-overview-widget/kambi/style.css',
   pollingInterval: 31000,
   pollingCount: 4,
   eventsRefreshInterval: 120000
})
.then(() => {
   coreLibrary.setWidgetTrackingName(coreLibrary.args.widgetTrackingName);
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
})
.catch(onFatal);
