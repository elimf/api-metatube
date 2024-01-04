export interface VideoDetail {
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  url: string;
  timestamp: string;
  likedBy: string[];
  comments?: CommentVideoDetail[]; // Ajout de la propriété 'comments' de type Comment[]
  channel?: ChannelVideoDetail;
}

export interface CommentVideoDetail {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string; // URL to the user's avatar image
  };
  commentText: string;
  timestamp: number;
  replies?: Comment[];
}

export interface ChannelVideoDetail {
  id: string;
  channelName: string;
  icon: string;
}
