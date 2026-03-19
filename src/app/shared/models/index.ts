export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: { lat: string; lng: string };
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

// User + computed task counts
export interface Project extends User {
  taskCount?: number;
  completedTaskCount?: number;
  pendingTaskCount?: number;
}

// Todo + status string
export interface Task extends Todo {
  status: 'pending' | 'completed';
}

export interface TaskFormData {
  title: string;
  status: 'pending' | 'completed';
}
