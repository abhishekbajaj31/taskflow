import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { ProjectsService } from '../../../../core/services/projects.service';
import { TasksService } from '../../../../core/services/tasks.service';
import { CommentsService } from '../../../../core/services/comments.service';
import { Project, Task, Comment } from '../../../../shared/models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading/loading-skeleton.component';
import { ErrorStateComponent } from '../../../../shared/components/error/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TaskFormModalComponent } from '../../../../shared/components/task-form-modal/task-form-modal.component';
import { TaskItemComponent } from '../../../tasks/components/task-item.component';

type Filter = 'all' | 'pending' | 'completed';

@Component({
  selector: 'app-project-tasks',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSkeletonComponent, ErrorStateComponent, EmptyStateComponent, TaskFormModalComponent, TaskItemComponent],
  templateUrl: './project-tasks.component.html',
  styleUrl: './project-tasks.component.scss'
})
export class ProjectTasksComponent implements OnInit, OnDestroy {
  @Input() id!: string;

  private projectsService = inject(ProjectsService);
  private tasksService = inject(TasksService);
  private commentsService = inject(CommentsService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  readonly Math = Math;
  readonly PAGE_SIZE = 10;

  project = signal<Project | null>(null);
  allTasks = signal<Task[]>([]);
  filtered = signal<Task[]>([]);
  paged = signal<Task[]>([]);
  comments = signal<Comment[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);
  showModal = signal(false);
  activeFilter = signal<Filter>('all');
  currentPage = signal(1);
  totalPages = signal(0);

  // stats
  doneCount = signal(0);
  pendingCount = signal(0);
  pct = signal(0);

  search = new FormControl('');

  filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' }
  ];

  ngOnInit() {
    this.loadData();

    this.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.applyFilter();
    });
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    combineLatest([
      this.projectsService.getProjectWithTasks(+this.id),
      this.commentsService.getByProject(+this.id)
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([{ project, tasks }, comments]) => {
        this.project.set(project);
        // prepend any tasks created this session
        const local = this.tasksService.getLocalTasks().filter(t => t.userId === +this.id);
        this.allTasks.set([...local, ...tasks]);
        this.comments.set(comments);
        this.calcStats();
        this.applyFilter();
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private calcStats() {
    const tasks = this.allTasks();
    const done = tasks.filter(t => t.completed).length;
    this.doneCount.set(done);
    this.pendingCount.set(tasks.length - done);
    this.pct.set(tasks.length ? Math.round((done / tasks.length) * 100) : 0);
  }

  applyFilter() {
    const f = this.activeFilter();
    const q = (this.search.value ?? '').toLowerCase().trim();
    let result = this.allTasks();

    if (f === 'completed') result = result.filter(t => t.completed);
    if (f === 'pending') result = result.filter(t => !t.completed);
    if (q) result = result.filter(t => t.title.toLowerCase().includes(q));

    this.filtered.set(result);
    this.totalPages.set(Math.ceil(result.length / this.PAGE_SIZE));
    this.setPage(this.currentPage());
    this.cdr.markForCheck();
  }

  setFilter(f: Filter) {
    this.activeFilter.set(f);
    this.currentPage.set(1);
    this.applyFilter();
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.setPage(page);
    this.cdr.markForCheck();
  }

  private setPage(page: number) {
    const start = (page - 1) * this.PAGE_SIZE;
    this.paged.set(this.filtered().slice(start, start + this.PAGE_SIZE));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  onTaskCreated(task: Task) {
    this.allTasks.update(tasks => [task, ...tasks]);
    this.calcStats();
    this.currentPage.set(1);
    this.applyFilter();
    this.showModal.set(false);
    this.cdr.markForCheck();
  }

  getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
