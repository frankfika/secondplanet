
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, 
  Map as MapIcon, 
  MessageSquare, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  LogOut, 
  Menu, 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Wallet, 
  ShieldCheck, 
  TrendingUp, 
  FileText,
  UserPlus,
  Globe,
  Briefcase,
  Coffee,
  Camera,
  Music,
  ChevronRight,
  ChevronDown,
  User,
  Calendar,
  Clock,
  Video,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Lock,
  Eye,
  EyeOff,
  Gavel,
  RefreshCw,
  Edit2,
  Save,
  Check,
  Megaphone,
  AlertCircle
} from 'lucide-react';

// --- Types ---

interface Village {
  id: string;
  name: string;
  category: string; // 'Interest' | 'Professional' | 'Region' | 'Lifestyle'
  description: string;
  announcement?: string; // New: Community Announcement
  members: number;
  online: number;
  coverImage: string;
  icon: string;
  currencyName: string;
  currencySymbol: string;
  isPrivate: boolean; // Hidden/Secret
  inviteCode?: string; // Code required if private
  isSemiPrivate?: boolean; // Request to join
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  tags?: string[];
}

interface VillageEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'Online' | 'Offline';
  image: string;
  organizer: string;
  attendees: number;
}

interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showSocials: boolean;
}

interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  joinedAt: string;
  email: string;
  phone?: string;
  location?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  privacy: PrivacySettings;
}

// --- Identity Types ---
interface LocalProfile {
  nickname: string;
  bio: string;
  avatar?: string;
  role: string;
  joinedAt: string;
  privacy: PrivacySettings;
}

interface UserProfile {
  id: string;
  global: {
    name: string;
    email: string;
    avatar: string;
    id: string;
  };
  // Map villageId -> LocalProfile
  local: Record<string, LocalProfile>;
}

// --- Mock Data ---

const INITIAL_VILLAGES: Village[] = [
  {
    id: 'v1',
    name: 'Pixel Pioneers',
    category: 'Design',
    description: 'A community for digital artists and UI designers to share work and critique.',
    announcement: '🎨 Monthly Design Challenge is live! Theme: "Cyberpunk 2077". Submission deadline is Oct 30th.',
    members: 1240,
    online: 86,
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80',
    icon: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=100&q=80',
    currencyName: 'Pixels',
    currencySymbol: 'PX',
    isPrivate: false,
    inviteCode: 'PIXEL2024'
  },
  {
    id: 'v2',
    name: 'Green Thumb',
    category: 'Lifestyle',
    description: 'Urban gardening enthusiasts sharing tips on growing food in small spaces.',
    announcement: 'Winter is coming! Check the guide on protecting your balcony plants from frost.',
    members: 850,
    online: 42,
    coverImage: 'https://images.unsplash.com/photo-1416872927374-d3c74117094e?auto=format&fit=crop&w=1000&q=80',
    icon: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&w=100&q=80',
    currencyName: 'Seeds',
    currencySymbol: '🌱',
    isPrivate: false,
    inviteCode: 'GROW2024'
  },
  {
    id: 'v3',
    name: 'Rustaceans',
    category: 'Technology',
    description: 'Deep dive into Rust programming language. Systems engineering discussions.',
    announcement: 'Rust 1.75 release party in Voice Channel tonight!',
    members: 3400,
    online: 210,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    icon: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=100&q=80',
    currencyName: 'Crabs',
    currencySymbol: '🦀',
    isPrivate: false,
    inviteCode: 'RUSTACEAN'
  },
  {
    id: 'v4',
    name: 'Secret Society',
    category: 'Mystery',
    description: 'You should not be here unless you know the password.',
    announcement: 'The owl flies at midnight.',
    members: 12,
    online: 1,
    coverImage: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=1000&q=80',
    icon: 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&w=100&q=80',
    currencyName: 'Keys',
    currencySymbol: '🗝️',
    isPrivate: true,
    inviteCode: 'PUZZLE2024'
  }
];

const MOCK_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Alex Chen',
    role: 'Chief',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    status: 'Building something cool',
    joinedAt: '2023-01-15',
    email: 'alex.chen@example.com',
    location: 'San Francisco, CA',
    socials: { twitter: '@alexc', website: 'alex.dev' },
    privacy: { showEmail: true, showPhone: false, showLocation: true, showSocials: true }
  },
  {
    id: 'm2',
    name: 'Sarah Jones',
    role: 'Core Member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    status: 'Gardening 🌻',
    joinedAt: '2023-03-10',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 123-4567',
    privacy: { showEmail: false, showPhone: false, showLocation: true, showSocials: false }
  },
  {
    id: 'm3',
    name: 'Marcus Johnson',
    role: 'Villager',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    status: 'Learning Rust',
    joinedAt: '2023-05-22',
    email: 'marcus.j@example.com',
    socials: { linkedin: 'marcus-j' },
    privacy: { showEmail: true, showPhone: false, showLocation: false, showSocials: true }
  },
  {
    id: 'm4',
    name: 'Emily Davis',
    role: 'Villager',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    status: 'Design is life',
    joinedAt: '2023-06-01',
    email: 'emily.d@example.com',
    privacy: { showEmail: false, showPhone: false, showLocation: false, showSocials: false }
  }
];

const VILLAGE_EVENTS: VillageEvent[] = [
  {
    id: 'e1',
    title: 'Weekly Design Critique',
    date: 'Oct 24',
    time: '19:00',
    location: 'Voice Channel 1',
    type: 'Online',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    organizer: 'Alex Chen',
    attendees: 24
  },
  {
    id: 'e2',
    title: 'Local Photowalk: Downtown',
    date: 'Oct 28',
    time: '14:00',
    location: 'Central Plaza',
    type: 'Offline',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80',
    organizer: 'Sarah Jones',
    attendees: 12
  }
];

