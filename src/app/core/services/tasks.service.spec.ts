import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TasksService } from './tasks.service';
import { ApiService } from './api.service';

describe('TasksService', () => {
  let service: TasksService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['createTodo']);
    TestBed.configureTestingModule({
      providers: [TasksService, { provide: ApiService, useValue: apiSpy }]
    });
    service = TestBed.inject(TasksService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('createTask() should create a pending task and store locally', done => {
    apiSpy.createTodo.and.returnValue(of({ id: 201, userId: 1, title: 'My Task', completed: false }));

    service.createTask(1, { title: 'My Task', status: 'pending' }).subscribe(task => {
      expect(task.title).toBe('My Task');
      expect(task.status).toBe('pending');
      expect(service.getLocalTasks().length).toBe(1);
      done();
    });
  });

  it('createTask() should handle completed status', done => {
    apiSpy.createTodo.and.returnValue(of({ id: 201, userId: 1, title: 'Done Task', completed: true }));

    service.createTask(1, { title: 'Done Task', status: 'completed' }).subscribe(task => {
      expect(task.status).toBe('completed');
      done();
    });
  });

  it('createTask() should propagate errors', done => {
    apiSpy.createTodo.and.returnValue(throwError(() => new Error('Server error')));

    service.createTask(1, { title: 'Bad', status: 'pending' }).subscribe({
      error: err => { expect(err.message).toBe('Server error'); done(); }
    });
  });

  it('getLocalTasks() should accumulate multiple tasks', done => {
    apiSpy.createTodo.and.returnValue(of({ id: 201, userId: 1, title: 'Task', completed: false }));

    service.createTask(1, { title: 'Task 1', status: 'pending' }).subscribe(() => {
      service.createTask(1, { title: 'Task 2', status: 'pending' }).subscribe(() => {
        expect(service.getLocalTasks().length).toBe(2);
        done();
      });
    });
  });
});
