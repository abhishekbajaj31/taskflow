import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProjectsService } from './projects.service';
import { ApiService } from './api.service';
import { User, Todo } from '../../shared/models';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'test@test.com',
      address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' } },
      phone: '',
      website: '',
      company: { name: 'Acme', catchPhrase: '', bs: '' }
    }
  ];

  const mockTodos: Todo[] = [
    { id: 1, userId: 1, title: 'Task 1', completed: true },
    { id: 2, userId: 1, title: 'Task 2', completed: false },
    { id: 3, userId: 1, title: 'Task 3', completed: false }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', [
      'getUsers', 'getTodos', 'getTodosByUser'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProjectsService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(ProjectsService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjects()', () => {
    it('should combine users and todos into projects with task counts', (done) => {
      apiSpy.getUsers.and.returnValue(of(mockUsers));
      apiSpy.getTodos.and.returnValue(of(mockTodos));

      service.getProjects().subscribe(projects => {
        expect(projects.length).toBe(1);
        expect(projects[0].taskCount).toBe(3);
        expect(projects[0].completedTaskCount).toBe(1);
        expect(projects[0].pendingTaskCount).toBe(2);
        done();
      });
    });

    it('should propagate errors from getUsers()', (done) => {
      apiSpy.getUsers.and.returnValue(throwError(() => new Error('Network error')));
      apiSpy.getTodos.and.returnValue(of(mockTodos));

      service.getProjects().subscribe({
        error: err => {
          expect(err.message).toBe('Network error');
          done();
        }
      });
    });
  });

  describe('getProjectWithTasks()', () => {
    it('should return project and tasks for a given userId', (done) => {
      apiSpy.getUsers.and.returnValue(of(mockUsers));
      apiSpy.getTodosByUser.and.returnValue(of(mockTodos));

      service.getProjectWithTasks(1).subscribe(({ project, tasks }) => {
        expect(project.id).toBe(1);
        expect(tasks.length).toBe(3);
        expect(tasks[0].status).toBe('completed');
        expect(tasks[1].status).toBe('pending');
        done();
      });
    });

    it('should throw if user not found', (done) => {
      apiSpy.getUsers.and.returnValue(of(mockUsers));
      apiSpy.getTodosByUser.and.returnValue(of([]));

      service.getProjectWithTasks(999).subscribe({
        error: err => {
          expect(err.message).toBe('Project not found');
          done();
        }
      });
    });
  });
});
