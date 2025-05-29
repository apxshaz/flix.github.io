import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipForward,
  SkipBack,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Search,
  Bell,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Settings,
  LogOut,
  Edit,
  Trash2
} from 'lucide-react';

// Context for global state management
const NetflixContext = createContext();

export const useNetflix = () => {
  const context = useContext(NetflixContext);
  if (!context) {
    throw new Error('useNetflix must be used within NetflixProvider');
  }
  return context;
};

// TMDB API configuration
const TMDB_API_KEY = 'c8dea14dc917687ac631a52620e4f7ad';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Mock data for demo
const mockMoviePosters = [
  'https://images.pexels.com/photos/7149329/pexels-photo-7149329.jpeg',
  'https://images.unsplash.com/photo-1590179068383-b9c69aacebd3',
  'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
  'https://images.pexels.com/photos/8272156/pexels-photo-8272156.jpeg'
];

const profileAvatars = [
  'https://images.pexels.com/photos/7119374/pexels-photo-7119374.jpeg',
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1',
  'https://images.unsplash.com/photo-1715615718528-ea7429aacc46',
  'https://images.unsplash.com/photo-1661747675288-814df576be9d',
  'https://images.pexels.com/photos/9419383/pexels-photo-9419383.jpeg'
];

// Provider component
export const NetflixProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);
  const [myList, setMyList] = useState([]);
  const [adminContent, setAdminContent] = useState([]);
  const [featuredContent, setFeaturedContent] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('netflix_current_user');
    const storedWatchHistory = localStorage.getItem('netflix_watch_history');
    const storedMyList = localStorage.getItem('netflix_my_list');
    const storedAdminContent = localStorage.getItem('netflix_admin_content');

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }

    if (storedWatchHistory) {
      setWatchHistory(JSON.parse(storedWatchHistory));
    }

    if (storedMyList) {
      setMyList(JSON.parse(storedMyList));
    }

    if (storedAdminContent) {
      const content = JSON.parse(storedAdminContent);
      setAdminContent(content);
      // Set featured content from admin content
      if (content.length > 0) {
        setFeaturedContent(content[0]);
      }
    }
  }, []);

  const register = (email, password, name) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('netflix_users') || '[]');
      
      // Check if user already exists
      if (existingUsers.find(user => user.email === email)) {
        return { success: false, message: 'User already exists' };
      }

      const newUser = {
        email,
        password, // In a real app, this would be hashed
        name,
        profiles: [],
        isAdmin: email === 'admin@gmail.com'
      };

      existingUsers.push(newUser);
      localStorage.setItem('netflix_users', JSON.stringify(existingUsers));
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  };

  const login = (email, password) => {
    try {
      // Check for admin login
      if (email === 'admin@gmail.com' && password === 'netflixadmin2024') {
        const adminUser = {
          email: 'admin@gmail.com',
          name: 'Administrator',
          isAdmin: true,
          profiles: [{ id: 1, name: 'Admin', avatar: profileAvatars[0] }]
        };
        setCurrentUser(adminUser);
        setIsLoggedIn(true);
        localStorage.setItem('netflix_current_user', JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }

      // Check regular users
      const existingUsers = JSON.parse(localStorage.getItem('netflix_users') || '[]');
      const user = existingUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('netflix_current_user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false, message: 'Invalid email or password' };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentProfile(null);
    localStorage.removeItem('netflix_current_user');
    localStorage.removeItem('netflix_current_profile');
  };



  const addToWatchHistory = (content) => {
    // Clean the content object to avoid circular references
    const cleanContent = {
      id: content.id,
      title: content.title,
      name: content.name,
      overview: content.overview,
      poster_path: content.poster_path,
      backdrop_path: content.backdrop_path,
      release_date: content.release_date,
      first_air_date: content.first_air_date,
      vote_average: content.vote_average,
      genre_ids: content.genre_ids,
      type: content.type,
      video_url: content.video_url,
      year: content.year,
      genre: content.genre
    };
    
    const newHistory = [cleanContent, ...watchHistory.filter(item => item.id !== cleanContent.id)].slice(0, 50);
    setWatchHistory(newHistory);
    localStorage.setItem('netflix_watch_history', JSON.stringify(newHistory));
  };

  const addToMyList = (content) => {
    if (!myList.find(item => item.id === content.id)) {
      // Clean the content object to avoid circular references
      const cleanContent = {
        id: content.id,
        title: content.title,
        name: content.name,
        overview: content.overview,
        poster_path: content.poster_path,
        backdrop_path: content.backdrop_path,
        release_date: content.release_date,
        first_air_date: content.first_air_date,
        vote_average: content.vote_average,
        genre_ids: content.genre_ids,
        type: content.type,
        video_url: content.video_url,
        year: content.year,
        genre: content.genre
      };
      
      const newList = [...myList, cleanContent];
      setMyList(newList);
      localStorage.setItem('netflix_my_list', JSON.stringify(newList));
    }
  };

  const removeFromMyList = (contentId) => {
    const newList = myList.filter(item => item.id !== contentId);
    setMyList(newList);
    localStorage.setItem('netflix_my_list', JSON.stringify(newList));
  };

  const addAdminContent = (content) => {
    const newContent = [...adminContent, { ...content, id: Date.now() }];
    setAdminContent(newContent);
    localStorage.setItem('netflix_admin_content', JSON.stringify(newContent));
  };

  const updateAdminContent = (contentId, updatedContent) => {
    const newContent = adminContent.map(item => 
      item.id === contentId ? { ...item, ...updatedContent } : item
    );
    setAdminContent(newContent);
    localStorage.setItem('netflix_admin_content', JSON.stringify(newContent));
  };

  const deleteAdminContent = (contentId) => {
    const newContent = adminContent.filter(item => item.id !== contentId);
    setAdminContent(newContent);
    localStorage.setItem('netflix_admin_content', JSON.stringify(newContent));
  };
  const createProfile = (profileName, avatarUrl) => {
    if (!currentUser) return { success: false, message: 'User not logged in' };
    
    const newProfile = {
      id: Date.now(),
      name: profileName,
      avatar: avatarUrl || profileAvatars[Math.floor(Math.random() * profileAvatars.length)]
    };

    const updatedUser = {
      ...currentUser,
      profiles: [...(currentUser.profiles || []), newProfile]
    };

    setCurrentUser(updatedUser);
    
    // Update stored user data
    localStorage.setItem('netflix_current_user', JSON.stringify(updatedUser));
    
    // Update in users list
    const existingUsers = JSON.parse(localStorage.getItem('netflix_users') || '[]');
    const updatedUsers = existingUsers.map(user => 
      user.email === currentUser.email ? updatedUser : user
    );
    localStorage.setItem('netflix_users', JSON.stringify(updatedUsers));

    return { success: true, profile: newProfile };
  };

  const value = {
    currentUser,
    isLoggedIn,
    currentProfile,
    setCurrentProfile,
    watchHistory,
    myList,
    adminContent,
    featuredContent,
    register,
    login,
    logout,
    createProfile,
    addToWatchHistory,
    addToMyList,
    removeFromMyList,
    addAdminContent,
    updateAdminContent,
    deleteAdminContent
  };

  return (
    <NetflixContext.Provider value={value}>
      {children}
    </NetflixContext.Provider>
  );
};

// Custom Video Player Component
export const CustomVideoPlayer = ({ videoUrl, title, onClose, autoPlay = false }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Ensure we have a valid video URL
  const validVideoUrl = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      setHasError(false);
      if (autoPlay) {
        video.play().catch(err => {
          console.error('Auto-play failed:', err);
          setHasError(true);
        });
        setIsPlaying(true);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    
    const handleError = (e) => {
      console.error('Video error:', e);
      setHasError(true);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [autoPlay]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          seek(currentTime - 10);
          break;
        case 'ArrowRight':
          seek(currentTime + 10);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (hasError) return;
    
    if (video.paused) {
      video.play().catch(err => {
        console.error('Play failed:', err);
        setHasError(true);
      });
    } else {
      video.pause();
    }
  };

  const seek = (time) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(time, duration));
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = (rate) => {
    const video = videoRef.current;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={handleMouseMove}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
      >
        <X size={24} />
      </button>

      {/* Video Element */}
      <video
        ref={videoRef}
        src={validVideoUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        crossOrigin="anonymous"
      />

      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <X size={32} className="text-white" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Video Error</h3>
            <p className="text-gray-400 mb-4">Unable to load video source</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Center Play Button */}
      {!isPlaying && !isLoading && (
        <motion.button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play size={40} className="text-white ml-1" />
          </div>
        </motion.button>
      )}

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 text-white"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            {/* Progress Bar */}
            <div
              className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer relative group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-red-600 rounded-full relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-0 w-3 h-3 bg-red-600 rounded-full transform -translate-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button onClick={togglePlay} className="hover:scale-110 transition-transform">
                  {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                </button>

                {/* Skip Buttons */}
                <button
                  onClick={() => seek(currentTime - 10)}
                  className="hover:scale-110 transition-transform"
                >
                  <SkipBack size={24} />
                </button>
                <button
                  onClick={() => seek(currentTime + 10)}
                  className="hover:scale-110 transition-transform"
                >
                  <SkipForward size={24} />
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="hover:scale-110 transition-transform">
                    {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-red-600"
                  />
                </div>

                {/* Time Display */}
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Playback Speed */}
                <div className="relative group">
                  <button className="hover:scale-110 transition-transform">
                    {playbackRate}x
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-80 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`block w-full text-left px-2 py-1 hover:bg-red-600 rounded ${
                          playbackRate === rate ? 'bg-red-600' : ''
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="hover:scale-110 transition-transform"
                >
                  {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="mt-2">
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Login Component
export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useNetflix();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        
        const result = register(formData.email, formData.password, formData.name);
        if (result.success) {
          // Automatically log in after successful registration
          const loginResult = login(formData.email, formData.password);
          if (!loginResult.success) {
            setError(loginResult.message);
          }
        } else {
          setError(result.message);
        }
      } else {
        const result = login(formData.email, formData.password);
        if (!result.success) {
          setError(result.message || 'Invalid email or password');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.pexels.com/photos/2387819/pexels-photo-2387819.jpeg')`
        }}
      ></div>

      {/* Netflix Logo */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-red-600 text-4xl font-bold">NETFLIX</h1>
      </div>

      {/* Login Form */}
      <motion.div
        className="relative z-10 bg-black bg-opacity-80 p-16 rounded-lg max-w-md w-full mx-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-white text-3xl font-bold mb-8">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-600 bg-opacity-80 text-white text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-4 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-4 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
            required
            minLength="6"
          />

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </motion.button>
        </form>

        <div className="mt-6 text-gray-400 text-center">
          {isSignUp ? 'Already have an account?' : 'New to Netflix?'}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setFormData({ email: '', password: '', name: '' });
            }}
            className="text-white hover:underline"
          >
            {isSignUp ? 'Sign in now' : 'Sign up now'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Profile Selection Component
export const ProfileSelection = () => {
  const { currentUser, setCurrentProfile, createProfile } = useNetflix();
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const handleProfileSelect = (profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('netflix_current_profile', JSON.stringify(profile));
  };

  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    const result = createProfile(profileName, selectedAvatar);
    if (result.success) {
      setShowCreateProfile(false);
      setProfileName('');
      setSelectedAvatar('');
      handleProfileSelect(result.profile);
    }
  };

  const userProfiles = currentUser?.profiles || [];

  if (showCreateProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md w-full mx-4">
          <h1 className="text-white text-4xl font-light mb-8">Create Profile</h1>
          
          <form onSubmit={handleCreateProfile} className="space-y-6">
            <input
              type="text"
              placeholder="Profile Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full p-4 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none text-center"
              required
              maxLength="20"
            />

            <div>
              <p className="text-white text-lg mb-4">Choose an avatar:</p>
              <div className="grid grid-cols-3 gap-4">
                {profileAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-4 transition-all ${
                      selectedAvatar === avatar ? 'border-red-600' : 'border-transparent hover:border-white'
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <motion.button
                type="submit"
                className="flex-1 bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Profile
              </motion.button>
              
              <button
                type="button"
                onClick={() => setShowCreateProfile(false)}
                className="flex-1 bg-gray-600 text-white py-3 rounded font-semibold hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-5xl font-light mb-12">Who's watching?</h1>
        
        <div className="flex justify-center items-center space-x-8 flex-wrap">
          {userProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              className="text-center cursor-pointer group mb-8"
              onClick={() => handleProfileSelect(profile)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-32 h-32 mb-4 overflow-hidden rounded-lg border-4 border-transparent group-hover:border-white transition-all">
                <img
                  src={profile.avatar || profileAvatars[index % profileAvatars.length]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-white text-xl group-hover:text-gray-300 transition-colors">
                {profile.name}
              </p>
            </motion.div>
          ))}

          {/* Add Profile Button */}
          {userProfiles.length < 5 && (
            <motion.div
              className="text-center cursor-pointer group mb-8"
              onClick={() => setShowCreateProfile(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-32 h-32 mb-4 bg-gray-800 rounded-lg border-4 border-transparent group-hover:border-white transition-all flex items-center justify-center">
                <Plus size={48} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <p className="text-white text-xl group-hover:text-gray-300 transition-colors">
                Add Profile
              </p>
            </motion.div>
          )}
        </div>

        {userProfiles.length === 0 && (
          <div className="mt-8">
            <p className="text-gray-400 text-lg mb-6">You need to create at least one profile to continue.</p>
            <motion.button
              onClick={() => setShowCreateProfile(true)}
              className="bg-red-600 text-white px-8 py-3 rounded font-semibold hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your First Profile
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

// Netflix Header Component
export const NetflixHeader = ({ onSearch, onProfileClick }) => {
  const { currentProfile, logout } = useNetflix();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="fixed top-0 w-full bg-gradient-to-b from-black via-black/70 to-transparent z-40 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <h1 className="text-red-600 text-3xl font-bold">NETFLIX</h1>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6 text-white">
            <a href="#" className="hover:text-gray-300 transition-colors">Home</a>
            <a href="#" className="hover:text-gray-300 transition-colors">TV Shows</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Movies</a>
            <a href="#" className="hover:text-gray-300 transition-colors">New & Popular</a>
            <a href="#" className="hover:text-gray-300 transition-colors">My List</a>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black bg-opacity-50 text-white px-4 py-2 pl-10 rounded border border-gray-600 focus:border-white focus:outline-none w-64"
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </form>

          {/* Notifications */}
          <button className="text-white hover:text-gray-300 transition-colors">
            <Bell size={24} />
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
            >
              <img
                src={currentProfile?.avatar || profileAvatars[0]}
                alt="Profile"
                className="w-8 h-8 rounded object-cover"
              />
              <ChevronDown size={16} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 bg-black bg-opacity-90 rounded py-2 w-48">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onProfileClick?.();
                  }}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                >
                  Manage Profiles
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Content Card Component
export const ContentCard = ({ content, onClick, isLarge = false }) => {
  const { addToMyList, removeFromMyList, myList } = useNetflix();
  const [showActions, setShowActions] = useState(false);
  const isInMyList = myList.some(item => item.id === content.id);

  const handleMyListToggle = (e) => {
    e.stopPropagation();
    if (isInMyList) {
      removeFromMyList(content.id);
    } else {
      addToMyList(content);
    }
  };

  const getImageUrl = () => {
    if (content.poster_path && content.poster_path.startsWith('http')) {
      return content.poster_path;
    }
    if (content.poster_path) {
      return `${IMAGE_BASE_URL}${content.poster_path}`;
    }
    return mockMoviePosters[0];
  };

  return (
    <motion.div
      className={`relative cursor-pointer group ${isLarge ? 'w-80' : 'w-48'}`}
      onClick={() => onClick(content)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`${isLarge ? 'h-48' : 'h-72'} rounded-lg overflow-hidden bg-gray-800`}>
        <img
          src={getImageUrl()}
          alt={content.title || content.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Actions Overlay */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex space-x-3">
              <motion.button
                onClick={onClick}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play size={20} className="text-black ml-1" />
              </motion.button>
              
              <motion.button
                onClick={handleMyListToggle}
                className="w-12 h-12 bg-gray-800 bg-opacity-80 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Plus size={20} className={isInMyList ? 'rotate-45' : ''} />
              </motion.button>
              
              <motion.button
                className="w-12 h-12 bg-gray-800 bg-opacity-80 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ThumbsUp size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div className="mt-2">
        <h3 className="text-white text-sm font-medium truncate">
          {content.title || content.name}
        </h3>
        <p className="text-gray-400 text-xs">
          {content.release_date?.split('-')[0] || content.first_air_date?.split('-')[0] || '2024'}
        </p>
      </div>
    </motion.div>
  );
};

// Content Row Component
export const ContentRow = ({ title, content, onContentClick, isLarge = false }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = isLarge ? 400 : 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-white text-2xl font-bold mb-4 px-4">{title}</h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Content */}
        <div
          ref={scrollRef}
          className="flex space-x-4 px-4 overflow-x-hidden scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {content.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              onClick={onContentClick}
              isLarge={isLarge}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

// Hero Banner Component
export const HeroBanner = ({ content, onPlay, onMoreInfo }) => {
  if (!content) return null;

  const getBackdropUrl = () => {
    if (content.backdrop_path && content.backdrop_path.startsWith('http')) {
      return content.backdrop_path;
    }
    if (content.backdrop_path) {
      return `${IMAGE_BASE_URL}${content.backdrop_path}`;
    }
    return 'https://images.pexels.com/photos/2387819/pexels-photo-2387819.jpeg';
  };

  return (
    <div className="relative h-screen flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%), url('${getBackdropUrl()}')`
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl ml-16">
        <motion.h1 
          className="text-white text-6xl font-bold mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {content.title || content.name}
        </motion.h1>
        
        <motion.p 
          className="text-white text-lg mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {content.overview}
        </motion.p>

        <motion.div 
          className="flex space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            onClick={() => onPlay(content)}
            className="bg-white text-black px-8 py-3 rounded font-bold text-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={24} className="ml-1" />
            <span>Play</span>
          </motion.button>
          
          <motion.button
            onClick={() => onMoreInfo(content)}
            className="bg-gray-600 bg-opacity-70 text-white px-8 py-3 rounded font-bold text-lg hover:bg-opacity-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            More Info
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// Admin Panel Component
export const AdminPanel = ({ isOpen, onClose }) => {
  const { adminContent, addAdminContent, updateAdminContent, deleteAdminContent } = useNetflix();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    genre: '',
    year: '',
    thumbnail: '',
    videoFile: null,
    videoUrl: '',
    type: 'movie'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      overview: '',
      genre: '',
      year: '',
      thumbnail: '',
      videoFile: null,
      videoUrl: '',
      type: 'movie'
    });
    setEditingContent(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const contentData = {
      ...formData,
      id: editingContent ? editingContent.id : Date.now(),
      poster_path: formData.thumbnail,
      backdrop_path: formData.thumbnail,
      release_date: formData.year,
      vote_average: (Math.random() * 3 + 7).toFixed(1),
      video_url: formData.videoFile ? URL.createObjectURL(formData.videoFile) : formData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    };

    if (editingContent) {
      updateAdminContent(editingContent.id, contentData);
    } else {
      addAdminContent(contentData);
    }

    resetForm();
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      overview: content.overview,
      genre: content.genre || '',
      year: content.release_date || content.year || '',
      thumbnail: content.poster_path,
      videoFile: null,
      videoUrl: content.video_url || '',
      type: content.type || 'movie'
    });
    setShowAddForm(true);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gray-900 rounded-lg p-8 max-w-4xl w-full max-h-screen overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-3xl font-bold">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X size={32} />
          </button>
        </div>

        {!showAddForm ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-semibold">Manage Content</h3>
              <motion.button
                onClick={() => setShowAddForm(true)}
                className="bg-red-600 text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
                <span>Add Content</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminContent.map((content) => (
                <div key={content.id} className="bg-gray-800 rounded-lg p-4">
                  <img
                    src={content.poster_path || mockMoviePosters[0]}
                    alt={content.title}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                  <h4 className="text-white font-semibold mb-2 truncate">{content.title}</h4>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{content.overview}</p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(content)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteAdminContent(content.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-semibold">
                {editingContent ? 'Edit Content' : 'Add New Content'}
              </h3>
              <button
                onClick={resetForm}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
                  required
                />
                
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
                >
                  <option value="movie">Movie</option>
                  <option value="tv">TV Show</option>
                </select>
              </div>

              <textarea
                placeholder="Overview/Description"
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none h-32 resize-none"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="Year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
                />
              </div>

              <input
                type="url"
                placeholder="Thumbnail Image URL"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
              />

              <div className="space-y-4">
                <h4 className="text-white font-semibold">Video Source</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 text-white">
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={(e) => setFormData({ ...formData, videoFile: e.target.files[0] })}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer transition-colors flex items-center space-x-2"
                    >
                      <Upload size={20} />
                      <span>Upload MP4 File</span>
                    </label>
                    {formData.videoFile && (
                      <span className="text-green-400">{formData.videoFile.name}</span>
                    )}
                  </label>

                  <div className="text-white text-center">OR</div>

                  <input
                    type="url"
                    placeholder="Video URL (MP4 link)"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  className="bg-red-600 text-white px-8 py-3 rounded font-semibold hover:bg-red-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {editingContent ? 'Update Content' : 'Add Content'}
                </motion.button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-8 py-3 rounded font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
};