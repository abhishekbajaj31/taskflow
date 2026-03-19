import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal } from '@angular/core';
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
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSkeletonComponent, ErrorStateComponent, EmptyStateComponent, StatsChartComponent],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss'
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  private projectsService = inject(ProjectsService);
  private commentsService = inject(CommentsService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  projects = signal<Project[]>([]);
  filtered = signal<Project[]>([]);
  commentCounts = signal<Record<number, number>>({});
  loading = signal(true);
  error = signal<string | null>(null);

  search = new FormControl('');

  ngOnInit() {
    this.load();

    this.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => this.filter(term ?? ''));
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    combineLatest([
      this.projectsService.getProjects(),
      this.commentsService.getCountsByProject()
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([projects, counts]) => {
        this.projects.set(projects);
        this.filtered.set(projects);
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

  filter(term: string) {
    const q = term.toLowerCase().trim();
    if (!q) {
      this.filtered.set(this.projects());
    } else {
      this.filtered.set(
        this.projects().filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.company.name.toLowerCase().includes(q)
        )
      );
    }
    this.cdr.markForCheck();
  }

  clearSearch() {
    this.search.setValue('');
  }

  getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getPct(p: Project) {
    if (!p.taskCount) return 0;
    return Math.round(((p.completedTaskCount ?? 0) / p.taskCount) * 100);
  }

  getBadgeClass(p: Project) {
    const pct = this.getPct(p);
    if (pct < 40) return 'low';
    if (pct < 70) return 'mid';
    return 'high';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
