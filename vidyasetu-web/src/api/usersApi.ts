import apiClient from "./client";

// =====================================================
// Users API Service - Full CRUD Operations
// =====================================================

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<User>("/users/", data);
  return response.data;
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>("/users/");
  return response.data;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  const response = await apiClient.get<User>(`/users/${userId}`);
  return response.data;
}

/**
 * Update user by ID
 */
export async function updateUser(
  userId: string,
  data: UpdateUserRequest
): Promise<User> {
  const response = await apiClient.put<User>(`/users/${userId}`, data);
  return response.data;
}

/**
 * Delete user by ID
 */
export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}

export default {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
