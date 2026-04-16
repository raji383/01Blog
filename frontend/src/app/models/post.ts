export interface Post {
  id: number;
  title: string;
  content: string;
  mediaUrl: string;
  authorId: number;
  authorUsername: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;  
  updatedAt: string;
}