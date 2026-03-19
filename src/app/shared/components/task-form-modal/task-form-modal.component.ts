import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TasksService } from '../../../core/services/tasks.service';
import { Task } from '../../models/index';

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './task-form-modal.component.html',
  styleUrl: './task-form-modal.component.scss'
})
export class TaskFormModalComponent {
  @Input() projectName = '';
  @Input() userId = 0;
  @Output() submitted = new EventEmitter<Task>();
  @Output() closed = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);

  submitting = signal(false);
  submitError = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(200)
    ]],
    status: ['pending' as 'pending' | 'completed', Validators.required]
  });

  get titleInvalid(): boolean {
    const ctrl = this.form.get('title');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.closed.emit();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const { title, status } = this.form.value;

    this.tasksService.createTask(this.userId, {
      title: title!,
      status: status as 'pending' | 'completed'
    }).subscribe({
      next: (task: Task) => {
        this.submitting.set(false);
        this.submitted.emit(task);
      },
      error: (err: Error) => {
        this.submitting.set(false);
        this.submitError.set(err.message ?? 'Failed to create task.');
      }
    });
  }
}
