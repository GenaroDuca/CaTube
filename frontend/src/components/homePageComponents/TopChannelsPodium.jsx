import './TopChannelsPodium.css';
import { Link } from 'react-router-dom';

function TopChannelsPodium({ channels }) {
    // Si no hay suficientes canales, no mostrar el podio
    if (!channels || channels.length < 3) {
        return null;
    }

    // Obtener los 3 primeros canales (ya vienen ordenados por suscriptores)
    const topThree = channels.slice(0, 3);
    const [first, second, third] = topThree;

    const formatSubs = (subs) => {
        if (subs >= 1000000) {
            return `${(subs / 1000000).toFixed(1)}M`;
        } else if (subs >= 1000) {
            return `${(subs / 1000).toFixed(1)}K`;
        }
        return subs;
    };

    return (
        <div className="podium-container">
            <h2 className="podium-title">Top Channels</h2>

            <div className="podium-wrapper">
                {/* Segundo Lugar */}
                <Link to={`/yourchannel/${second.url}`} className="podium-item podium-second">
                    <div className="podium-rank">2</div>
                    <div className="podium-content">
                        <img
                            src={second.photo}
                            alt={second.name}
                            className="podium-avatar"
                        />
                        <h3 className="podium-channel-name">{second.name}</h3>
                        <p className="podium-handle">{second.handle}</p>
                        <div className="podium-subs">
                            <span className="subs-count">{formatSubs(second.subs)}</span>
                            <span className="subs-label">Catscribers</span>
                        </div>
                    </div>
                    <div className="podium-base podium-base-second">
                        <span className="podium-position">#2</span>
                    </div>
                </Link>

                {/* Primer Lugar */}
                <Link to={`/yourchannel/${first.url}`} className="podium-item podium-first">
                    <div className="podium-crown">👑</div>
                    <div className="podium-rank">1</div>
                    <div className="podium-content">
                        <img
                            src={first.photo}
                            alt={first.name}
                            className="podium-avatar podium-avatar-first"
                        />
                        <h3 className="podium-channel-name">{first.name}</h3>
                        <p className="podium-handle">{first.handle}</p>
                        <div className="podium-subs">
                            <span className="subs-count">{formatSubs(first.subs)}</span>
                            <span className="subs-label">Catscribers</span>
                        </div>
                    </div>
                    <div className="podium-base podium-base-first">
                        <span className="podium-position">#1</span>
                    </div>
                </Link>

                {/* Tercer Lugar */}
                <Link to={`/yourchannel/${third.url}`} className="podium-item podium-third">
                    <div className="podium-rank">3</div>
                    <div className="podium-content">
                        <img
                            src={third.photo}
                            alt={third.name}
                            className="podium-avatar"
                        />
                        <h3 className="podium-channel-name">{third.name}</h3>
                        <p className="podium-handle">{third.handle}</p>
                        <div className="podium-subs">
                            <span className="subs-count">{formatSubs(third.subs)}</span>
                            <span className="subs-label">Catscribers</span>
                        </div>
                    </div>
                    <div className="podium-base podium-base-third">
                        <span className="podium-position">#3</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default TopChannelsPodium;
