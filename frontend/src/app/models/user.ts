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
  authorId: number;
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
  notificationCount: number;
  followerCount: number;
  followingCount: number;
}
interface UserAdminResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  banned: boolean;
}
interface AdminPostResponse extends PostResponse { }
interface AdminReportResponse {
  id: number;
  type: string;
  reason: string;
  createdAt: string;
  reporterId: number;
  reporterUsername: string;
  reporterEmail: string;
  reportedId: number;
  reportedUsername: string;
  reportedEmail: string;
  reportedPostId: number | null;
  reportedPostTitle: string | null;
  reportedPostContent: string | null;
  reportedPostMediaUrl: string | null;
}
interface LikeResponse {
  likeCount: number;
  liked: boolean;
  postId: number;
  userId: number;
  username: string;
}
interface NotificationResponse {
  id: number;
  type: string;
  message: string;
  senderUsername: string;
  senderId: number;
  read: boolean;
  createdAt: string;
}
interface ReportAdminRequest {
  type: string;
  reason: string;
  createdAt: string;
}

export type {
  RegisterPayload,
  LoginPayload,
  AuthResponse,
  PostResponse,
  UserProfileResponse,
  UserAdminResponse,
  AdminPostResponse,
  AdminReportResponse,
  LikeResponse,
  NotificationResponse,
  ReportAdminRequest
};
