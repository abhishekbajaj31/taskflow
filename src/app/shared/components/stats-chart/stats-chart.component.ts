import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../models';

@Component({
  selector: 'app-stats-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './stats-chart.component.html',
  styleUrl: './stats-chart.component.scss'
})
export class StatsChartComponent {
  @Input({ required: true }) projects: Project[] = [];

  readonly chartHeight = 120;
  readonly barWidth = 24;
  readonly gap = 12;

  get chartData() {
    // Only show first 10 projects to keep chart readable
    return this.projects.slice(0, 10).map(p => ({
      name: p.name.split(' ')[0],
      total: p.taskCount ?? 0,
      done: p.completedTaskCount ?? 0,
      pending: p.pendingTaskCount ?? 0
    }));
  }

  get maxValue(): number {
    return Math.max(...this.chartData.map(d => d.total), 1);
  }

  get svgWidth(): number {
    return this.chartData.length * (this.barWidth + this.gap) + this.gap;
  }

  getBarHeight(value: number): number {
    return Math.round((value / this.maxValue) * this.chartHeight);
  }

  getBarX(index: number): number {
    return index * (this.barWidth + this.gap) + this.gap;
  }

  getBarY(value: number): number {
    return this.chartHeight - this.getBarHeight(value) + 20;
  }
}
