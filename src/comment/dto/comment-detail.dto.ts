export interface CommentDetail {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  commentText: string;
  timestamp: number;
  replies?: CommentDetail[];
}
