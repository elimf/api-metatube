import { AllVideo } from '../../video/dto/get-all-video';
import { Playlist } from '../../playlist/schema/playlist.schema';

export class ChannelDTO {
  channelName: string;
  description: string;
  subscribers: number;
  videos: AllVideo[];
  isVerified: boolean;
  playlists: Playlist[];
  icon: string;
  timestamp: string;
}
