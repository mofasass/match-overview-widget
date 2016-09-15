# match-overview-widget

![](https://github.com/kambi-sportsbook-widgets/match-overview-widget/blob/master/screenshot.png?raw=true)

A widget showing the match schedule of upcoming matches in a scrollable list. The matches shown are based in the highlights (the popular list in the sportsbook). The matches are ordered by their start date.

The matches shown are from the events that are related to the links in the highlight list AND are also inside the provided `filter` argument.

If the `combine` argument is `false` only the matches from the first matched highlight will be shown, if it is `true` then the widget will show the matches from all the matched highlights.

In desktop mode the widget has clickable arrows to scroll the widget, In mobile mode the widget instead scrolls normally (by "tap-draging"). In mobile mode the widget has a smaller main logo which will be shown briefly before automatically scrolling it out of sight.

## Configuration

Arguments and default values:
```json
"args": {
    "filter": [
        "/football/champions_league",
        "/football/england/premier_league",
        "/football/europa_league",
        "/football/france/ligue_1",
        "/football/germany/bundesliga",
        "/football/international_friendly_matches",
        "/football/italy/serie_a",
        "/football/norway/tippeligaen",
        "/football/spain/laliga",
        "/football/sweden/allsvenskan",
        "/football/world_cup_qualifying_-_asia",
        "/football/world_cup_qualifying_-_europe",
        "/football/world_cup_qualifying_-_north__central___caribbean",
        "/football/world_cup_qualifying_-_south_america",
        "/football/belgium/jupiler_pro_league",
        "/football/netherlands/eredivisie"
    ],
    "combineFilters": false,
    "customCssUrl": "https://d1fqgomuxh4f5p.cloudfront.net/customcss/match-overview-widget/{customer}/style.css",
    "customCssUrlFallback": "https://d1fqgomuxh4f5p.cloudfront.net/customcss/match-overview-widget/kambi/style.css",
    "pollingInterval": 30000,
    "pollingCount": 4,
    "widgetTrackingName": "gm-match-overview-widget",
}
```

1.  `filter` - Array<string> - list of filters to match agains the highlights. Only matches from these filters will show up in the widget. In order to show the proper logo the logo images must be referenced in the CSS file pointed by `customCssUrl`.
2. `combineFilters` - boolean - if true will use all the filters that are also with the highlights mixing different tournaments together
3. `customCssUrl` - string - path to load operator-specific CSS from. The default value customizes the logo shown as well the background color.
4. `customCssUrlFallback` - string - path to load CSS from in case customCssUrl does not exist
5. `pollingInterval` - number - interval in milliseconds to get new live data from live matches
6. `pollingCount` - number - maximum number of matches to poll for live data at the same time
7. `widgetTrackingName` - string - tracking name for analytics purposes

### Build Instructions

Please refer to the [core-library](https://github.com/kambi-sportsbook-widgets/widget-core-library)
