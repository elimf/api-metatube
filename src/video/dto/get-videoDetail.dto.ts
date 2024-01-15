import { Like } from "../../like/schema/like.schema";

export interface VideoDetail {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  url: string;
  timestamp: string;
  likedBy: Like[];
  comments?: CommentVideoDetail[];
  channel: ChannelVideoDetail;
  suggestions: Suggestions[];
  liked?:boolean;
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
  replies?: CommentVideoDetail[];
}

export interface ChannelVideoDetail {
  _id: string;
  channelName: string;
  icon: string;
  subscribers: number;
}
export interface Suggestions {
  _id: string;
  title: string;
  thumbnail: string;
  timestamp: string;
  url: string;
  channel: ChannelVideoDetail;
}
