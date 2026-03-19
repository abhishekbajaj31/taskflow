import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Comment } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly api = inject(ApiService);

  // comments are keyed by postId — we use this to count activity per "project"
  // We map postId 1–10 → userId 1–10 to simulate per-project comment counts
  private allComments$ = this.api.getComments().pipe(shareReplay(1));

  getCommentCountByProject(): Observable<Record<number, number>> {
    return this.allComments$.pipe(
      map(comments => {
        const counts: Record<number, number> = {};
        comments.forEach(c => {
          // postId 1-10 maps directly to userId/projectId 1-10
          const projectId = c.postId <= 10 ? c.postId : (c.postId % 10) || 10;
          counts[projectId] = (counts[projectId] ?? 0) + 1;
        });
        return counts;
      })
    );
  }

  getCommentsByProject(projectId: number): Observable<Comment[]> {
    return this.allComments$.pipe(
      map(comments =>
        comments
          .filter(c => {
            const pid = c.postId <= 10 ? c.postId : (c.postId % 10) || 10;
            return pid === projectId;
          })
          .slice(0, 5) // show latest 5 comments per project
      )
    );
  }
}
