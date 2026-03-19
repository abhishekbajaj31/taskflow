import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TasksService } from './tasks.service';
import { ApiService } from './api.service';

describe('TasksService', () => {
  let service: TasksService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['createTodo']);

    TestBed.configureTestingModule({
      providers: [
        TasksService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(TasksService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createTask()', () => {
    it('should create a pending task and store it locally', (done) => {
      apiSpy.createTodo.and.returnValue(of({ id: 201, userId: 1, title: 'My Task', completed: false }));

      service.createTask(1, { title: 'My Task', status: 'pending' }).subscribe(task => {
        expect(task.title).toBe('My Task');
        expect(task.status).toBe('pending');
        expect(task.completed).toBeFalse();

        // Should be in local store
        const localTasks = service.getLocalTasks();
        expect(localTasks.length).toBe(1);
        done();
      });
    });

    it('should create a completed task', (done) => {
      apiSpy.createTodo.and.returnValue(of({ id: 201, userId: 1, title: 'Done Task', completed: true }));

      service.createTask(1, { title: 'Done Task', status: 'completed' }).subscribe(task => {
        expect(task.status).toBe('completed');
        done();
      });
    });

    it('should propagate API errors', (done) => {
      apiSpy.createTodo.and.returnValue(throwError(() => new Error('Server error')));

      service.createTask(1, { title: 'Bad Task', status: 'pending' }).subscribe({
        error: err => {
          expect(err.message).toBe('Server error');
          done();
        }
      });
    });
  });

  describe('clearLocalTasks()', () => {
    it('should clear all local tasks', (done) => {
      apiSpy.createTodo.and.returnValue(of({ id: 201, userId: 1, title: 'Task', completed: false }));

      service.createTask(1, { title: 'Task', status: 'pending' }).subscribe(() => {
        expect(service.getLocalTasks().length).toBe(1);
        service.clearLocalTasks();
        expect(service.getLocalTasks().length).toBe(0);
        done();
      });
    });
  });
});
