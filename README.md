<div align="center">

<a href="https://www.jammeryhq.com" title="JammeryHQ" target="_blank">

  <img src="https://jammeryhq.com/jammeryhq.png" width="128" />
  
</a>

<p>
Fast-track your JAMstack development & learning
</p>
</div>

<hr />

# About this source plugin

Simple gridsome source plugin to fetch google calendar data

# Installation

Until we have published the package to npm, please add this line in the `dependencies`.

```js
"@jammeryhq/gridsome-source-google-calendar" : "github:jammeryhq/gridsome-source-google-calendar"
```

# Usage

```js
//gridsome.config.js

module.exports = {
  siteName: 'Gridsome',
  plugins: [
    {
      use: '@jammeryhq/gridsome-source-google-calendar',
      options: {
        calendarId: '...',
        apiKey: '...',
        typeName: 'RacingCalendar'
      },
    },
  ]
}
```

# How to get an API Key?

This plugin requires an API Key to fetch the data from the defined google calendar.

Check out the following link to learn how to generate an API Key:

https://cloud.google.com/docs/authentication/api-keys?visit_id=637443214535090662-2046580178&rd=1#creating_an_api_key

# How to get the Calender ID?

1. Open the Google Calender: https://calendar.google.com/calendar/u/0/r?tab=rc
2. Open the Settings for the calender which should be used as source
3. Move to section "Integrate calendar"
4. Copy the value which is shown at "Calendar-ID"

# Configuration

| Property   | Type    | Required | Default                          |
| ---------- | ------- | -------- | -------------------------------- |
| typeName   | String  | Yes      | `GoogleCalendar`                 |
| calendarId | String  | Yes      | `XXX@@group.calendar.google.com` |
| apiKey     | String  | Yes      | `AIzaSXXXXX3TC5ewuBYXXX0wEsH`    |
| includeRaw | Boolean | No       | `false`                          |

> `includeRaw` adds a new field `_raw` with the complete API Response

# Example

## GraphQL Query

```
{
  allGoogleCalendar {
    edges {
      node {
        id
        summary
        description
        created
        updated
        allDay
        start {
          date
          timestamp
          timeZone
        }
        end {
          date
          timestamp
          timeZone
        }
      }
    }
  }
}
```

## Result
```
{
  "data": {
    "allGoogleCalendar": {
      "edges": [
        {
          "node": {
            "id": "0upkuq917mla1iigkgkk59ao7b",
            "summary": "test event with date/time",
            "description": "",
            "created": "2020-12-23T10:40:35.000Z",
            "updated": "2020-12-23T10:40:35.108Z",
            "allDay": false,
            "start": {
              "date": "2021-07-15T12:00:00+02:00",
              "timestamp": 1626343200,
              "timeZone": "Europe/Berlin"
            },
            "end": {
              "date": "2021-07-15T13:00:00+02:00",
              "timestamp": 1626346800,
              "timeZone": "Europe/Berlin"
            }
          }
        },
        // ... more nodes
      ]
    }
  }
}
```

# Credits

This package is inspired by the following gatsby source plugin: https://github.com/msigwart/gatsby-source-google-calendar