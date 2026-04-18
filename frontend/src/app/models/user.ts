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
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  banned: boolean;
}

export type { RegisterPayload, LoginPayload, AuthResponse, PostResponse, UserProfileResponse };