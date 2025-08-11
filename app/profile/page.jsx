'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useClerk, UserProfile } from '@clerk/nextjs';
import { User, Shield, Image as ImageIcon, Save, Loader2, CheckCircle, AlertTriangle, Trash2, RefreshCw, Link, MapPin } from 'lucide-react';
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

// --- ProfileDetails Component ---
const ProfileDetails = ({ user, profileData, onProfileUpdate, showToast }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || '');
      setLastName(profileData.lastName || '');
      setUsername(profileData.username || '');
      setBio(profileData.bio || '');
      setLocation(profileData.location || '');
      setWebsiteUrl(profileData.websiteUrl || '');
    } else if (user) {
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
      const profileUpdateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim() || null,
        bio: bio.trim(),
        location: location.trim(),
        websiteUrl: websiteUrl.trim(),
      };
      
      console.log('Sending profile update:', profileUpdateData);

      const response = await axios.patch('/api/profile', profileUpdateData);
      console.log('Profile update response:', response.data);
      
      await onProfileUpdate();
      showToast('Profile updated successfully!', 'success');
      
    } catch (err) {
      console.error('Profile update error:', err);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 409) {
        errorMessage = 'Username already taken. Please choose another.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || 'Invalid data provided.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      await user.setProfileImage({ file });
      
      setTimeout(() => {
        onProfileUpdate();
      }, 2000);
      
      showToast('Profile picture updated! Syncing...', 'success');
      
    } catch (err) {
      console.error('Image upload error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to upload image.';
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
                src={user?.imageUrl || profileData?.imageUrl || `https://placehold.co/96x96/1a1a1a/ffffff?text=${(firstName?.[0] || 'U').toUpperCase()}`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-2 border-white/20 object-cover" 
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
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle size={12} /> Synced with database</p>
              ) : (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1"><AlertTriangle size={12} /> Profile not synced yet</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
              <StyledInput 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                placeholder="Enter your first name" 
                disabled={isSaving}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
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
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">Username <span className="text-xs text-gray-500 ml-2">(optional)</span></label>
            <StyledInput 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Choose a unique username" 
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-2">Bio <span className="text-xs text-gray-500 ml-2">(max 300 characters)</span></label>
            <StyledTextarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value.slice(0, 300))} 
              placeholder="Tell us a little about yourself..." 
              disabled={isSaving} 
              rows={4}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{bio.length}/300 characters</div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-2">
                <MapPin size={16} className="inline mr-1" /> Location
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
                <Link size={16} className="inline mr-1" /> Website
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

// --- UPDATED SecuritySettings Component with Clerk's UserProfile ---
const SecuritySettings = ({ showToast }) => {
  return (
    <ProfileCard>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">Security & Account Settings</h2>
        
        {/* Clerk's built-in UserProfile component */}
        <div className="clerk-user-profile-wrapper">
          <UserProfile 
            appearance={{
              elements: {
                // Root styling
                rootBox: "w-full",
                card: "bg-transparent border-0 shadow-none p-0",
                
                // Navigation styling
                navbar: "bg-gray-800/30 border border-white/10 rounded-xl mb-6 p-1",
                navbarButton: "text-gray-300 hover:text-white hover:bg-white/10 rounded-lg px-4 py-2 transition-all duration-200",
                navbarButtonActive: "text-white bg-blue-600/30 shadow-lg shadow-blue-500/10",
                
                // Page content styling
                pageScrollBox: "bg-transparent",
                page: "bg-transparent text-white p-0",
                
                // Form elements
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-lg px-6 py-3 font-medium transition-all duration-200 transform hover:scale-105",
                formButtonSecondary: "bg-gray-700 hover:bg-gray-600 text-white border border-white/10 rounded-lg px-6 py-3 font-medium transition-all duration-200",
                formFieldInput: "bg-gray-800/50 border border-white/10 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400",
                formFieldLabel: "text-gray-300 font-medium mb-2",
                formFieldHintText: "text-gray-400 text-sm",
                formFieldSuccessText: "text-green-400 text-sm",
                formFieldErrorText: "text-red-400 text-sm",
                
                // Headers and text
                formHeaderTitle: "text-white text-xl font-bold mb-2",
                formHeaderSubtitle: "text-gray-400 mb-6",
                profileSectionTitle: "text-white text-lg font-semibold mb-4",
                profileSectionContent: "text-gray-300",
                
                // Identity preview
                identityPreviewText: "text-gray-300",
                identityPreviewEditButton: "text-blue-400 hover:text-blue-300 font-medium",
                
                // Badges and tags
                badge: "bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full px-3 py-1 text-sm font-medium",
                tag: "bg-gray-700/50 text-gray-300 border border-white/10 rounded-lg px-3 py-1 text-sm",
                
                // Dividers and borders
                dividerLine: "bg-white/10",
                dividerText: "text-gray-400",
                
                // Alerts and notifications
                alert: "bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 mb-4",
                alertText: "text-red-300",
                
                // Modal styling
                modalContent: "bg-gray-900/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl",
                modalCloseButton: "text-gray-400 hover:text-white transition-colors",
                modalBackdrop: "bg-black/60 backdrop-blur-sm",
                
                // Accordion elements
                accordionTriggerButton: "text-gray-300 hover:text-white bg-gray-800/30 border border-white/10 rounded-lg p-4 w-full text-left font-medium transition-all duration-200",
                accordionContent: "text-gray-400 p-4 bg-gray-900/20 rounded-lg mt-2",
                
                // File upload
                fileDropAreaBox: "bg-gray-800/30 border-2 border-dashed border-white/20 rounded-xl p-8 text-center transition-all duration-200 hover:border-blue-500/50",
                fileDropAreaButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium transition-all duration-200",
                fileDropAreaIcon: "text-gray-400 mb-4",
                fileDropAreaText: "text-gray-300",
                
                // Loading and skeleton
                spinner: "text-blue-500",
                
                // Tables (for sessions, etc.)
                table: "w-full border-collapse",
                tableHead: "bg-gray-800/30 border-b border-white/10",
                tableHeadCell: "text-gray-300 font-medium p-4 text-left",
                tableBody: "text-gray-300",
                tableRow: "border-b border-white/5 hover:bg-white/5 transition-colors",
                tableCell: "p-4",
                
                // Two-factor authentication
                otpCodeFieldInput: "bg-gray-800/50 border border-white/10 text-white rounded-lg text-center font-mono text-lg w-12 h-12 focus:ring-2 focus:ring-blue-500",
                
                // Social connections
                socialButtonsBlockButton: "bg-gray-800/50 border border-white/10 hover:bg-gray-700/50 text-white rounded-lg p-4 transition-all duration-200 flex items-center gap-3",
                socialButtonsBlockButtonText: "text-white font-medium",
                
                // Breadcrumbs
                breadcrumbsItem: "text-gray-400",
                breadcrumbsItemDivider: "text-gray-500",
                breadcrumbsItemCurrent: "text-white font-medium",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                showOptionalFields: true,
              },
              variables: {
                colorPrimary: "#2563eb",
                colorSuccess: "#10b981",
                colorWarning: "#f59e0b",
                colorDanger: "#ef4444",
                colorNeutral: "#6b7280",
                fontFamily: "inherit",
                borderRadius: "0.75rem",
              }
            }}
            routing="hash"
            path="/security"
          />
        </div>
      </div>
    </ProfileCard>
  );
};

// --- DangerZone Component ---
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
      const response = await axios.delete('/api/profile');
      
      if (response.data.success) {
        showToast('Account deleted successfully. You will be logged out.', 'success');
        
        setTimeout(() => {
          signOut({ redirectUrl: '/' });
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Failed to delete account');
      }
      
    } catch (err) {
      console.error('Account deletion error:', err);
      
      let errorMessage = 'Failed to delete account. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
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
            All of your data will be permanently removed from both our database and authentication system.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Trash2 size={20} /> Delete My Account
          </button>
        </div>
      </ProfileCard>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99]">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl max-w-md w-full animate-fade-in-up">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Are you absolutely sure?</h2>
            <p className="text-gray-400 mb-4">
              This will permanently delete your account and remove all your data from both our database and authentication system.
            </p>
            <p className="text-gray-400 mb-4">
              To confirm, type <strong className="text-red-400">DELETE</strong> below:
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchProfileData = async () => {
    if (!user) return;
    setIsLoadingProfile(true);
    try {
      console.log('Fetching profile data for user:', user.id);
      const response = await axios.get('/api/profile');
      console.log('Profile data fetched:', response.data);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        console.log('Profile not found in database. This may be a new user.');
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
    <>
      {/* Custom CSS styles for Clerk components */}
      <style jsx global>{`
        /* Clerk UserProfile custom styling */
        .clerk-user-profile-wrapper .cl-userProfile-root {
          width: 100% !important;
        }
        
        .clerk-user-profile-wrapper .cl-userProfile-navbar {
          background: rgba(55, 65, 81, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.75rem !important;
          margin-bottom: 1.5rem !important;
          padding: 0.25rem !important;
        }
        
        .clerk-user-profile-wrapper .cl-userProfile-page {
          background: transparent !important;
          color: white !important;
          padding: 0 !important;
        }
        
        .clerk-user-profile-wrapper .cl-formFieldInput {
          background: rgba(55, 65, 81, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem 1rem !important;
        }
        
        .clerk-user-profile-wrapper .cl-formFieldInput:focus {
          border-color: rgb(59, 130, 246) !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
        
        .clerk-user-profile-wrapper .cl-formButtonPrimary {
          background: rgb(37, 99, 235) !important;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2) !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem 1.5rem !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
          transform: scale(1) !important;
        }
        
        .clerk-user-profile-wrapper .cl-formButtonPrimary:hover {
          background: rgb(29, 78, 216) !important;
          transform: scale(1.05) !important;
        }
        
        .clerk-user-profile-wrapper .cl-formButtonSecondary {
          background: rgb(55, 65, 81) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem 1.5rem !important;
        }
        
        .clerk-user-profile-wrapper .cl-formButtonSecondary:hover {
          background: rgb(75, 85, 99) !important;
        }
        
        .clerk-user-profile-wrapper .cl-navbarButton {
          color: rgb(209, 213, 219) !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 1rem !important;
          transition: all 0.2s !important;
        }
        
        .clerk-user-profile-wrapper .cl-navbarButton:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .clerk-user-profile-wrapper .cl-navbarButton[data-active] {
          color: white !important;
          background: rgba(37, 99, 235, 0.3) !important;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1) !important;
        }
        
        .clerk-user-profile-wrapper .cl-formHeaderTitle {
          color: white !important;
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          margin-bottom: 0.5rem !important;
        }
        
        .clerk-user-profile-wrapper .cl-formHeaderSubtitle {
          color: rgb(156, 163, 175) !important;
          margin-bottom: 1.5rem !important;
        }
        
        .clerk-user-profile-wrapper .cl-formFieldLabel {
          color: rgb(209, 213, 219) !important;
          font-weight: 500 !important;
          margin-bottom: 0.5rem !important;
        }
        
        .clerk-user-profile-wrapper .cl-identityPreviewText {
          color: rgb(209, 213, 219) !important;
        }
        
        .clerk-user-profile-wrapper .cl-identityPreviewEditButton {
          color: rgb(96, 165, 250) !important;
          font-weight: 500 !important;
        }
        
        .clerk-user-profile-wrapper .cl-identityPreviewEditButton:hover {
          color: rgb(147, 197, 253) !important;
        }
        
        .clerk-user-profile-wrapper .cl-badge {
          background: rgba(37, 99, 235, 0.2) !important;
          color: rgb(96, 165, 250) !important;
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
          border-radius: 9999px !important;
          padding: 0.25rem 0.75rem !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
        }
        
        .clerk-user-profile-wrapper .cl-dividerLine {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .clerk-user-profile-wrapper .cl-alert {
          background: rgba(239, 68, 68, 0.1) !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
          color: rgb(248, 113, 113) !important;
          border-radius: 0.5rem !important;
          padding: 1rem !important;
          margin-bottom: 1rem !important;
        }
        
        .clerk-user-profile-wrapper .cl-modalContent {
          background: rgba(17, 24, 39, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
          backdrop-filter: blur(16px) !important;
        }
        
        .clerk-user-profile-wrapper .cl-modalBackdrop {
          background: rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(4px) !important;
        }
        
        .clerk-user-profile-wrapper .cl-otpCodeFieldInput {
          background: rgba(55, 65, 81, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 0.5rem !important;
          text-align: center !important;
          font-family: monospace !important;
          font-size: 1.125rem !important;
          width: 3rem !important;
          height: 3rem !important;
        }
        
        .clerk-user-profile-wrapper .cl-otpCodeFieldInput:focus {
          border-color: rgb(59, 130, 246) !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
        
        .clerk-user-profile-wrapper .cl-socialButtonsBlockButton {
          background: rgba(55, 65, 81, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 0.5rem !important;
          padding: 1rem !important;
          transition: all 0.2s !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
        }
        
        .clerk-user-profile-wrapper .cl-socialButtonsBlockButton:hover {
          background: rgba(75, 85, 99, 0.5) !important;
        }
        
        .clerk-user-profile-wrapper .cl-tableHead {
          background: rgba(55, 65, 81, 0.3) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .clerk-user-profile-wrapper .cl-tableHeadCell {
          color: rgb(209, 213, 219) !important;
          font-weight: 500 !important;
          padding: 1rem !important;
          text-align: left !important;
        }
        
        .clerk-user-profile-wrapper .cl-tableRow {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: background-color 0.2s !important;
        }
        
        .clerk-user-profile-wrapper .cl-tableRow:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        
        .clerk-user-profile-wrapper .cl-tableCell {
          color: rgb(209, 213, 219) !important;
          padding: 1rem !important;
        }
        
        /* Scrollbar styling for better integration */
        .clerk-user-profile-wrapper ::-webkit-scrollbar {
          width: 6px;
        }
        
        .clerk-user-profile-wrapper ::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        
        .clerk-user-profile-wrapper ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .clerk-user-profile-wrapper ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>

      <div className="min-h-screen w-full bg-black text-white relative">
        <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-8">
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
          <h1 className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-12">Account Settings</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
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

            <main className="flex-1">
              {isLoadingProfile ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  {activeTab === 'profile' && <ProfileDetails user={user} profileData={profileData} onProfileUpdate={fetchProfileData} showToast={showToast} />}
                  {activeTab === 'security' && <SecuritySettings showToast={showToast} />}
                  {activeTab === 'danger' && <DangerZone showToast={showToast} />}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
