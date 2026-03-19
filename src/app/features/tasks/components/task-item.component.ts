import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Task } from '../../../shared/models';

@Component({
  selector: 'app-task-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss'
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Input() isNew = false;
}
