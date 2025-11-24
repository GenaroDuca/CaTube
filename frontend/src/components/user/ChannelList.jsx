import { CatubeSubsCard } from './CatubeSubsCard'
import './ChannelList.css'

export function ChannelList({ channels }) {
    return (
        <div className='sr-channelSection'>
            {channels.map((channel) => (
                <CatubeSubsCard
                    key={channel.id}
                    channelId={channel.id}
                    userName={channel.userName}
                    avatar={channel.avatar}
                    subscriptions={channel.subscriptions}
                    channelUrl={channel.url ? `/yourchannel/${channel.url}` : null}
                    isFollowing={false}
                />
            ))}
        </div>
    )
}
