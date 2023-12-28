import { Playlist } from '../../playlist/schema/playlist.schema';
import { Video } from "../../video/schema/video.schema";

export class ChannelDTO {
  channelName: string;
  description: string;
  subscribers: number;
  videos: Video[];
  isVerified: boolean;
  playlists: Playlist[];
  icon: string;
  timestamp: string;
}
