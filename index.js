const { google } = require('googleapis')
const moment = require('moment-timezone')
const SCOPES = [ 'https://www.googleapis.com/auth/calendar.readonly' ]

class GoogleCalendar {
  static defaultOptions() {
    return {
      calendarId: undefined,
      apiKey: undefined,
      includeRaw: false,
      typeName: 'GoogleCalendar',
      includeRecurringEvents: false
    }
  }

  constructor(api, options) {

    if (!options.apiKey) throw 'Please specify an API Key'
    if (!options.calendarId) throw 'Please specify a calendar id'

    this.api = api
    this.options = options
    this.googleApi = this.initializeApi()

    api.loadSource(async (actions) => {

      const data = await this.getCalendarData()

      let eventCollection = actions.addCollection(this.options.typeName)

      data.items.forEach(event => {

        let startDate = {
          date: (event.start.date) ? moment(event.start.date).tz(data.timeZone, true).format() : moment(event.start.dateTime).format(),
          timeZone: data.timeZone
        }

        let endDate = {
          date: (event.end.date) ? moment(event.end.date).tz(data.timeZone, true).format() : moment(event.end.dateTime).format(),
          timeZone: data.timeZone
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

  async getCalendarData() {
    let data = []
    await this.googleApi.events.list(
      { calendarId: this.options.calendarId, singleEvents: this.options.includeRecurringEvents })
      .then(res => {
        data = res.data
      }).catch(err => {
        console.log(err)
      })
    return data
  }
}

module.exports = GoogleCalendar
