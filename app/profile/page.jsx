'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { User, Shield, Image as ImageIcon, KeyRound, Save, Loader2, CheckCircle, AlertTriangle, Trash2, RefreshCw, Link, MapPin } from 'lucide-react';
import axios from 'axios';

// --- Reusable Themed Components ---

const ProfileCard = ({ children, className = '' }) => (
  <div className={`bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg ${className}`}>
    {children}
  </div>
);

const StyledInput = ({ id, type = 'text', value, onChange, placeholder, disabled = false, required = false, minLength }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    required={required}
    minLength={minLength}
    className="w-full p-3 bg-gray-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  />
);

const StyledTextarea = ({ id, value, onChange, placeholder, disabled = false, rows = 3 }) => (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className="w-full p-3 bg-gray-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    />
);

const StyledButton = ({ children, onClick, type = 'button', disabled = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/20 transform hover:scale-105 disabled:scale-100 disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-600' : 'bg-red-600';
  const Icon = isSuccess ? CheckCircle : AlertTriangle;

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4 z-[100] animate-fade-in-down`}>
      <Icon size={24} />
      <span className="flex-1 font-medium">{message}</span>
    </div>
  );
};

// --- Profile Page Sub-Components ---

const ProfileDetails = ({ user, profileData, onProfileUpdate, showToast }) => {
  // State for all fields (both Clerk-managed and custom)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form data when profileData or user changes
  useEffect(() => {
    if (profileData) {
      // Use database data as the source of truth
      setFirstName(profileData.firstName || '');
      setLastName(profileData.lastName || '');
      setUsername(profileData.username || '');
      setBio(profileData.bio || '');
      setLocation(profileData.location || '');
      setWebsiteUrl(profileData.websiteUrl || '');
    } else if (user) {
      // Fallback to Clerk data if DB profile doesn't exist yet
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setUsername(user.username || '');
      setBio('');
      setLocation('');
      setWebsiteUrl('');
    }
  }, [profileData, user]);

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await onProfileUpdate();
      showToast('Profile refreshed successfully!', 'success');
    } catch (error) {
      console.error('Refresh error:', error);
      showToast('Failed to refresh profile', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim() || null, // Convert empty string to null for schema
        bio: bio.trim(),
        location: location.trim(),
        websiteUrl: websiteUrl.trim(),
      };
      
      console.log('Sending update data:', updateData);

      // Update Clerk first (only the fields it manages)
      await user.update({ 
        firstName: updateData.firstName, 
        lastName: updateData.lastName, 
        username: updateData.username 
      });

      // Then update our database with all fields
      // The webhook will handle syncing Clerk fields, we just need to update custom fields
      const response = await axios.patch('/api/profile', updateData);
      console.log('Profile update response:', response.data);
      
      // Refresh local state
      await onProfileUpdate();
      
      showToast('Profile updated successfully!', 'success');
      
    } catch (err) {
      console.error('Profile update error:', err);
      
      // Handle specific error cases
      let errorMessage = 'Failed to update profile.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.errors?.[0]?.message) {
        // Clerk validation error
        errorMessage = err.errors[0].message;
      } else if (err.response?.status === 409) {
        errorMessage = 'Username is already taken. Please choose a different one.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      
      // Update image in Clerk
      const updatedUser = await user.setProfileImage({ file });
      
      // The webhook should automatically sync the new imageUrl to our database
      // But we can also manually sync it to ensure consistency
      await axios.patch('/api/profile', { imageUrl: updatedUser.imageUrl });
      
      // Refresh profile data
      await onProfileUpdate();
      
      showToast('Profile picture updated successfully!', 'success');
      
    } catch (err) {
      console.error('Image upload error:', err);
      const errorMessage = err.errors?.[0]?.message || err.response?.data?.error || 'Failed to upload image.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileCard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Profile Details</h2>
          <button
            onClick={handleRefreshProfile}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh profile data"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img 
                src={user?.imageUrl || profileData?.imageUrl || `https://placehold.co/96x96/1a1a1a/ffffff?text=${(firstName?.[0] || lastName?.[0] || 'U').toUpperCase()}`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-2 border-white/20 object-cover" 
                onError={(e) => { 
                  e.target.src = `https://placehold.co/96x96/1a1a1a/ffffff?text=${(firstName?.[0] || lastName?.[0] || 'U').toUpperCase()}`; 
                }}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isSaving}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                title="Change profile picture"
              >
                <ImageIcon size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-bold">
                {user?.fullName || `${firstName} ${lastName}`.trim() || 'No name set'}
              </h3>
              <p className="text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
              {profileData ? (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Synced with database
                </p>
              ) : (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Profile not synced yet
                </p>
              )}
              {profileData?._id && (
                <p className="text-xs text-gray-500 mt-1">ID: {profileData._id}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-2">
                First Name
              </label>
              <StyledInput 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                placeholder="Enter your first name"
                disabled={isSaving}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-2">
                Last Name
              </label>
              <StyledInput 
                id="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                placeholder="Enter your last name"
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
              Username
              <span className="text-xs text-gray-500 ml-2">(optional)</span>
            </label>
            <StyledInput 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Choose a unique username"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-2">
              Bio
              <span className="text-xs text-gray-500 ml-2">(max 300 characters)</span>
            </label>
            <StyledTextarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value.slice(0, 300))} 
              placeholder="Tell us a little about yourself..."
              disabled={isSaving}
              rows={4}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {bio.length}/300 characters
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Location
              </label>
              <StyledInput 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g., San Francisco, CA"
                disabled={isSaving}
              />
            </div>
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-400 mb-2">
                <Link size={16} className="inline mr-1" />
                Website
              </label>
              <StyledInput 
                type="url" 
                id="websiteUrl" 
                value={websiteUrl} 
                onChange={(e) => setWebsiteUrl(e.target.value)} 
                placeholder="https://your-website.com"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <StyledButton type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </StyledButton>
          </div>
        </form>
      </div>
    </ProfileCard>
  );
};

