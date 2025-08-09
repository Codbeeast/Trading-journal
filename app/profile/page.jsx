'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { User, Shield, Image as ImageIcon, KeyRound, Save, Loader2, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import axios from 'axios';

// --- Reusable Themed Components ---

const ProfileCard = ({ children, className = '' }) => (
  <div className={`bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg ${className}`}>
    {children}
  </div>
);

const StyledInput = ({ id, type = 'text', value, onChange, placeholder, disabled = false }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className="w-full p-3 bg-gray-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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

const ProfileDetails = ({ user, showToast }) => {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [username, setUsername] = useState(user.username || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Perform both updates in parallel for better performance
      await Promise.all([
        user.update({ firstName, lastName, username }),
        axios.patch('/api/profile', { firstName, lastName, username, imageUrl: user.imageUrl })
      ]);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast(err.errors?.[0]?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const updatedImage = await user.setProfileImage({ file });
      // Sync the new image URL with our backend
      await axios.patch('/api/profile', { imageUrl: updatedImage.imageUrl });
      showToast('Profile picture updated!', 'success');
    } catch (err) {
      console.error("Error uploading image:", err);
      showToast(err.errors?.[0]?.message || 'Failed to upload image.', 'error');
    }
  };

  return (
    <ProfileCard>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">Profile Details</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src={user.imageUrl} alt="Profile" className="w-24 h-24 rounded-full border-2 border-white/20" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                <ImageIcon size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-bold">{user.fullName}</h3>
              <p className="text-gray-400">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
              <StyledInput id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
              <StyledInput id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">Username</label>
            <StyledInput id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="pt-4">
            <StyledButton type="submit" disabled={isSaving}>
              {isSaving ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : <><Save size={20} /> Save Changes</>}
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
    setIsSavingPassword(true);
    try {
      await user.updatePassword({ currentPassword, newPassword });
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Error updating password:", err);
      showToast(err.errors?.[0]?.message || 'Failed to update password.', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <ProfileCard>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">Security</h2>
        <form onSubmit={handleChangePassword} className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-300 border-b border-white/10 pb-2">Change Password</h3>
          <div>
            <label htmlFor="currentPassword"  className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
            <StyledInput id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="newPassword"  className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
              <StyledInput id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label htmlFor="confirmPassword"  className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
              <StyledInput id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
           <div className="pt-4">
            <StyledButton type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? <><Loader2 className="animate-spin" size={20} /> Updating...</> : <><KeyRound size={20} /> Update Password</>}
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
            await axios.delete('/api/profile');
            showToast('Account deleted successfully. You will be logged out.', 'success');
            setTimeout(() => signOut({ redirectUrl: '/' }), 2000);
        } catch (err) {
            console.error("Error deleting account:", err);
            showToast(err.response?.data?.message || 'Failed to delete account.', 'error');
            setIsDeleting(false);
        }
    };

    return (
        <>
            <ProfileCard className="border-red-500/30">
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
                    <p className="text-gray-400 mb-6">
                        Deleting your account is a permanent action and cannot be undone. All of your data, including strategies and trades, will be permanently removed.
                    </p>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                        <Trash2 size={20} /> Delete My Account
                    </button>
                </div>
            </ProfileCard>
            
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99]">
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl max-w-md w-full animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Are you absolutely sure?</h2>
                        <p className="text-gray-400 mb-6">This action cannot be undone. To confirm, please type <strong className="text-red-400">DELETE</strong> in the box below.</p>
                        <StyledInput 
                            id="deleteConfirm" 
                            value={confirmationText} 
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                        />
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all">Cancel</button>
                            <button 
                                onClick={handleDeleteAccount} 
                                disabled={isDeleting || confirmationText !== 'DELETE'}
                                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-all"
                            >
                                {isDeleting ? <><Loader2 className="animate-spin" size={20} /> Deleting...</> : 'Delete Account'}
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen w-full bg-black text-white relative">
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-8">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <h1 className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-12">Account Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Navigation */}
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
                )
              })}
            </nav>
          </aside>

          {/* Right Content */}
          <main className="flex-1">
            {activeTab === 'profile' && <ProfileDetails user={user} showToast={showToast} />}
            {activeTab === 'security' && <SecuritySettings user={user} showToast={showToast} />}
            {activeTab === 'danger' && <DangerZone showToast={showToast} />}
          </main>
        </div>
      </div>
    </div>
  );
}
