import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './components/contexts/auth'

// Layout
import Layout from './components/pieces/Layout'

// Pages
import Login from './components/pages/Login/Login'
import Home from './components/pages/Home/Home'
import Downloads from './components/pages/Downloads/Downloads'
import MediaList from './components/pages/MediaList/MediaList'
import UserProfile from './components/pages/UserProfile/UserProfile'
import Agenda from './components/pages/Agenda/Agenda'
import PostsList from './components/pages/PostsList/PostsList'
import LikedPosts from './components/pages/LikedPosts/LikedPosts'
import LikedMedia from './components/pages/LikedMedia/LikedMedia'
import Announcements from './components/pages/Announcements/Announcements'
import Settings from './components/pages/Settings/Settings'

// Styles
import './index.css'
import './App.css'

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />

      {/* Protected Routes */}
      <Route element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/home" element={<Home />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/media" element={<MediaList />} />
        <Route path="/profile/:username?" element={<UserProfile />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/posts" element={<PostsList />} />
        <Route path="/favposts" element={<LikedPosts />} />
        <Route path="/favmedia" element={<LikedMedia />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
      <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
    </Routes>
  )
}

export default App
