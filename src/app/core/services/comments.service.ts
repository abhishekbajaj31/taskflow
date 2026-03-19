import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Comment } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private api = inject(ApiService);
  private comments$ = this.api.getComments().pipe(shareReplay(1));

  // map postId to projectId (postId 1-10 = project 1-10, rest we wrap around)
  private getProjectId(postId: number): number {
    return postId <= 10 ? postId : (postId % 10) || 10;
  }

  getCountsByProject(): Observable<Record<number, number>> {
    return this.comments$.pipe(
      map(comments => {
        const counts: Record<number, number> = {};
        comments.forEach(c => {
          const pid = this.getProjectId(c.postId);
          counts[pid] = (counts[pid] || 0) + 1;
        });
        return counts;
      })
    );
  }

  getByProject(projectId: number): Observable<Comment[]> {
    return this.comments$.pipe(
      map(comments =>
        comments
          .filter(c => this.getProjectId(c.postId) === projectId)
          .slice(0, 5)
      )
    );
  }
}
