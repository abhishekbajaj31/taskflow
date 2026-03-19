import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { User, Todo } from '../../shared/models';

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;

  const mockUsers: User[] = [{
    id: 1, name: 'Leanne Graham', username: 'Bret', email: 'sincere@april.biz',
    address: { street: 'Kulas Light', suite: 'Apt. 556', city: 'Gwenborough', zipcode: '92998', geo: { lat: '-37', lng: '81' } },
    phone: '1-770-736-8031', website: 'hildegard.org',
    company: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered', bs: 'harness' }
  }];

  const mockTodos: Todo[] = [
    { id: 1, userId: 1, title: 'task one', completed: false },
    { id: 2, userId: 1, title: 'task two', completed: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getUsers() should return users', () => {
    service.getUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('Leanne Graham');
    });
    http.expectOne('https://jsonplaceholder.typicode.com/users').flush(mockUsers);
  });

  it('getUsers() should handle network error', () => {
    service.getUsers().subscribe({ error: err => expect(err.message).toContain('No internet') });
    http.expectOne('https://jsonplaceholder.typicode.com/users').error(new ProgressEvent('error'));
  });

  it('getUsers() should handle 404', () => {
    service.getUsers().subscribe({ error: err => expect(err.message).toContain('not found') });
    http.expectOne('https://jsonplaceholder.typicode.com/users').flush('', { status: 404, statusText: 'Not Found' });
  });

  it('getUsers() should handle 500', () => {
    service.getUsers().subscribe({ error: err => expect(err.message).toContain('Server error') });
    http.expectOne('https://jsonplaceholder.typicode.com/users').flush('', { status: 500, statusText: 'Server Error' });
  });

  it('getTodos() should return todos', () => {
    service.getTodos().subscribe(todos => expect(todos.length).toBe(2));
    http.expectOne('https://jsonplaceholder.typicode.com/todos').flush(mockTodos);
  });

  it('getTodosByUser() should use userId param', () => {
    service.getTodosByUser(1).subscribe(todos => expect(todos.length).toBe(2));
    http.expectOne('https://jsonplaceholder.typicode.com/todos?userId=1').flush(mockTodos);
  });

  it('createTodo() should POST', () => {
    const payload = { userId: 1, title: 'new task', completed: false };
    service.createTodo(payload).subscribe(t => expect(t.title).toBe('new task'));
    const req = http.expectOne('https://jsonplaceholder.typicode.com/todos');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 201, ...payload });
  });
});
