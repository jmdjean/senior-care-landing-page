import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import {
  addDays,
  format,
  parseISO,
  getHours,
  isSameDay,
  isWeekend,
  startOfDay,
  isBefore,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ApiService } from './services/api.service';
import { Headquarter, CalendarEvent, SubmitStatus, CreateVisitDto } from './models/visit.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit {
  visitForm!: FormGroup;
  headquarters: Headquarter[] = [];
  availableDates: string[] = [];
  availableSlots: string[] = [];
  calendarEvents: CalendarEvent[] = [];

  isLoadingHeadquarters = true;
  loadingSlots = false;
  isSubmitting = false;
  submitStatus: SubmitStatus | null = null;

  private readonly WORKING_HOURS = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadHeadquarters();
    this.setupFormListeners();
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.loadScript('template/js/plugins.js');
      await this.loadScript('template/js/main.js');
    } catch (error) {
      console.error('Failed to load template scripts', error);
    }
  }

  private initForm(): void {
    this.visitForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/)]],
      headquarterId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      note: [''],
    });
  }

  private setupFormListeners(): void {
    this.visitForm.get('headquarterId')?.valueChanges.subscribe((headquarterId) => {
      if (headquarterId) {
        this.generateAvailableDates();
        this.visitForm.patchValue({ date: '', time: '' });
        this.availableSlots = [];
        this.loadCalendarEvents(+headquarterId);
      }
    });

    this.visitForm.get('date')?.valueChanges.subscribe((dateStr) => {
      if (dateStr && this.visitForm.get('headquarterId')?.value) {
        this.calculateAvailableSlots(dateStr);
        this.visitForm.patchValue({ time: '' });
      }
    });
  }

  private loadHeadquarters(): void {
    this.isLoadingHeadquarters = true;
    this.apiService
      .getHeadquarters()
      .pipe(finalize(() => (this.isLoadingHeadquarters = false)))
      .subscribe({
        next: (hqs) => {
          this.headquarters = hqs;
        },
        error: (err) => {
          console.error('Erro ao carregar sedes:', err);
          this.headquarters = [];
        },
      });
  }

  private loadCalendarEvents(headquarterId: number): void {
    this.apiService.getCalendarEvents(headquarterId).subscribe({
      next: (events) => {
        this.calendarEvents = events;
        const dateValue = this.visitForm.get('date')?.value;
        if (dateValue) {
          this.calculateAvailableSlots(dateValue);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar eventos:', err);
        this.calendarEvents = [];
      },
    });
  }

  private generateAvailableDates(): void {
    this.availableDates = [];
    const today = startOfDay(new Date());
    let currentDate = addDays(today, 1);
    let daysAdded = 0;

    while (daysAdded < 30) {
      if (!isWeekend(currentDate)) {
        this.availableDates.push(format(currentDate, 'yyyy-MM-dd'));
        daysAdded++;
      }
      currentDate = addDays(currentDate, 1);
    }
  }

  private calculateAvailableSlots(dateStr: string): void {
    this.loadingSlots = true;
    const selectedDate = parseISO(dateStr);
    const now = new Date();

    const eventsOnDate = this.calendarEvents.filter((event) => {
      const eventStart = parseISO(event.start);
      return isSameDay(eventStart, selectedDate);
    });

    const occupiedHours = new Set<number>();
    eventsOnDate.forEach((event) => {
      const startHour = getHours(parseISO(event.start));
      const endHour = getHours(parseISO(event.end));
      for (let hour = startHour; hour < endHour; hour++) {
        occupiedHours.add(hour);
      }
    });

    this.availableSlots = this.WORKING_HOURS.filter((slot) => {
      const hour = parseInt(slot.split(':')[0], 10);
      if (occupiedHours.has(hour)) {
        return false;
      }
      if (isSameDay(selectedDate, now)) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, 0, 0, 0);
        if (isBefore(slotTime, now)) {
          return false;
        }
      }
      return true;
    });

    this.loadingSlots = false;
  }

  formatDate(dateStr: string): string {
    const date = parseISO(dateStr);
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  }

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    if (value.length > 0) {
      if (value.length <= 2) {
        value = `(${value}`;
      } else if (value.length <= 7) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      }
    }

    this.visitForm.patchValue({ phone: value }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitStatus = null;

    const formValue = this.visitForm.value;
    const selectedDate = formValue.date;
    const selectedTime = formValue.time;
    const startHour = parseInt(selectedTime.split(':')[0], 10);

    const startDateTime = `${selectedDate}T${selectedTime}:00`;
    const endTime = `${String(startHour + 1).padStart(2, '0')}:00`;
    const endDateTime = `${selectedDate}T${endTime}:00`;

    const payload: CreateVisitDto = {
      headquarterId: +formValue.headquarterId,
      title: `Visita - ${formValue.name}`,
      start: startDateTime,
      end: endDateTime,
      type: 'visit',
      allDay: false,
      description: `Tel: ${formValue.phone}${formValue.note ? ` | Obs: ${formValue.note}` : ''}`,
    };

    this.apiService
      .createVisit(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.submitStatus = {
            type: 'success',
            message: 'Visita agendada com sucesso! Entraremos em contato em breve.',
          };
          this.visitForm.reset();
          this.availableDates = [];
          this.availableSlots = [];
          this.calendarEvents = [];
        },
        error: (err) => {
          console.error('Erro ao agendar visita:', err);
          this.submitStatus = {
            type: 'error',
            message: 'Erro ao agendar. Tente novamente ou entre em contato.',
          };
        },
      });
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src*="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.body.appendChild(script);
    });
  }
}
