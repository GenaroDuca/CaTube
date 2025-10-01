import { containerChannel } from '../../../assets/data/Data';

function ContainerChannel() {
    return (
        <div className="container-channel">
            <div className="principal-video-container">
                <div className="principal-video">
                    <img className="principal-video" src={containerChannel.src} alt={containerChannel.name}></img>
                </div>
                <div className="text-principal-video">
                    <h2>{containerChannel.name}</h2>
                    <div className="row-principal">
                        <p className="space">{containerChannel.views}</p>
                        <p className="space">{containerChannel.time}</p>
                    </div>
                    <p>{containerChannel.description}</p>
                </div>
            </div>
        </div>
    );
}

export default ContainerChannel;