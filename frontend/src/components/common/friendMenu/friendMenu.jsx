import { useSidebarToggle } from '../../../hooks/useSidebarToggle';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faMessage, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import SearchBar from '../../common/header/searchBar';
import './friendMenu.css';

export function FriendMenu({ friends }) {
  const { isFriendMenuOpen, closeFriendMenu } = useSidebarToggle();

  const [userStatus, setUserStatus] = useState('online');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter((fr) =>
    fr.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isFriendMenuOpen) return null;

  return (
    <aside className='friends-sidebar'>
      <header className='friendSidebar-header'>
        {!isSearching ? (
          <div className='friendSidebar-headerOne'>
            <div><h2>Friends</h2></div>
            <div className='friendSidebar-status'>
              <span>Your status</span>
              <select value={userStatus} onChange={(e) => setUserStatus(e.target.value)}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
            <button className='openSearchFriend' onClick={() => setIsSearching(true)}>
              <FontAwesomeIcon className='searchFriendIcon' icon={faSearch} />
            </button>
          </div>
        ) : (
          <div className='friendSidebar-headerTwo'>
            <button className='back' onClick={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}>
              <FontAwesomeIcon className='searchFriendIcon' icon={faChevronLeft} />
            </button>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
        )}
      </header>
            <main>
        {friends.length === 0 ? (
          <p className='noFriendsMessage'>You have no friends added yet</p>
        ) : (
          filteredFriends.map((friend, index) => (
            <div key={index} className='modalFriendCard'>
              <div className={`modalFriendProfile ${userStatus}`}>
                <img src={friend.profile} alt={`${friend.userName}'s profile`} className='FriendImg' />
                <div className={`friendStatus ${userStatus}`}></div>
                <p>{friend.userName}</p>
              </div>
              <div className='buttonsFriends'>
                <button className={`buttonAddFriend ${userStatus}`}>
                  <FontAwesomeIcon className="addFriendIcon" icon={faPlus} />
                </button>
                <button className={`buttonChatFriend ${userStatus}`}>
                  <FontAwesomeIcon className="messageIcon" icon={faMessage} />
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </aside>
  );
}
