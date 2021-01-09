const { google } = require('googleapis')
const moment = require('moment-timezone')
const SCOPES = [ 'https://www.googleapis.com/auth/calendar.readonly' ]
const RESERVED_PROPS = ['calendarId', 'singleEvents', 'pageToken']
const ora = require('ora');


class GoogleCalendar {
  static defaultOptions() {
    return {
      calendarId: undefined,
      apiKey: undefined,
      includeRaw: false,
      typeName: 'GoogleCalendar',
      includeRecurringEvents: false,
      apiParams: {}
    }
  }

  constructor(api, options) {

    if (!options.apiKey) throw 'Please specify an API Key'
    if (!options.calendarId) throw 'Please specify a calendar id'

    this.api = api
    this.options = options
    this.googleApi = this.initializeApi()

    this.calendarInfo = null

    api.loadSource(async (actions) => {

      const spinner = ora(`Fetching events.`).start();
      const items = await this.getCalendarData(this.getOptions())
      spinner.stopAndPersist({
        symbol: '✔',
        text: `Fetched ${items.length} events.`,
      });

      let eventCollection = actions.addCollection(this.options.typeName)

      items.forEach(event => {

        let startDate = {
          date: (event.start.date) ? moment(event.start.date).tz(this.calendarInfo.timeZone, true).format() : moment(event.start.dateTime).format(),
          timeZone: this.calendarInfo.timeZone
        }

        let endDate = {
          date: (event.end.date) ? moment(event.end.date).tz(this.calendarInfo.timeZone, true).format() : moment(event.end.dateTime).format(),
          timeZone: this.calendarInfo.timeZone
        }

        startDate = {
          ...startDate,
          timestamp: moment(startDate.date).unix()
        }

        endDate = {
          ...endDate,
          timestamp: moment(endDate.date).unix()
        }

        let item = {
          id: event.id,
          summary: event.summary || 'Event without summary',
          description: event.description || '',
          created: event.created,
          updated: event.updated,
          allDay: (event.start.date) ? true : false,
          start: startDate,
          end: endDate,
          location: event.location || ''
        }

        if( this.options.includeRaw ) {
          item = {
            ...item,
            _raw: event
          }
        }
          
        eventCollection.addNode(item)
      })
    })
  }

  initializeApi() {
    return google.calendar({
      version: 'v3',
      auth: this.options.apiKey
    });
  }

  getOptions() {
    let config = {
      calendarId: this.options.calendarId,
      singleEvents: this.options.includeRecurringEvents
    }

    let userConfig = this.options.apiParams

    RESERVED_PROPS.forEach(k => {delete userConfig[k]})

    return Object.assign( config, userConfig )
  }

  // based on 
  // https://github.com/googleapis/google-api-nodejs-client/issues/1786#issuecomment-520558979
  getCalendarData(config, allEvents = [], pageToken) {
    return new Promise((resolve, reject) => {
      this.googleApi.events.list({
        pageToken: pageToken,
        ...config
      }, (err, res) => {
        if (err) {
          console.log(err);
          return;
        }
        
        allEvents = allEvents.concat(res.data.items)
        this.calendarInfo = res.data
        delete this.calendarInfo.items

        if (res.data.nextPageToken) {
          this.getCalendarData(config, allEvents, res.data.nextPageToken).then((resAllEvents) => {
            resolve(resAllEvents);
          });
        } else {
          resolve(allEvents);
        }
      });
    });
  }
}

module.exports = GoogleCalendar
