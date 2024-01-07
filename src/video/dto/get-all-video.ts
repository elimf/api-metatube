import { ChannelVideoDetail } from './get-videoDetail.dto';

export interface AllVideo {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  url: string;
  timestamp: string;
  channel: ChannelVideoDetail;
}
