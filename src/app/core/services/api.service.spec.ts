import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { User, Todo } from '../../shared/models';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      address: { street: 'Kulas Light', suite: 'Apt. 556', city: 'Gwenborough', zipcode: '92998-3874', geo: { lat: '-37.3159', lng: '81.1496' } },
      phone: '1-770-736-8031',
      website: 'hildegard.org',
      company: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered client-server neural-net', bs: 'harness real-time e-markets' }
    }
  ];

  const mockTodos: Todo[] = [
    { id: 1, userId: 1, title: 'delectus aut autem', completed: false },
    { id: 2, userId: 1, title: 'quis ut nam facilis', completed: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers()', () => {
    it('should return an array of users', () => {
      service.getUsers().subscribe(users => {
        expect(users.length).toBe(1);
        expect(users[0].name).toBe('Leanne Graham');
      });
      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle network error gracefully', () => {
      service.getUsers().subscribe({
        error: err => expect(err.message).toContain('Network error')
      });
      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
      req.error(new ProgressEvent('error'));
    });

    it('should handle 404 error gracefully', () => {
      service.getUsers().subscribe({
        error: err => expect(err.message).toContain('not found')
      });
      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', () => {
      service.getUsers().subscribe({
        error: err => expect(err.message).toContain('Server error')
      });
      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getTodos()', () => {
    it('should return todos', () => {
      service.getTodos().subscribe(todos => {
        expect(todos.length).toBe(2);
        expect(todos[0].completed).toBeFalse();
        expect(todos[1].completed).toBeTrue();
      });
      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos');
      expect(req.request.method).toBe('GET');
      req.flush(mockTodos);
    });
  });

  describe('getTodosByUser()', () => {
    it('should filter todos by userId', () => {
      service.getTodosByUser(1).subscribe(todos => {
        expect(todos.length).toBe(2);
      });
      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos?userId=1');
      req.flush(mockTodos);
    });
  });

  describe('createTodo()', () => {
    it('should POST a new todo and return it', () => {
      const newTodo = { userId: 1, title: 'New Task', completed: false };
      service.createTodo(newTodo).subscribe(todo => {
        expect(todo.title).toBe('New Task');
      });
      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTodo);
      req.flush({ id: 201, ...newTodo });
    });
  });
});
