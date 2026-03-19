import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject, signal } from '@angular/core';
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

  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);

  saving = signal(false);
  submitErr = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    status: ['pending' as 'pending' | 'completed', Validators.required]
  });

  get titleInvalid() {
    const c = this.form.get('title');
    return c?.invalid && c?.touched;
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.closed.emit();
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.submitErr.set(null);

    const { title, status } = this.form.value;

    this.tasksService.createTask(this.userId, {
      title: title!,
      status: status as 'pending' | 'completed'
    }).subscribe({
      next: (task: Task) => {
        this.saving.set(false);
        this.submitted.emit(task);
      },
      error: (err: Error) => {
        this.saving.set(false);
        this.submitErr.set(err.message);
      }
    });
  }
}
