import React from 'react';
import ReactDOM from 'react-dom';
import { coreLibrary, widgetModule } from 'kambi-widget-core-library';
import store from './Store/store';
import live from './Store/live';
import MatchOverviewWidget from './Components/MatchOverviewWidget';

const liveEventIds = [];

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
   pollingInterval: 30000,
   pollingCount: 4
})
.then(() => {
   coreLibrary.setWidgetTrackingName(coreLibrary.args.widgetTrackingName);
   return store.getHighlightedFilters(coreLibrary.args.filter);
})
.then((filters) => {
   if (filters.length === 0) {
      console.warn('No matching filters in highlight');

      // @todo: exceptions are not for flow control
      throw new Error('No matching filters in highlight');
   }

   ReactDOM.render(
      <MatchOverviewWidget
         filters={filters}
         combineFilters={coreLibrary.args.combineFilters}
         pollingInterval={coreLibrary.args.pollingInterval}
         pollingLimit={coreLibrary.args.pollingCount}
      />,
      document.getElementById('root')
   );
})
.catch((error) => {
   widgetModule.removeWidget();
   throw error;
});
