export interface Headquarter {
  id: number;
  name: string;
  address: string;
}

export interface CalendarEvent {
  id: number;
  headquarterId: number;
  title: string;
  start: string;
  end: string;
  type: 'visit' | 'blocked';
  allDay: boolean;
  description?: string;
}

export interface CreateVisitDto {
  headquarterId: number;
  title: string;
  start: string;
  end: string;
  type: 'visit';
  allDay: false;
  description?: string;
}

export interface SubmitStatus {
  type: 'success' | 'error';
  message: string;
}
