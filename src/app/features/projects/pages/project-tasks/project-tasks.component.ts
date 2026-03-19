import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, inject, signal, Input
} from '@angular/core';
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

type FilterStatus = 'all' | 'pending' | 'completed';

@Component({
  selector: 'app-project-tasks',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    LoadingSkeletonComponent, ErrorStateComponent, EmptyStateComponent,
    TaskFormModalComponent, TaskItemComponent
  ],
  templateUrl: './project-tasks.component.html',
  styleUrl: './project-tasks.component.scss'
})
export class ProjectTasksComponent implements OnInit, OnDestroy {
  @Input() id!: string;

  private readonly projectsService = inject(ProjectsService);
  private readonly tasksService = inject(TasksService);
  private readonly commentsService = inject(CommentsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  // expose Math for template
  readonly Math = Math;

  project = signal<Project | null>(null);
  allTasks = signal<Task[]>([]);
  filteredTasks = signal<Task[]>([]);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  modalOpen = signal(false);
  activeFilter = signal<FilterStatus>('all');

  // Stats
  completedCount = signal(0);
  pendingCount = signal(0);
  completionPct = signal(0);

  // Pagination
  readonly pageSize = 10;
  currentPage = signal(1);
  pagedTasks = signal<Task[]>([]);
  totalPages = signal(0);

  searchControl = new FormControl('');

  filters: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' }
  ];

  ngOnInit(): void {
    this.loadData();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.applyFilters();
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    combineLatest([
      this.projectsService.getProjectWithTasks(+this.id),
      this.commentsService.getCommentsByProject(+this.id)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([{ project, tasks }, comments]) => {
        this.project.set(project);
        const localTasks = this.tasksService.getLocalTasks()
          .filter(t => t.userId === +this.id);
        this.allTasks.set([...localTasks, ...tasks]);
        this.comments.set(comments);
        this.updateStats();
        this.applyFilters();
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

  private updateStats(): void {
    const tasks = this.allTasks();
    const done = tasks.filter(t => t.completed).length;
    this.completedCount.set(done);
    this.pendingCount.set(tasks.length - done);
    this.completionPct.set(
      tasks.length ? Math.round((done / tasks.length) * 100) : 0
    );
  }

  applyFilters(): void {
    const filter = this.activeFilter();
    const term = (this.searchControl.value ?? '').toLowerCase().trim();
    let tasks = this.allTasks();

    if (filter === 'completed') tasks = tasks.filter(t => t.completed);
    else if (filter === 'pending') tasks = tasks.filter(t => !t.completed);
    if (term) tasks = tasks.filter(t => t.title.toLowerCase().includes(term));

    this.filteredTasks.set(tasks);
    this.updatePagination(tasks);
    this.cdr.markForCheck();
  }

  private updatePagination(tasks: Task[]): void {
    const total = Math.ceil(tasks.length / this.pageSize);
    this.totalPages.set(total);
    // clamp current page
    if (this.currentPage() > total) this.currentPage.set(Math.max(1, total));
    this.updatePagedTasks(tasks);
  }

  private updatePagedTasks(tasks: Task[]): void {
    const start = (this.currentPage() - 1) * this.pageSize;
    this.pagedTasks.set(tasks.slice(start, start + this.pageSize));
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.updatePagedTasks(this.filteredTasks());
    this.cdr.markForCheck();
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  setFilter(f: FilterStatus): void {
    this.activeFilter.set(f);
    this.currentPage.set(1);
    this.applyFilters();
  }

  openModal(): void { this.modalOpen.set(true); }
  closeModal(): void { this.modalOpen.set(false); }

  handleTaskCreated(task: Task): void {
    this.allTasks.update(tasks => [task, ...tasks]);
    this.updateStats();
    this.currentPage.set(1);
    this.applyFilters();
    this.closeModal();
    this.cdr.markForCheck();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
