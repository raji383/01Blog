interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface AuthResponse {
  id: number;
  username: string;
  jwt: string;
}

interface PostResponse {
  title: string;
  content: string;
  mediaUrl: string;
  authorUsername: string;
}

export type { RegisterPayload, LoginPayload, AuthResponse, PostResponse };