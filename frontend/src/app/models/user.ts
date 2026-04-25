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
  id: number;
}

interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  banned: boolean;
  subscribed: boolean;
  followerCount: number;
  followingCount: number;
}
interface LikeResponse {
  likeCount: number;
  liked: boolean;
  postId: number;
  userId: number;
  username: string;
}
export type { RegisterPayload, LoginPayload, AuthResponse, PostResponse, UserProfileResponse, LikeResponse };
