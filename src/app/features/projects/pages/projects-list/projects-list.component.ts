import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ProjectsService } from '../../../../core/services/projects.service';
import { CommentsService } from '../../../../core/services/comments.service';
import { Project } from '../../../../shared/models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading/loading-skeleton.component';
import { ErrorStateComponent } from '../../../../shared/components/error/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatsChartComponent } from '../../../../shared/components/stats-chart/stats-chart.component';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    LoadingSkeletonComponent, ErrorStateComponent, EmptyStateComponent,
    StatsChartComponent
  ],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss'
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  private readonly projectsService = inject(ProjectsService);
  private readonly commentsService = inject(CommentsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  allProjects = signal<Project[]>([]);
  filteredProjects = signal<Project[]>([]);
  commentCounts = signal<Record<number, number>>({});
  loading = signal(true);
  error = signal<string | null>(null);

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadProjects();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => this.filterProjects(term ?? ''));
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    combineLatest([
      this.projectsService.getProjects(),
      this.commentsService.getCommentCountByProject()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([projects, counts]) => {
        this.allProjects.set(projects);
        this.filteredProjects.set(projects);
        this.commentCounts.set(counts);
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

  filterProjects(term: string): void {
    const q = term.toLowerCase().trim();
    this.filteredProjects.set(
      !q
        ? this.allProjects()
        : this.allProjects().filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.company.name.toLowerCase().includes(q)
          )
    );
    this.cdr.markForCheck();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getCompletionPct(project: Project): number {
    if (!project.taskCount) return 0;
    return Math.round(((project.completedTaskCount ?? 0) / project.taskCount) * 100);
  }

  getCompletionClass(project: Project): string {
    const pct = this.getCompletionPct(project);
    if (pct < 40) return 'low';
    if (pct < 70) return 'mid';
    return 'high';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
