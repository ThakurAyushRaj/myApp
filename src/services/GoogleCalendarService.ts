import axios from 'axios';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

export interface CreateEventParams {
  title: string;
  description?: string;
  date: string;          // 'YYYY-MM-DD'
  isAllDay: boolean;
  startTime?: Date;      // used when not all-day
  endTime?: Date;        // used when not all-day
}

class GoogleCalendarService {
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  async fetchUpcomingEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/calendars/primary/events`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        },
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw error;
    }
  }

  async createEvent(accessToken: string, params: CreateEventParams): Promise<GoogleCalendarEvent> {
    const { title, description, date, isAllDay, startTime, endTime } = params;

    let start: GoogleCalendarEvent['start'];
    let end: GoogleCalendarEvent['end'];

    if (isAllDay) {
      start = { date };
      end = { date };
    } else {
      // Combine the YYYY-MM-DD date with the time from the Date objects
      const [year, month, day] = date.split('-').map(Number);

      const startDate = new Date(
        year, month - 1, day,
        startTime!.getHours(), startTime!.getMinutes(), 0
      );
      const endDate = new Date(
        year, month - 1, day,
        endTime!.getHours(), endTime!.getMinutes(), 0
      );

      start = { dateTime: startDate.toISOString() };
      end = { dateTime: endDate.toISOString() };
    }

    const body = {
      summary: title,
      description: description || '',
      start,
      end,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/calendars/primary/events`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