const POSTS: Post[] = [
  {
    id: '1',
    author: {
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      role: 'Chief'
    },
    content: 'Just finished the new branding guidelines for our village! Let me know what you think about the color palette. 🎨',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    likes: 45,
    comments: 12,
    timestamp: '2h ago',
    tags: ['design', 'update']
  },
  {
    id: '2',
    author: {
      name: 'Sarah Jones',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      role: 'Villager'
    },
    content: 'Does anyone have experience with hydroponics? I\'m thinking of starting a small setup in my apartment.',
    likes: 28,
    comments: 8,
    timestamp: '4h ago',
    tags: ['gardening', 'help']
  }
];

// --- Components ---

const EventCard: React.FC<{ event: VillageEvent }> = ({ event }) => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="h-32 bg-gray-200 relative">
      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
        {event.type === 'Online' ? <Video size={12} /> : <MapIcon size={12} />}
        {event.type}
      </div>
      <div className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
        {event.date}
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{event.title}</h3>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <Clock size={12} />
        <span>{event.time}</span>
        <span>•</span>
        <span className="truncate max-w-[100px]">{event.location}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-primary">{event.attendees}</span> attending
        </div>
        <button className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors">
          RSVP
        </button>
      </div>
    </div>
  </div>
);

const FeedPost: React.FC<{ post: Post }> = ({ post }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 animate-fade-in">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800 text-sm">{post.author.name}</h3>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{post.author.role}</span>
          </div>
          <p className="text-xs text-gray-400">{post.timestamp}</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600">
        <Settings size={16} />
      </button>
    </div>
    
    <p className="text-gray-700 text-sm mb-3 leading-relaxed">{post.content}</p>
    
    {post.image && (
      <img src={post.image} alt="Post content" className="w-full h-48 object-cover rounded-lg mb-3" />
    )}
    
    <div className="flex items-center gap-2 mb-3">
      {post.tags?.map(tag => (
        <span key={tag} className="text-xs text-primary font-medium">#{tag}</span>
      ))}
    </div>
    
    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors text-sm">
          <Heart size={18} />
          <span>{post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm">
          <MessageCircle size={18} />
          <span>{post.comments}</span>
        </button>
      </div>
      <button className="text-gray-400 hover:text-gray-600">
        <Share2 size={18} />
      </button>
    </div>
  </div>
);

const ContactCardModal: React.FC<{ member: Member | null, onClose: () => void }> = ({ member, onClose }) => {
  const [requestSent, setRequestSent] = useState(false);
  
  useEffect(() => {
    if (member) setRequestSent(false);
  }, [member]);

  if (!member) return null;

  const handleRequest = () => {
    setRequestSent(true);
    // Logic to send request would go here
  };

  const hasHiddenInfo = !member.privacy.showEmail || 
                        (!member.privacy.showPhone && member.phone) || 
                        !member.privacy.showLocation || 
                        !member.privacy.showSocials;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="h-24 bg-gradient-to-r from-primary to-primary/60 relative">
          <button onClick={onClose} className="absolute top-2 right-2 p-1 bg-black/20 text-white rounded-full hover:bg-black/30">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-6 -mt-12 text-center">
          <img src={member.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto mb-3 object-cover" />
          <h2 className="text-xl font-bold text-gray-800">{member.name}</h2>
          <p className="text-primary font-medium text-sm mb-1">{member.role}</p>
          <p className="text-gray-500 text-xs mb-6">{member.status}</p>
          
          <div className="space-y-3 text-left">
            {member.privacy.showEmail ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-white rounded-full text-gray-600 shadow-sm"><Mail size={16} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Email</p>
                  <p className="text-sm text-gray-800 font-medium break-all">{member.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                <div className="p-2 bg-white rounded-full text-gray-400 shadow-sm"><Lock size={16} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Email</p>
                  <p className="text-sm text-gray-500 italic">Private</p>
                </div>
              </div>
            )}
            
            {member.phone && (
              member.privacy.showPhone ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="p-2 bg-white rounded-full text-gray-600 shadow-sm"><Phone size={16} /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phone</p>
                    <p className="text-sm text-gray-800 font-medium">{member.phone}</p>
                  </div>
                </div>
              ) : (
                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="p-2 bg-white rounded-full text-gray-400 shadow-sm"><Lock size={16} /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phone</p>
                    <p className="text-sm text-gray-500 italic">Private</p>
                  </div>
                </div>
              )
            )}

            {member.location && (
               member.privacy.showLocation ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="p-2 bg-white rounded-full text-gray-600 shadow-sm"><MapIcon size={16} /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Location</p>
                    <p className="text-sm text-gray-800 font-medium">{member.location}</p>
                  </div>
                </div>
               ) : null
            )}

            {member.privacy.showSocials && (member.socials?.linkedin || member.socials?.twitter || member.socials?.website) && (
              <div className="flex justify-center gap-4 pt-2">
                 {member.socials.website && (
                  <button className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
                    <Globe size={20} />
                  </button>
                 )}
                 {member.socials.linkedin && (
                  <button className="p-2 text-gray-500 hover:text-[#0077b5] hover:bg-[#0077b5]/5 rounded-full transition-colors">
                    <Linkedin size={20} />
                  </button>
                 )}
                 {member.socials.twitter && (
                  <button className="p-2 text-gray-500 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/5 rounded-full transition-colors">
                    <Twitter size={20} />
                  </button>
                 )}
              </div>
            )}
          </div>
          
          {hasHiddenInfo && (
            <button 
              onClick={handleRequest}
              disabled={requestSent}
              className={`w-full mt-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm text-sm ${
                requestSent 
                  ? 'bg-green-100 text-green-700 cursor-default' 
                  : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
              }`}
            >
              {requestSent ? 'Request Sent' : 'Request Contact Details'}
            </button>
          )}

          {!hasHiddenInfo && (
            <button className="w-full mt-6 bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-95 transform">
              Save Contact
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PassportModal = ({ 
  isOpen, 
  onClose, 
  userProfile, 
  activeVillage,
  onUpdateLocalProfile
}: { 
  isOpen: boolean, 
  onClose: () => void,
  userProfile: UserProfile,
  activeVillage: Village | undefined,
  onUpdateLocalProfile: (villageId: string, updates: Partial<LocalProfile>) => void
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'global'>('local');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    nickname: '', 
    bio: '',
    privacy: { showEmail: false, showPhone: false, showLocation: false, showSocials: false }
  });

  // Get current local profile or use defaults
  const currentLocalProfile = activeVillage 
    ? (userProfile.local[activeVillage.id] || { 
        nickname: userProfile.global.name, 
        bio: 'Ready to explore', 
        role: 'Villager',
        joinedAt: new Date().toISOString().split('T')[0],
        privacy: { showEmail: true, showPhone: false, showLocation: true, showSocials: true }
      })
    : null;

  useEffect(() => {
    // Reset tab when modal opens: If inside a village, show local first. If home, show global.
    setActiveTab(activeVillage ? 'local' : 'global');
    setIsEditing(false);
  }, [isOpen, activeVillage]);

  useEffect(() => {
    if (currentLocalProfile) {
      setEditForm({ 
        nickname: currentLocalProfile.nickname, 
        bio: currentLocalProfile.bio,
        privacy: currentLocalProfile.privacy
      });
    }
  }, [currentLocalProfile]);

  const handleSaveLocal = () => {
    if (activeVillage) {
      onUpdateLocalProfile(activeVillage.id, {
        nickname: editForm.nickname,
        bio: editForm.bio,
        privacy: editForm.privacy
      });
      setIsEditing(false);
    }
  };

  const togglePrivacy = (key: keyof PrivacySettings) => {
    setEditForm(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1a1b2e] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative text-white border border-white/10 flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X size={24} />
        </button>
        
        {/* Header with Tabs */}
        <div className="pt-6 px-6 bg-gradient-to-b from-primary/20 to-transparent">
          <div className="flex items-center justify-center gap-1 mb-6 bg-black/20 p-1 rounded-xl self-center w-fit mx-auto">
             {activeVillage && (
               <button 
                onClick={() => setActiveTab('local')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'local' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
               >
                 Local Visa
               </button>
             )}
             <button 
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'global' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
             >
               Global Passport
             </button>
          </div>

          <div className="text-center pb-6">
             <div className="relative inline-block">
               <img 
                src={userProfile.global.avatar} 
                className="w-24 h-24 rounded-2xl border-4 border-white/10 object-cover shadow-2xl mx-auto" 
               />
               {activeTab === 'local' && activeVillage && (
                 <div className="absolute -bottom-2 -right-2 bg-secondary border-2 border-[#1a1b2e] p-1.5 rounded-lg">
                   <img src={activeVillage.icon} className="w-6 h-6 rounded" />
                 </div>
               )}
             </div>
             
             {activeTab === 'local' && activeVillage && currentLocalProfile ? (
                <div className="mt-4 animate-fade-in">
                  {isEditing ? (
                    <div className="space-y-3 max-w-[200px] mx-auto">
                      <input 
                        value={editForm.nickname}
                        onChange={e => setEditForm({...editForm, nickname: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-center text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Nickname"
                      />
                      <input 
                        value={editForm.bio}
                        onChange={e => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-center text-xs text-gray-300 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Short bio"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                        {currentLocalProfile.nickname}
                        <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white transition-colors">
                          <Edit2 size={16} />
                        </button>
                      </h2>
                      <p className="text-primary text-sm font-medium">{currentLocalProfile.role}</p>
                      <p className="text-gray-400 text-sm mt-2 italic">"{currentLocalProfile.bio}"</p>
                    </>
                  )}
                </div>
             ) : (
                <div className="mt-4 animate-fade-in">
                  <h2 className="text-2xl font-bold">{userProfile.global.name}</h2>
                  <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
                    <Globe size={14} /> Global Citizen
                  </p>
                  <div className="mt-2 text-xs bg-white/10 px-2 py-1 rounded border border-white/10 inline-block">
                    ID: {userProfile.global.id}
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 bg-[#131422] flex-1 overflow-y-auto">
           {activeTab === 'local' && activeVillage && (
             <div className="space-y-4 animate-slide-up">
                {isEditing && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-4">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Privacy Settings</h3>
                     <div className="space-y-2">
                       {[
                         { label: 'Email Address', key: 'showEmail' },
                         { label: 'Phone Number', key: 'showPhone' },
                         { label: 'Location', key: 'showLocation' },
                         { label: 'Social Media', key: 'showSocials' },
                       ].map((item) => (
                         <div key={item.key} className="flex items-center justify-between text-sm text-gray-300">
                           <span>{item.label}</span>
                           <button 
                             onClick={() => togglePrivacy(item.key as keyof PrivacySettings)}
                             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                               editForm.privacy[item.key as keyof PrivacySettings] ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                             }`}
                           >
                             {editForm.privacy[item.key as keyof PrivacySettings] ? <Eye size={14} /> : <EyeOff size={14} />}
                             <span className="text-xs font-bold">{editForm.privacy[item.key as keyof PrivacySettings] ? 'Visible' : 'Hidden'}</span>
                           </button>
                         </div>
                       ))}
                     </div>
                     <button 
                        onClick={handleSaveLocal}
                        className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-bold transition-colors mt-4"
                      >
                        <Check size={16} /> Save Privacy Settings
                      </button>
                  </div>
                )}

                {!isEditing && (
                  <>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Village Assets</h3>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl text-primary">
                            {activeVillage.currencySymbol}
                          </div>
                          <div>
                            <p className="font-bold text-white">{activeVillage.currencyName}</p>
                            <p className="text-xs text-gray-400">Current Balance</p>
                          </div>
                        </div>
                        <span className="text-2xl font-mono font-bold text-white">1,240</span>
                     </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Citizenship</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-400 text-xs">Joined</div>
                          <div className="font-medium text-white">{currentLocalProfile?.joinedAt}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Reputation</div>
                          <div className="font-medium text-white flex items-center gap-1">
                            <ShieldCheck size={14} className="text-green-500" /> Good
                          </div>
                        </div>
                     </div>
                  </div>
                  </>
                )}
             </div>
           )}

           {activeTab === 'global' && (
             <div className="space-y-4 animate-slide-up">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Assets</h3>
                <div className="space-y-2">
                  {[
                    { symbol: 'PX', name: 'Pixels', amount: '1,240', village: 'Pixel Pioneers' },
                    { symbol: '🌱', name: 'Seeds', amount: '450', village: 'Green Thumb' },
                    { symbol: '🦀', name: 'Crabs', amount: '8,000', village: 'Rustaceans' }
                  ].map((asset, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center text-sm">
                          {asset.symbol}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{asset.name}</p>
                          <p className="text-[10px] text-gray-500">{asset.village}</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-bold text-gray-300">{asset.amount}</span>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>
        
        <div className="p-4 bg-black/20 text-center text-[10px] text-gray-600 font-mono border-t border-white/5">
          {activeTab === 'local' ? `VALID FOR ${activeVillage?.name.toUpperCase()}` : 'UNIVERSAL DIGITAL IDENTITY'}
        </div>
      </div>
    </div>
  );
};

// --- Mobile Components ---

const MobileHeader = ({ 
    title, 
    icon, 
    onMenuClick,
    onProfileClick 
}: { 
    title: string, 
    icon?: string, 
    onMenuClick: () => void,
    onProfileClick: () => void 
}) => {
    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 h-14 z-[60] flex items-center justify-between px-4 shadow-sm">
            <button onClick={onMenuClick} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Menu size={24} />
            </button>
            <button 
                onClick={onMenuClick}
                className="flex items-center gap-2 font-bold text-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all active:scale-95 transform border border-transparent hover:border-gray-200"
            >
                {icon && <img src={icon} className="w-6 h-6 rounded-md object-cover shadow-sm" />}
                <span className="truncate max-w-[150px]">{title}</span>
                <ChevronDown size={16} className="text-gray-400" />
            </button>
            <button onClick={onProfileClick} className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <User size={24} />
            </button>
        </div>
    );
}

const MobileBottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const tabs = [
    { id: 'square', icon: MessageSquare, label: 'Square' },
    { id: 'citizens', icon: Users, label: 'Citizens' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'townhall', icon: Gavel, label: 'Town Hall' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pb-safe pt-2 z-[60] flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-colors ${
            activeTab === tab.id ? 'text-primary bg-primary/5' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const VillageSwitcherDrawer = ({ 
  isOpen, 
  onClose, 
  villages, 
  activeVillageId, 
  onSelectVillage,
  onGoHome,
  onCreateClick
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  villages: Village[], 
  activeVillageId: string | null, 
  onSelectVillage: (id: string) => void,
  onGoHome: () => void,
  onCreateClick: () => void
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-secondary text-white shadow-2xl animate-slide-right flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Globe className="text-primary" /> Global Village
          </h2>
          
          <button 
            onClick={() => { onGoHome(); onClose(); }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl mb-6 transition-colors ${
              !activeVillageId ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/10 text-gray-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${!activeVillageId ? 'bg-white/20' : 'bg-white/5'}`}>
              <Search size={20} />
            </div>
            <span className="font-medium">Discover</span>
          </button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">My Villages</div>
          <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {villages.map(village => (
              <button
                key={village.id}
                onClick={() => { onSelectVillage(village.id); onClose(); }}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                  activeVillageId === village.id 
                    ? 'bg-white/15 text-white shadow-md border border-white/10' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <img src={village.icon} className="w-10 h-10 rounded-lg object-cover bg-gray-700" />
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{village.name}</p>
                  <p className="text-xs opacity-60 truncate">
                    {village.isPrivate ? 'Private' : `${village.members} members`}
                  </p>
                </div>
                {activeVillageId === village.id && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
              </button>
            ))}
            
            <button 
              onClick={() => { onCreateClick(); onClose(); }}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white border border-dashed border-gray-600 hover:border-gray-400 mt-2"
            >
               <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-current">
                 <Plus size={20} />
               </div>
               <span className="font-medium text-sm">Create Village</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Desktop Sidebar ---

const Sidebar = ({ 
  villages, 
  activeVillageId, 
  onSelectVillage, 
  onGoHome,
  onOpenPassport,
  onCreateClick
}: { 
  villages: Village[], 
  activeVillageId: string | null, 
  onSelectVillage: (id: string) => void,
  onGoHome: () => void,
  onOpenPassport: () => void,
  onCreateClick: () => void
}) => (
  <div className="hidden lg:flex w-20 flex-col items-center py-6 bg-secondary text-white h-screen fixed left-0 top-0 z-50 shadow-xl">
    <div className="mb-8 p-3 bg-primary rounded-xl shadow-lg shadow-primary/30">
      <Globe size={24} className="text-white" />
    </div>

    <div className="flex-1 w-full px-3 flex flex-col gap-4 overflow-y-auto no-scrollbar">
      <button 
        onClick={onGoHome}
        className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 group relative ${!activeVillageId ? 'bg-white text-secondary shadow-lg scale-110' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
      >
        <Search size={22} />
        {!activeVillageId && <div className="absolute -right-1 top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-secondary" />}
        <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          Discover
        </div>
      </button>

      <div className="w-full h-px bg-white/10 my-2" />
      
      {villages.map(village => (
        <button
          key={village.id}
          onClick={() => onSelectVillage(village.id)}
          className={`w-full aspect-square rounded-2xl relative group transition-all duration-300 ${activeVillageId === village.id ? 'ring-4 ring-primary/50 shadow-lg scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
        >
          <img 
            src={village.icon} 
            alt={village.name} 
            className={`w-full h-full object-cover rounded-2xl bg-gray-700 transition-all ${activeVillageId === village.id ? '' : 'grayscale hover:grayscale-0'}`} 
          />
          <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {village.name}
          </div>
          {village.online > 50 && (
             <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-secondary" />
          )}
        </button>
      ))}

      <button 
        onClick={onCreateClick}
        className="w-full aspect-square rounded-2xl flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-dashed border-gray-600 hover:border-gray-400"
      >
        <Plus size={22} />
      </button>
    </div>

    <div className="mt-auto px-3 w-full">
      <button onClick={onOpenPassport} className="w-full aspect-square rounded-2xl bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
        <User size={22} />
      </button>
    </div>
  </div>
);

// --- Auth View ---

const AuthView = ({ onLogin }: { onLogin: (email: string, code?: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('explorer@globalvillage.com');
  const [password, setPassword] = useState('password123');
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, inviteCode);
  };

  const setInviteDemo = () => {
    setInviteCode('PUZZLE2024');
    setIsLogin(false);
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary/30 transform rotate-3">
            <Globe size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Global Village</h1>
          <p className="text-gray-300">Build your digital home anywhere.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter password"
              />
              <Lock size={16} className="absolute right-4 top-3.5 text-gray-500" />
            </div>
          </div>
          
          {!isLogin && (
            <div className="animate-slide-up">
              <label className="block text-xs font-bold text-accent uppercase tracking-wider mb-1">Invitation Code (Optional)</label>
              <input 
                type="text" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 text-white placeholder-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="Have a code?"
              />
            </div>
          )}

          <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 transform mt-2">
            {isLogin ? 'Enter Village' : 'Join Community'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-300 hover:text-white transition-colors">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
          
          <button onClick={setInviteDemo} className="text-xs text-accent/80 hover:text-accent underline">
            Simulate Invite Link (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Create Village Modal ---

const CreateVillageModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (data: any) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '',
    category: '',
    description: '',
    currencyName: 'Coins',
    currencySymbol: '🪙',
    privacy: 'public'
  });

  const handleSubmit = () => {
    onCreate(data);
    onClose();
    setStep(1); // Reset
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-secondary">Found a Village</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
          </div>
          
          <div className="mb-6 flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>

          <div className="min-h-[300px]">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold mb-2">Basic Info</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village Name</label>
                  <input className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="e.g. Cyber Punks"
                    value={data.name}
                    onChange={e => setData({...data, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Interest', 'Professional', 'Region', 'Lifestyle'].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setData({...data, category: cat})}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${data.category === cat ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold mb-2">Economy Design</h3>
                <p className="text-sm text-gray-500 mb-4">Define what value means in your community.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency Name</label>
                    <input className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" 
                      placeholder="e.g. Gold"
                      value={data.currencyName}
                      onChange={e => setData({...data, currencyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                    <input className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" 
                      placeholder="e.g. 🟡"
                      value={data.currencySymbol}
                      onChange={e => setData({...data, currencySymbol: e.target.value})}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-200 mt-4">
                   <span className="font-medium text-gray-600">Preview:</span>
                   <div className="flex items-center gap-2 font-bold text-secondary">
                     <span>100</span>
                     <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100">{data.currencySymbol} {data.currencyName}</span>
                   </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold mb-2">Privacy & Access</h3>
                <div className="space-y-3">
                   <button 
                    onClick={() => setData({...data, privacy: 'public'})}
                    className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${data.privacy === 'public' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                   >
                     <Globe className={data.privacy === 'public' ? 'text-primary' : 'text-gray-400'} />
                     <div>
                       <div className="font-bold text-gray-800">Public Village</div>
                       <div className="text-xs text-gray-500">Anyone can find and join</div>
                     </div>
                   </button>
                   
                   <button 
                    onClick={() => setData({...data, privacy: 'private'})}
                    className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${data.privacy === 'private' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                   >
                     <Lock className={data.privacy === 'private' ? 'text-primary' : 'text-gray-400'} />
                     <div>
                       <div className="font-bold text-gray-800">Hidden Society</div>
                       <div className="text-xs text-gray-500">Invite-only, not visible in search</div>
                     </div>
                   </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Back</button>
            ) : <div/>}
            
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="px-6 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors">Next</button>
            ) : (
              <button onClick={handleSubmit} className="px-8 py-2 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 shadow-lg shadow-primary/30 transition-all transform active:scale-95">Create Village</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Home/Discovery View ---

const HomeView = ({ 
  onJoinVillage,
  villages,
  onCreateClick
}: { 
  onJoinVillage: (id: string) => void,
  villages: Village[],
  onCreateClick: () => void
}) => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Interest', 'Professional', 'Lifestyle', 'Technology'];
  
  // Filter out private villages from discovery
  const visibleVillages = villages.filter(v => !v.isPrivate);
  const filteredVillages = filter === 'All' 
    ? visibleVillages 
    : visibleVillages.filter(v => v.category === filter);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-12 pb-24 lg:pb-12">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-secondary mb-2">Explore the World</h1>
        <p className="text-gray-500">Find your tribe among {visibleVillages.length} active communities.</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === cat 
                ? 'bg-secondary text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVillages.map((village, idx) => (
          <div 
            key={village.id} 
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <img src={village.icon} alt={village.name} className="w-14 h-14 rounded-xl bg-gray-100 object-cover shadow-sm group-hover:scale-105 transition-transform" />
              <span className="text-xs font-bold px-2 py-1 bg-sand text-secondary rounded-lg uppercase tracking-wide">
                {village.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">{village.name}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">{village.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{village.members}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{village.online} Online</span>
              </div>
            </div>

            <button 
              onClick={() => onJoinVillage(village.id)}
              className="w-full py-3 rounded-xl border-2 border-secondary text-secondary font-bold hover:bg-secondary hover:text-white transition-all active:scale-95"
            >
              Join Village
            </button>
          </div>
        ))}
        
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mb-4">
            <Plus size={32} />
          </div>
          <h3 className="text-lg font-bold text-secondary mb-2">Create Your Own</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-[200px]">Build a customized community with its own economy and rules.</p>
          <button 
            onClick={onCreateClick}
            className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Village Components ---

const TownHall = ({ 
  village,
  onUpdateVillage,
  isOwner
}: { 
  village: Village,
  onUpdateVillage: (updates: Partial<Village>) => void,
  isOwner: boolean
}) => {
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState(village.announcement || '');

  const togglePrivacy = () => {
     const newPrivacy = !village.isPrivate;
     const updates: Partial<Village> = {
       isPrivate: newPrivacy
     };
     // If becoming private and no code exists, generate one
     if (newPrivacy && !village.inviteCode) {
       updates.inviteCode = `V${village.id.toUpperCase()}2024`;
     }
     onUpdateVillage(updates);
  };

  const regenerateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    onUpdateVillage({ inviteCode: randomCode });
  }

  const handleSaveAnnouncement = () => {
    onUpdateVillage({ announcement: announcementText });
    setIsEditingAnnouncement(false);
  }

  return (
  <div className="space-y-6 animate-fade-in pb-20">
    {/* Announcements Section */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
      <div className="flex justify-between items-start mb-3">
         <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Megaphone size={20} className="text-primary" /> Community Announcements
         </h3>
         {isOwner && (
           <button 
            onClick={() => setIsEditingAnnouncement(!isEditingAnnouncement)}
            className="text-xs text-primary font-bold hover:underline"
           >
             {isEditingAnnouncement ? 'Cancel' : 'Edit'}
           </button>
         )}
      </div>
      
      {isEditingAnnouncement ? (
        <div className="space-y-3">
          <textarea 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
          />
          <button 
            onClick={handleSaveAnnouncement}
            className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold"
          >
            Post Announcement
          </button>
        </div>
      ) : (
        <div className="bg-primary/5 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-primary/10">
          {village.announcement || "No announcements yet."}
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" /> Data Center
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
             <span className="text-gray-500 text-sm">Total Citizens</span>
             <span className="font-mono font-bold text-xl">{village.members}</span>
          </div>
           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
             <span className="text-gray-500 text-sm">Active Today</span>
             <span className="font-mono font-bold text-xl text-green-600">{Math.floor(village.members * 0.15)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
             <span className="text-gray-500 text-sm">Treasury</span>
             <span className="font-mono font-bold text-xl text-yellow-600">{village.currencySymbol} 84.5k</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" /> Constitution
        </h3>
        <div className="text-sm text-gray-600 space-y-2 bg-sand/30 p-4 rounded-xl border border-sand">
          <p>1. Be respectful to all villagers.</p>
          <p>2. No spamming in the public square.</p>
          <p>3. Contribute to the economy to earn {village.currencyName}.</p>
        </div>
        {isOwner && (
          <button className="mt-4 text-primary text-sm font-bold hover:underline">Edit Rules</button>
        )}
      </div>
    </div>
    
    {isOwner ? (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-gray-500" /> Admin Settings
          </h3>
         
         <div className="flex items-center justify-between py-4 border-b border-gray-100">
           <div>
             <div className="font-medium text-gray-800">Private Village</div>
             <div className="text-xs text-gray-500">Only invited members can join</div>
           </div>
           <div 
              onClick={togglePrivacy}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${village.isPrivate ? 'bg-primary' : 'bg-gray-200'}`}
            >
             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${village.isPrivate ? 'translate-x-6' : ''}`} />
           </div>
         </div>

         {village.isPrivate && (
           <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center justify-between animate-fade-in">
             <div>
               <div className="text-xs font-bold text-gray-400 uppercase">Invite Code</div>
               <div className="font-mono font-bold text-lg tracking-widest text-secondary">{village.inviteCode}</div>
             </div>
             <div className="flex gap-2">
               <button onClick={regenerateCode} className="p-2 text-gray-500 hover:text-primary hover:bg-white rounded-lg transition-colors" title="Regenerate Code">
                 <RefreshCw size={20} />
               </button>
               <button className="p-2 text-primary hover:bg-white rounded-lg transition-colors">
                 <Share2 size={20} />
               </button>
             </div>
           </div>
         )}
      </div>
    ) : (
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center">
         <AlertCircle size={32} className="text-gray-400 mx-auto mb-2" />
         <h3 className="text-gray-600 font-bold mb-1">Restricted Area</h3>
         <p className="text-gray-400 text-sm">Only the Village Chief can access administrative settings.</p>
      </div>
    )}
  </div>
)};

// --- Village View (Main Context) ---

const VillageView = ({ 
    village,
    activeTab, 
    onTabChange,
    onUpdateVillage,
    currentUserRole
}: { 
    village: Village, 
    activeTab: string, 
    onTabChange: (tab: string) => void,
    onUpdateVillage: (updates: Partial<Village>) => void,
    currentUserRole: string
}) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const isChief = currentUserRole === 'Chief';

  return (
    <div className="flex flex-col min-h-screen bg-sand lg:pl-20">
      {/* Scrollable Container */}
      <div className="flex-1">
        {/* Cover Image Header - Scrolls away on mobile */}
        <div className="w-full h-48 lg:h-64 relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <img src={village.coverImage} alt="Cover" className="w-full h-full object-cover" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 z-20 text-white flex items-end justify-between">
            <div className="flex items-end gap-4">
              <img src={village.icon} className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl bg-white hidden lg:block" />
              <div className="mb-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 bg-primary rounded text-white">{village.category}</span>
                  {village.isPrivate && <Lock size={14} className="text-white/80" />}
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold shadow-black drop-shadow-md hidden lg:block">{village.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-200 mt-2">
                  <span className="flex items-center gap-1"><Users size={14}/> {village.members}</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"/> {village.online} Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto w-full px-4 lg:px-8 pb-24 lg:pb-12">
            
            {/* Desktop Tabs (Sticky) */}
            <div className="hidden lg:flex sticky top-0 z-40 bg-sand/95 backdrop-blur-md border-b border-gray-200 mb-6 pt-4">
              <nav className="flex gap-8">
                {['Square', 'Citizens', 'Events', 'Town Hall'].map((tab) => {
                   const id = tab.toLowerCase().replace(' ', '');
                   return (
                    <button
                      key={tab}
                      onClick={() => onTabChange(id)}
                      className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === id 
                        ? 'border-primary text-secondary' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab}
                    </button>
                   );
                })}
              </nav>
            </div>

            {/* Mobile Title (In-flow for scrolling context) */}
            <div className="lg:hidden py-4">
               <h1 className="text-2xl font-bold text-secondary">{village.name}</h1>
               <p className="text-sm text-gray-500 mt-1">{village.description}</p>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {activeTab === 'square' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    
                    {/* Announcement Banner in Feed */}
                    {village.announcement && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 animate-fade-in">
                         <Megaphone size={20} className="text-primary shrink-0 mt-0.5" />
                         <div>
                            <div className="text-xs font-bold text-primary uppercase mb-1">Announcement</div>
                            <p className="text-sm text-gray-700">{village.announcement}</p>
                         </div>
                      </div>
                    )}

                    {/* Create Post Input */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3 mb-6">
                       <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                       <div className="flex-1">
                          <input className="w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder={`What's happening in ${village.name}?`} />
                          <div className="flex justify-between mt-3">
                             <div className="flex gap-2 text-gray-400">
                                <button className="p-1.5 hover:bg-gray-100 rounded-md"><Camera size={18}/></button>
                                <button className="p-1.5 hover:bg-gray-100 rounded-md"><FileText size={18}/></button>
                             </div>
                             <button className="bg-secondary text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-opacity-90">Post</button>
                          </div>
                       </div>
                    </div>

                    {POSTS.map(post => <FeedPost key={post.id} post={post} />)}
                  </div>
                  
                  <div className="hidden lg:block space-y-6">
                    <div className="bg-gradient-to-br from-secondary to-[#2a2d40] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                       <div className="relative z-10">
                         <div className="text-xs font-bold opacity-60 uppercase mb-1">My Assets</div>
                         <div className="text-3xl font-mono font-bold mb-4">{village.currencySymbol} 1,240</div>
                         <div className="flex items-center gap-2 text-sm bg-white/10 p-2 rounded-lg">
                           <TrendingUp size={16} className="text-green-400" />
                           <span>+50 {village.currencyName} this week</span>
                         </div>
                       </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Quests</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><MessageSquare size={14} /></div>
                          <div className="flex-1">
                             <div className="text-sm font-bold text-gray-700">Daily Discussion</div>
                             <div className="text-xs text-gray-400">Comment on 3 posts</div>
                          </div>
                          <span className="text-xs font-bold text-primary">+10</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><UserPlus size={14} /></div>
                          <div className="flex-1">
                             <div className="text-sm font-bold text-gray-700">Recruiter</div>
                             <div className="text-xs text-gray-400">Invite a friend</div>
                          </div>
                          <span className="text-xs font-bold text-primary">+500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'citizens' && (
                <div className="animate-fade-in pb-20">
                  <div className="mb-6 flex gap-4 overflow-x-auto no-scrollbar">
                    {['All Citizens', 'Online', 'Newest', 'Admins'].map(filter => (
                      <button key={filter} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-primary hover:text-primary transition-colors whitespace-nowrap">
                        {filter}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {MOCK_MEMBERS.map(member => (
                      <div 
                        key={member.id} 
                        onClick={() => setSelectedMember(member)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group text-center"
                      >
                        <div className="relative inline-block mx-auto mb-3">
                          <img src={member.avatar} className="w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm truncate">{member.name}</h3>
                        <p className="text-xs text-primary font-medium mb-1">{member.role}</p>
                        <p className="text-xs text-gray-400 truncate">{member.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="animate-fade-in pb-20">
                   <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-secondary">Upcoming Events</h2>
                      <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2">
                        <Plus size={16} /> Create Event
                      </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {VILLAGE_EVENTS.map(event => <EventCard key={event.id} event={event} />)}
                   </div>
                </div>
              )}

              {activeTab === 'townhall' && (
                <TownHall 
                  village={village} 
                  onUpdateVillage={onUpdateVillage} 
                  isOwner={isChief}
                />
              )}
            </div>
        </div>
      </div>

      <ContactCardModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
};

// --- Main Layout ---

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'u1',
    global: {
      id: '8842-1920',
      name: 'Explorer',
      email: 'explorer@globalvillage.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    local: {
      'v1': {
        nickname: 'DesignGuru',
        bio: 'Creating pixels every day.',
        role: 'Chief',
        joinedAt: '2023-01-15',
        privacy: { showEmail: true, showPhone: false, showLocation: true, showSocials: true }
      },
      'v3': {
        nickname: 'RustCrab',
        bio: 'Memory safety is key.',
        role: 'Villager',
        joinedAt: '2023-06-20',
        privacy: { showEmail: false, showPhone: false, showLocation: false, showSocials: false }
      }
    }
  });
  
  // App State
  const [villages, setVillages] = useState<Village[]>(INITIAL_VILLAGES);
  const [activeVillageId, setActiveVillageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('square');
  
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Determine current role based on active village
  const currentUserRole = activeVillageId 
    ? (userProfile.local[activeVillageId]?.role || 'Villager')
    : 'Villager';

  // Auto-join secret village if code provided
  const handleLogin = (email: string, code?: string) => {
    setIsAuthenticated(true);
    // Update global profile email
    setUserProfile(prev => ({
      ...prev,
      global: { ...prev.global, email }
    }));
    
    // Find village by invite code or default to first public
    const inviteVillage = villages.find(v => v.inviteCode === code);
    
    if (inviteVillage) {
       setActiveVillageId(inviteVillage.id); 
    } else {
       // Default to first public village
       setActiveVillageId('v1');
    }
  };

  const handleUpdateLocalProfile = (villageId: string, updates: Partial<LocalProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      local: {
        ...prev.local,
        [villageId]: {
          ...(prev.local[villageId] || { 
            nickname: prev.global.name, 
            bio: 'New Villager', 
            role: 'Villager',
            joinedAt: new Date().toISOString().split('T')[0],
            privacy: { showEmail: true, showPhone: false, showLocation: true, showSocials: true }
          }),
          ...updates
        }
      }
    }));
  };

  const activeVillage = villages.find(v => v.id === activeVillageId);
  const myVillages = villages.filter(v => 
     isAuthenticated && (v.id === activeVillageId || !v.isPrivate)
  );

  const handleSelectVillage = (id: string) => {
    setActiveVillageId(id);
    setActiveTab('square'); // Reset tab on switch
    window.scrollTo(0,0);
  };

  const handleUpdateVillage = (id: string, updates: Partial<Village>) => {
    setVillages(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }

  const handleGoHome = () => {
    setActiveVillageId(null);
  };

  const handleCreateVillage = (data: any) => {
    const newVillage: Village = {
      id: `v${Date.now()}`,
      name: data.name,
      category: data.category || 'Interest',
      description: data.description || 'A new community',
      announcement: 'Welcome to our new village!',
      members: 1,
      online: 1,
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      icon: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=100&q=80',
      currencyName: data.currencyName,
      currencySymbol: data.currencySymbol,
      isPrivate: data.privacy === 'private',
      inviteCode: data.privacy === 'private' ? 'NEWCODE' : undefined
    };
    
    setVillages([...villages, newVillage]);
    
    // Create Chief profile for the creator
    handleUpdateLocalProfile(newVillage.id, {
      nickname: userProfile.global.name,
      role: 'Chief',
      bio: 'Founder of this village',
      joinedAt: new Date().toISOString().split('T')[0],
      privacy: { showEmail: true, showPhone: true, showLocation: true, showSocials: true }
    });
    
    setActiveVillageId(newVillage.id);
  }

  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="bg-sand min-h-screen text-gray-800 font-sans">
      {/* Mobile Header (Only visible on mobile) */}
      <MobileHeader 
        title={activeVillage ? activeVillage.name : 'Discover'} 
        icon={activeVillage?.icon}
        onMenuClick={() => setIsMobileDrawerOpen(true)}
        onProfileClick={() => setIsPassportOpen(true)}
      />

      {/* Desktop Sidebar (Left) */}
      <Sidebar 
        villages={myVillages} 
        activeVillageId={activeVillageId} 
        onSelectVillage={handleSelectVillage}
        onGoHome={handleGoHome}
        onOpenPassport={() => setIsPassportOpen(true)}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Mobile Drawer (Village Switcher) */}
      <VillageSwitcherDrawer 
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        villages={myVillages}
        activeVillageId={activeVillageId}
        onSelectVillage={handleSelectVillage}
        onGoHome={handleGoHome}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="pt-14 lg:pt-0 min-h-screen">
        {activeVillageId && activeVillage ? (
          <>
            <VillageView 
              village={activeVillage} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onUpdateVillage={(updates) => handleUpdateVillage(activeVillage.id, updates)}
              currentUserRole={currentUserRole}
            />
            {/* Mobile Bottom Nav (Only inside a Village) */}
            <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </>
        ) : (
          <div className="lg:pl-20 min-h-screen">
            <HomeView 
              onJoinVillage={handleSelectVillage} 
              villages={villages}
              onCreateClick={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <PassportModal 
        isOpen={isPassportOpen} 
        onClose={() => setIsPassportOpen(false)} 
        userProfile={userProfile}
        activeVillage={activeVillage}
        onUpdateLocalProfile={handleUpdateLocalProfile}
      />
      <CreateVillageModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateVillage} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