const SecuritySettings = ({ user, showToast }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    
    setIsSavingPassword(true);
    
    try {
      await user.updatePassword({ currentPassword, newPassword });
      showToast('Password updated successfully!', 'success');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      console.error('Password update error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to update password.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <ProfileCard>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
        
        <form onSubmit={handleChangePassword} className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-300 border-b border-white/10 pb-2">
            Change Password
          </h3>
          
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400 mb-2">
              Current Password
            </label>
            <StyledInput 
              id="currentPassword" 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              placeholder="Enter your current password"
              disabled={isSavingPassword}
              required 
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-2">
                New Password
              </label>
              <StyledInput 
                id="newPassword" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Enter new password"
                disabled={isSavingPassword}
                required 
                minLength="8" 
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2">
                Confirm New Password
              </label>
              <StyledInput 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm new password"
                disabled={isSavingPassword}
                required 
                minLength="8" 
              />
            </div>
          </div>
          
          <div className="pt-4">
            <StyledButton type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                <>
                  <KeyRound size={20} />
                  Update Password
                </>
              )}
            </StyledButton>
          </div>
        </form>
      </div>
    </ProfileCard>
  );
};

const DangerZone = ({ showToast }) => {
  const { signOut } = useClerk();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      showToast('Please type DELETE to confirm.', 'error');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Delete from our database first
      await axios.delete('/api/profile');
      
      showToast('Account deleted successfully. You will be logged out.', 'success');
      
      // Sign out and redirect after a brief delay
      setTimeout(() => {
        signOut({ redirectUrl: '/' });
      }, 2000);
      
    } catch (err) {
      console.error('Account deletion error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to delete account.';
      showToast(errorMessage, 'error');
      setIsDeleting(false);
      setIsModalOpen(false);
      setConfirmationText('');
    }
  };

  return (
    <>
      <ProfileCard className="border-red-500/30">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-400 mb-6">
            Deleting your account is a permanent action and cannot be undone. 
            All of your data will be permanently removed from our systems.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Trash2 size={20} />
            Delete My Account
          </button>
        </div>
      </ProfileCard>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99]">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl max-w-md w-full animate-fade-in-up">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Are you absolutely sure?
            </h2>
            <p className="text-gray-400 mb-6">
              This action cannot be undone. This will permanently delete your account 
              and remove all of your data from our servers.
            </p>
            <p className="text-gray-400 mb-4">
              To confirm, please type <strong className="text-red-400">DELETE</strong> in the box below:
            </p>
            
            <StyledInput 
              id="deleteConfirm" 
              value={confirmationText} 
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              disabled={isDeleting}
            />
            
            <div className="flex justify-end gap-4 mt-8">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setConfirmationText('');
                }} 
                disabled={isDeleting}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount} 
                disabled={isDeleting || confirmationText !== 'DELETE'} 
                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Main Profile Page Component ---

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchProfileData = async () => {
    if (!user) return;
    
    setIsLoadingProfile(true);
    setProfileError(null);
    
    try {
      console.log('Fetching profile data for user:', user.id);
      const response = await axios.get('/api/profile');
      console.log('Profile data fetched:', response.data);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileError(error);
      
      // Profile might not exist yet for new users (404 is expected)
      if (error.response?.status === 404) {
        console.log('Profile not found in database - user might be new');
        setProfileData(null);
      } else {
        showToast('Failed to load profile data', 'error');
        setProfileData(null);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      console.log('User loaded, fetching profile data...');
      fetchProfileData();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen w-full bg-black text-white relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-8">
        {/* Toast Notifications */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        
        {/* Page Header */}
        <h1 className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-12">
          Account Settings
        </h1>
        
        {/* Main Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Navigation Sidebar */}
          <aside className="md:w-1/4">
            <nav className="space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isDanger = item.id === 'danger';
                
                return (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors 
                      ${isActive 
                        ? (isDanger ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white') 
                        : (isDanger ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' : 'text-gray-400 hover:bg-white/5 hover:text-white')
                      }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {isLoadingProfile ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-400">Loading profile...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'profile' && (
                  <ProfileDetails 
                    user={user} 
                    profileData={profileData}
                    onProfileUpdate={fetchProfileData}
                    showToast={showToast} 
                  />
                )}
                {activeTab === 'security' && (
                  <SecuritySettings 
                    user={user} 
                    showToast={showToast} 
                  />
                )}
                {activeTab === 'danger' && (
                  <DangerZone 
                    showToast={showToast} 
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}