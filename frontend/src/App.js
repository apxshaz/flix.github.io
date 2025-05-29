import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';

import {
  NetflixProvider,
  useNetflix,
  Login,
  ProfileSelection,
  NetflixHeader,
  HeroBanner,
  ContentRow,
  CustomVideoPlayer,
  AdminPanel
} from './components';

// Main Netflix Home Component
const NetflixHome = () => {
  const {
    currentUser,
    currentProfile,
    adminContent,
    featuredContent,
    watchHistory,
    myList,
    addToWatchHistory
  } = useNetflix();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle video playback
  const handlePlay = (content) => {
    setCurrentVideo(content);
    addToWatchHistory(content);
  };

  // Handle search
  const handleSearch = (query) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    const allContent = [...adminContent];
    const filtered = allContent.filter(item =>
      (item.title || item.name)?.toLowerCase().includes(query.toLowerCase()) ||
      item.overview?.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
    setIsSearching(true);
  };

  // Check if user is admin
  const isAdmin = currentUser?.isAdmin;

  if (isSearching) {
    return (
      <div className="min-h-screen bg-black">
        <NetflixHeader onSearch={handleSearch} />
        
        <div className="pt-24 px-4">
          <h2 className="text-white text-2xl font-bold mb-6">Search Results</h2>
          
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((content) => (
                <div
                  key={content.id}
                  className="cursor-pointer group"
                  onClick={() => handlePlay(content)}
                >
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                    <img
                      src={content.poster_path?.startsWith('http') 
                        ? content.poster_path 
                        : content.poster_path 
                          ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
                          : 'https://images.pexels.com/photos/7149329/pexels-photo-7149329.jpeg'
                      }
                      alt={content.title || content.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-white text-sm font-medium mt-2 truncate">
                    {content.title || content.name}
                  </h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-xl">No results found</p>
            </div>
          )}
        </div>

        {/* Video Player */}
        <AnimatePresence>
          {currentVideo && (
            <CustomVideoPlayer
              videoUrl={currentVideo.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
              title={currentVideo.title || currentVideo.name}
              onClose={() => setCurrentVideo(null)}
              autoPlay={true}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <NetflixHeader onSearch={handleSearch} />

      {/* Admin Button */}
      {isAdmin && (
        <button
          onClick={() => setShowAdminPanel(true)}
          className="fixed bottom-8 right-8 z-30 bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg"
        >
          Admin Panel
        </button>
      )}

      {/* Hero Banner */}
      {featuredContent && (
        <HeroBanner
          content={featuredContent}
          onPlay={handlePlay}
          onMoreInfo={(content) => console.log('More info for:', content)}
        />
      )}

      {/* Content Rows */}
      <div className="relative -mt-32 z-20 space-y-8 pb-16">
        {/* Continue Watching */}
        {watchHistory.length > 0 && (
          <ContentRow
            title="Continue Watching"
            content={watchHistory.slice(0, 10)}
            onContentClick={handlePlay}
            isLarge={true}
          />
        )}

        {/* My List */}
        {myList.length > 0 && (
          <ContentRow
            title="My List"
            content={myList}
            onContentClick={handlePlay}
          />
        )}

        {/* Admin Content - All Categories */}
        {adminContent.length > 0 && (
          <>
            <ContentRow
              title="Netflix Originals"
              content={adminContent.filter(content => content.type === 'tv' || content.type === 'series').slice(0, 15)}
              onContentClick={handlePlay}
            />
            
            <ContentRow
              title="Movies"
              content={adminContent.filter(content => content.type === 'movie').slice(0, 15)}
              onContentClick={handlePlay}
            />
            
            <ContentRow
              title="Recently Added"
              content={adminContent.slice(0, 15)}
              onContentClick={handlePlay}
            />
          </>
        )}

        {/* Empty State */}
        {adminContent.length === 0 && !isAdmin && (
          <div className="text-center py-32">
            <h2 className="text-white text-3xl font-bold mb-4">No Content Available</h2>
            <p className="text-gray-400 text-lg">
              Content will appear here once the administrator adds movies and shows.
            </p>
          </div>
        )}

        {/* Admin Empty State */}
        {adminContent.length === 0 && isAdmin && (
          <div className="text-center py-32">
            <h2 className="text-white text-3xl font-bold mb-4">Welcome, Administrator!</h2>
            <p className="text-gray-400 text-lg mb-8">
              Start building your Netflix library by adding movies and TV shows.
            </p>
            <button
              onClick={() => setShowAdminPanel(true)}
              className="bg-red-600 text-white px-8 py-3 rounded font-semibold hover:bg-red-700 transition-colors"
            >
              Add Your First Content
            </button>
          </div>
        )}
      </div>

      {/* Video Player */}
      <AnimatePresence>
        {currentVideo && (
          <CustomVideoPlayer
            videoUrl={currentVideo.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            title={currentVideo.title || currentVideo.name}
            onClose={() => setCurrentVideo(null)}
            autoPlay={true}
          />
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdminPanel && (
          <AdminPanel
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Main App Component
const NetflixApp = () => {
  const { isLoggedIn, currentProfile } = useNetflix();

  if (!isLoggedIn) {
    return <Login />;
  }

  if (!currentProfile) {
    return <ProfileSelection />;
  }

  return <NetflixHome />;
};

// Root App Component
function App() {
  return (
    <div className="App">
      <NetflixProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<NetflixApp />} />
          </Routes>
        </BrowserRouter>
      </NetflixProvider>
    </div>
  );
}

export default App;