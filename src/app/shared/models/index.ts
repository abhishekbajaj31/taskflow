// User / Project model
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
  geo: Geo;
}

export interface Geo {
  lat: string;
  lng: string;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

// Todo / Task model
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

// Comment model
export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

// Derived / enriched models
export interface Project extends User {
  taskCount?: number;
  completedTaskCount?: number;
  pendingTaskCount?: number;
}

export interface Task extends Todo {
  status: TaskStatus;
}

export type TaskStatus = 'pending' | 'completed';

// Form model
export interface TaskFormData {
  title: string;
  status: TaskStatus;
}

// State helpers
export interface LoadingState {
  loading: boolean;
  error: string | null;
}
