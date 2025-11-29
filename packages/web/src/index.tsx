import './styles.css';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { I18nProvider, useI18n } from './i18n';
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
  AlertCircle,
  Loader2,
  Crown,
  Award,
  Shield,
  MapPin,
  CheckCircle,
  XCircle,
  Star,
  Key
} from 'lucide-react';
import { useAuthStore } from './stores';
import { villageService, postService, eventService, membershipService } from './services';

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
  pointRules?: {
    post: number;
    comment: number;
    rsvp: number;
    like_received: number;
  };
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
  isLiked?: boolean;
}

interface VillageEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'Online' | 'Offline';
  image: string;
  organizer: {
    name: string;
    role: string;
    avatar?: string;
  };
  attendees: number;
  status?: 'approved' | 'pending' | 'rejected';
  description?: string;
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
    organizer: {
      name: 'Alex Chen',
      role: 'Chief',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
    },
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
    organizer: {
      name: 'Sarah Jones',
      role: 'Elder',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
    },
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

const EventCard: React.FC<{
  event: VillageEvent;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRsvp?: (id: string, status: 'going' | 'interested' | 'not_going') => void;
  onClick?: () => void;
}> = ({ event, isAdmin, onApprove, onReject, onRsvp, onClick }) => {
  const [isRsvping, setIsRsvping] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const isOfficialEvent = event.organizer?.role?.toLowerCase() === 'chief' || event.organizer?.role?.toLowerCase() === 'elder';
  const isPending = event.status === 'pending';
  const myRsvp = (event as any).myRsvp;

  const handleRsvp = async (status: 'going' | 'interested' | 'not_going') => {
    if (myRsvp === status) return; // Don't re-submit the same status
    setIsRsvping(true);
    try {
      await onRsvp?.(event.id, status);
    } finally {
      setIsRsvping(false);
    }
  };

  const handleQuickShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const shareData = {
      title: event.title,
      text: `🎉 ${event.title}\n📅 ${event.date} ${event.time}\n📍 ${event.location}\n\nJoin us!`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        const shareText = `${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        const shareText = `${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    }
  };

  return (
  <div
    className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
      isOfficialEvent ? 'border-2 border-amber-200 ring-1 ring-amber-100' : 'border border-gray-100'
    } ${isPending ? 'opacity-75' : ''}`}
    onClick={onClick}
  >
    <div className="h-32 bg-gray-200 relative">
      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
        {event.type === 'Online' ? <Video size={12} /> : <MapIcon size={12} />}
        {event.type}
      </div>
      <div className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
        {event.date}
      </div>
      {isOfficialEvent && (
        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
          <Crown size={10} />
          <span>Official Event</span>
        </div>
      )}
      {isPending && (
        <div className="absolute bottom-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <Clock size={10} />
          <span>Pending Approval</span>
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{event.title}</h3>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <Clock size={12} />
        <span>{event.time}</span>
        <span>•</span>
        <MapPin size={12} />
        <span className="truncate max-w-[100px]">{event.location}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          {event.organizer?.avatar && (
            <img src={event.organizer.avatar} alt={event.organizer.name} className="w-4 h-4 rounded-full" />
          )}
          <span>by <span className={isOfficialEvent ? 'text-amber-600 font-medium' : ''}>{event.organizer?.name || 'Unknown'}</span></span>
          {isOfficialEvent && <Crown size={10} className="text-amber-500" />}
        </div>
      </div>
      {/* Attendee count and Admin actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            <span className="font-semibold text-primary">{event.attendees}</span> attending
          </div>
          {!isPending && (
            <button
              onClick={handleQuickShare}
              className="p-1.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-primary transition-colors"
              title={shareSuccess ? 'Copied!' : 'Share event'}
            >
              {shareSuccess ? <CheckCircle size={14} className="text-green-600" /> : <Share2 size={14} />}
            </button>
          )}
        </div>
        {isPending && isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onApprove?.(event.id); }}
              className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
              title="Approve"
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onReject?.(event.id); }}
              className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              title="Reject"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}
      </div>

      {/* View Details Button */}
      {!isPending && (
        <button
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          className="w-full py-2.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
        >
          {myRsvp ? (
            <>
              {myRsvp === 'going' ? <CheckCircle size={14} className="text-green-600" /> : <Star size={14} className="text-blue-600" />}
              <span className={myRsvp === 'going' ? 'text-green-600' : 'text-blue-600'}>
                {myRsvp === 'going' ? 'Going' : 'Interested'}
              </span>
              <span className="text-gray-400 mx-1">•</span>
            </>
          ) : null}
          View Details & Register
        </button>
      )}
    </div>
  </div>
  );
};

// --- Event Detail Modal ---
interface EventDetailModalProps {
  event: VillageEvent | null;
  onClose: () => void;
  onRsvp: (eventId: string, status: 'going' | 'interested' | 'not_going', registrationData?: { name: string; phone: string; note: string }) => void;
  userProfile?: { name: string; email: string };
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onRsvp, userProfile }) => {
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'going' | 'interested'>('going');
  const [registrationData, setRegistrationData] = useState({
    name: userProfile?.name || '',
    phone: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [canSeeDetails, setCanSeeDetails] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    if (!event) return;

    const shareData = {
      title: event.title,
      text: `🎉 ${event.title}\n📅 ${event.date} ${event.time}\n📍 ${event.location}\n\nJoin us for this exciting event!`,
      url: window.location.href
    };

    try {
      // Try native Web Share API first (works great on mobile)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      // User cancelled or error
      if ((err as Error).name !== 'AbortError') {
        // Fallback to clipboard
        const shareText = `${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    }
  };

  useEffect(() => {
    if (userProfile?.name) {
      setRegistrationData(prev => ({ ...prev, name: userProfile.name }));
    }
  }, [userProfile?.name]);

  const loadAttendees = async () => {
    if (!event) return;
    setIsLoadingAttendees(true);
    try {
      const result = await eventService.getAttendees(event.id);
      setAttendees(result.items);
      setCanSeeDetails(result.canSeeDetails);
    } catch (error) {
      console.error('Failed to load attendees:', error);
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  const handleToggleAttendees = () => {
    if (!showAttendees && attendees.length === 0) {
      loadAttendees();
    }
    setShowAttendees(!showAttendees);
  };

  if (!event) return null;

  const isOfficialEvent = event.organizer?.role?.toLowerCase() === 'chief' || event.organizer?.role?.toLowerCase() === 'elder';
  const myRsvp = (event as any).myRsvp;

  const handleSubmitRsvp = async () => {
    setIsSubmitting(true);
    try {
      await onRsvp(event.id, selectedStatus, registrationData);
      setShowRsvpForm(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Cover Image */}
        <div className="h-48 relative">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors relative"
              title="Share event"
            >
              {shareSuccess ? <CheckCircle size={20} className="text-green-400" /> : <Share2 size={20} />}
              {shareSuccess && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>
            <button onClick={onClose} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="bg-black/60 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
              {event.type === 'Online' ? <Video size={14} /> : <MapPin size={14} />}
              {event.type}
            </div>
            {isOfficialEvent && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                <Crown size={14} />
                Official Event
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h2>

          {/* Organizer */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            {event.organizer?.avatar && (
              <img src={event.organizer.avatar} alt={event.organizer.name} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="text-sm text-gray-500">Organized by</p>
              <p className="font-medium text-gray-800 flex items-center gap-1">
                {event.organizer?.name}
                {isOfficialEvent && <Crown size={12} className="text-amber-500" />}
              </p>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium text-gray-800">{event.date}</p>
                <p className="text-sm text-gray-600">{event.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-800">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="mb-4">
            <button
              onClick={handleToggleAttendees}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <span className="font-semibold text-primary">{event.attendees}</span>
                <span className="text-gray-600">people are attending</span>
              </div>
              <ChevronDown size={18} className={`text-gray-400 transition-transform ${showAttendees ? 'rotate-180' : ''}`} />
            </button>

            {showAttendees && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                {isLoadingAttendees ? (
                  <div className="p-4 flex justify-center">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : attendees.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No attendees yet. Be the first to join!
                  </div>
                ) : (
                  <div className="divide-y max-h-64 overflow-y-auto">
                    {attendees.map((attendee) => (
                      <div key={attendee.id} className="p-3 flex items-start gap-3 hover:bg-gray-50">
                        <img
                          src={attendee.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                          alt={attendee.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800">{attendee.name}</p>
                          <p className="text-xs text-gray-500">
                            Registered {new Date(attendee.rsvpAt).toLocaleDateString()}
                          </p>
                          {canSeeDetails && (
                            <div className="mt-1 space-y-0.5">
                              {attendee.registrationName && attendee.registrationName !== attendee.name && (
                                <p className="text-xs text-gray-600">
                                  <span className="text-gray-400">Name: </span>{attendee.registrationName}
                                </p>
                              )}
                              {attendee.phone && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  <Phone size={10} className="text-gray-400" />
                                  {attendee.phone}
                                </p>
                              )}
                              {attendee.note && (
                                <p className="text-xs text-gray-600 italic">"{attendee.note}"</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {canSeeDetails && attendees.length > 0 && (
                  <div className="p-2 bg-amber-50 border-t text-xs text-amber-700 flex items-center gap-1">
                    <Shield size={12} />
                    You can see registration details as organizer/admin
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">About this event</h3>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Current RSVP Status */}
          {myRsvp && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              myRsvp === 'going' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {myRsvp === 'going' ? <CheckCircle size={18} /> : <Star size={18} />}
              <span className="font-medium">
                {myRsvp === 'going' ? "You're going to this event!" : "You're interested in this event"}
              </span>
            </div>
          )}

          {/* RSVP Form */}
          {showRsvpForm ? (
            <div className="border rounded-xl p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-4">Register for this event</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="For event updates (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Requirements</label>
                  <textarea
                    value={registrationData.note}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Any dietary restrictions, accessibility needs, or questions for the organizer..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRsvpForm(false)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRsvp}
                    disabled={!registrationData.name || isSubmitting}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      selectedStatus === 'going'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        {selectedStatus === 'going' ? <CheckCircle size={18} /> : <Star size={18} />}
                        {selectedStatus === 'going' ? "Confirm I'm Going" : "Confirm Interest"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedStatus('going');
                  setShowRsvpForm(true);
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  myRsvp === 'going'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <CheckCircle size={20} />
                {myRsvp === 'going' ? 'Going' : "I'm Going"}
              </button>
              <button
                onClick={() => {
                  setSelectedStatus('interested');
                  setShowRsvpForm(true);
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  myRsvp === 'interested'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <Star size={20} />
                {myRsvp === 'interested' ? 'Interested' : "I'm Interested"}
              </button>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleShare}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              {shareSuccess ? (
                <>
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-green-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <span>Share Event</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Share this event with friends or post to your group chat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeedPostProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, onLike, onComment }) => {
  const isAdmin = post.author.role?.toLowerCase() === 'chief' || post.author.role?.toLowerCase() === 'elder';

  return (
  <div className={`bg-white p-4 rounded-xl shadow-sm mb-4 animate-fade-in ${isAdmin ? 'border-2 border-amber-200 ring-1 ring-amber-100' : 'border border-gray-100'}`}>
    {isAdmin && (
      <div className="flex items-center gap-1.5 mb-3 text-amber-600 text-xs font-medium">
        <Crown size={14} />
        <span>{useI18n().t('officialAnnouncement')}</span>
      </div>
    )}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={post.author.avatar} alt={post.author.name} className={`w-10 h-10 rounded-full object-cover ${isAdmin ? 'ring-2 ring-amber-400' : ''}`} />
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
              <Crown size={10} className="text-white" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800 text-sm">{post.author.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isAdmin
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {post.author.role}
            </span>
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
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 transition-colors text-sm ${
            post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
          <span>{post.likes}</span>
        </button>
        <button
          onClick={() => onComment(post.id)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm"
        >
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
};

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
        <div className="h-24 bg-gradient-to-r from-primary to-primary/60 relative z-0">
          <button onClick={onClose} className="absolute top-2 right-2 p-1 bg-black/20 text-white rounded-full hover:bg-black/30 z-20">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-6 -mt-12 text-center relative z-10">
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
  const currentLocalProfile = useMemo(() => {
    if (!activeVillage) return null;
    return userProfile.local[activeVillage.id] || {
      nickname: userProfile.global.name,
      bio: 'Ready to explore',
      role: 'Villager',
      joinedAt: new Date().toISOString().split('T')[0],
      privacy: { showEmail: true, showPhone: false, showLocation: true, showSocials: true }
    };
  }, [activeVillage?.id, userProfile.local, userProfile.global.name]);

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
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
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 pt-safe z-[60] shadow-sm">
          <div className="h-14 flex items-center justify-between px-4">
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
        </div>
    );
}

const MobileBottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const { t } = useI18n();
  const tabs = [
    { id: 'square', icon: MessageSquare, label: t('square') },
    { id: 'citizens', icon: Users, label: t('citizens') },
    { id: 'events', icon: Calendar, label: t('events') },
    { id: 'townhall', icon: Gavel, label: t('townHall') },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 mobile-bottom-nav pt-2 z-[60] flex justify-around items-center shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.1)]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[60px] rounded-xl transition-all duration-200 ${
            activeTab === tab.id
              ? 'text-primary bg-primary/10 scale-105'
              : 'text-gray-400 hover:text-gray-600 active:scale-95'
          }`}
        >
          <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold">{tab.label}</span>
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
  onLogout
}: {
  isOpen: boolean,
  onClose: () => void,
  villages: Village[],
  activeVillageId: string | null,
  onSelectVillage: (id: string) => void,
  onGoHome: () => void,
  onLogout: () => void
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-secondary text-white shadow-2xl animate-slide-right flex flex-col pt-safe">
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Globe className="text-primary" /> {useI18n().t('appName')}
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
            <span className="font-medium">{useI18n().t('discover')}</span>
          </button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{useI18n().t('myVillages')}</div>
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
              onClick={() => { onGoHome(); onClose(); }}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white border border-dashed border-gray-600 hover:border-gray-400 mt-2"
            >
               <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-current">
                 <Plus size={20} />
               </div>
               <span className="font-medium text-sm">Join Village</span>
            </button>
          </div>
        </div>

        <div className="p-6 pt-0 border-t border-white/10">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10">
              <LogOut size={20} />
            </div>
            <span className="font-medium">Logout</span>
          </button>
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
  onLogout
}: {
  villages: Village[],
  activeVillageId: string | null,
  onSelectVillage: (id: string) => void,
  onGoHome: () => void,
  onOpenPassport: () => void,
  onLogout: () => void
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
          className={`w-14 h-14 rounded-2xl relative group transition-all duration-300 flex-shrink-0 ${activeVillageId === village.id ? 'ring-4 ring-primary/50 shadow-lg scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
        >
          <img
            src={village.icon}
            alt={village.name}
            className={`w-14 h-14 object-cover rounded-2xl bg-gray-700 transition-all ${activeVillageId === village.id ? '' : 'grayscale hover:grayscale-0'}`}
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
        onClick={onGoHome}
        className="w-full aspect-square rounded-2xl flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-dashed border-gray-600 hover:border-gray-400 group relative"
      >
        <Plus size={22} />
        <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          Join Village
        </div>
      </button>
    </div>

    <div className="mt-auto px-3 w-full space-y-2">
      <button onClick={onOpenPassport} className="w-full aspect-square rounded-2xl bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors group relative">
        <User size={22} />
        <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          Profile
        </div>
      </button>
      <button onClick={onLogout} className="w-full aspect-square rounded-2xl bg-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors group relative">
        <LogOut size={22} />
        <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          Logout
        </div>
      </button>
    </div>
  </div>
);

// --- Auth View ---

interface AuthViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
}

const AuthView = ({ onLogin, onRegister }: AuthViewProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }
        await onRegister(email, password, name);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

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

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-3 mb-4 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-slide-up">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Your display name"
                disabled={isLoading}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter your email"
              disabled={isLoading}
              required
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
                disabled={isLoading}
                required
                minLength={6}
              />
              <Lock size={16} className="absolute right-4 top-3.5 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 transform mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLogin ? 'Enter Village' : 'Join Community'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm text-gray-300 hover:text-white transition-colors"
            disabled={isLoading}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Create Village Modal ---

const CreateVillageModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (data: any) => Promise<void> }) => {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    name: '',
    category: '',
    description: '',
    currencyName: 'Coins',
    currencySymbol: '🪙',
    privacy: 'public'
  });

  const handleSubmit = async () => {
    if (!data.name.trim()) {
      setError('Please enter a village name');
      return;
    }
    if (!data.category) {
      setError('Please select a category');
      return;
    }

    setIsCreating(true);
    setError('');
    try {
      await onCreate(data);
      setStep(1);
      setData({
        name: '',
        category: '',
        description: '',
        currencyName: 'Coins',
        currencySymbol: '🪙',
        privacy: 'public'
      });
    } catch (err: any) {
      const message = err?.response?.data?.message;
      if (Array.isArray(message)) {
        setError(message.join(', '));
      } else {
        setError(message || err?.message || 'Failed to create village');
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} disabled={isCreating} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50">Back</button>
            ) : <div/>}

            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="px-6 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors">Next</button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className="px-8 py-2 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 shadow-lg shadow-primary/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating && <Loader2 size={16} className="animate-spin" />}
                {isCreating ? 'Creating...' : 'Create Village'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Join By Code Modal ---

const JoinByCodeModal = ({
  isOpen,
  onClose,
  onJoin
}: {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (villageId: string, inviteCode: string) => Promise<void>;
}) => {
  const { t } = useI18n();
  const [villageId, setVillageId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!villageId.trim()) {
      setError('Please enter a village ID');
      return;
    }
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setIsJoining(true);
    setError('');
    try {
      await onJoin(villageId.trim(), inviteCode.trim().toUpperCase());
      // Reset form and close on success
      setVillageId('');
      setInviteCode('');
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      if (Array.isArray(message)) {
        setError(message.join(', '));
      } else {
        setError(message || err?.message || 'Failed to join village');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setVillageId('');
    setInviteCode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
              <Key size={20} className="text-primary" />
              {t('joinByCode')}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-6">{t('joinVillageHint')}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('villageId')}</label>
              <input
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none font-mono"
                placeholder="e.g. abc123-def456..."
                value={villageId}
                onChange={(e) => setVillageId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterInviteCode')}</label>
              <input
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none font-mono uppercase tracking-widest text-center text-lg"
                placeholder="ABC123"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleClose}
              disabled={isJoining}
              className="flex-1 px-4 py-3 text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isJoining || !villageId.trim() || !inviteCode.trim()}
              className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 shadow-lg shadow-primary/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isJoining && <Loader2 size={16} className="animate-spin" />}
              {isJoining ? t('joining') : t('join')}
            </button>
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
  onCreateClick,
  onJoinByCode
}: {
  onJoinVillage: (id: string) => void,
  villages: Village[],
  onCreateClick: () => void,
  onJoinByCode: () => void
}) => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Interest', 'Professional', 'Lifestyle', 'Technology'];
  
  // Filter out private villages from discovery
  const visibleVillages = villages.filter(v => !v.isPrivate);
  const filteredVillages = filter === 'All' 
    ? visibleVillages 
    : visibleVillages.filter(v => v.category === filter);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-12 pb-8 lg:pb-12">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-secondary mb-2">Explore the World</h1>
        <p className="text-gray-500">Find your tribe among {visibleVillages.length} active communities.</p>
      </div>

      {/* Quick Actions - Always visible at top */}
      <div className="flex gap-3 mb-6 animate-fade-in">
        <button
          onClick={onJoinByCode}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          <Key size={18} />
          <span>Join by Code</span>
        </button>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={18} />
          <span>Create Village</span>
        </button>
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
        
      </div>
    </div>
  );
};

// --- Village Components ---

const TownHall = ({
  village,
  onUpdateVillage,
  isOwner,
  onLeaveVillage,
  onTransferOwnership
}: {
  village: Village,
  onUpdateVillage: (updates: Partial<Village>) => void,
  isOwner: boolean,
  onLeaveVillage: () => void,
  onTransferOwnership: (newOwnerId: string) => Promise<void>
}) => {
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState(village.announcement || '');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const loadMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const result = await membershipService.getMembers(village.id);
      // Filter out the current owner (chief)
      setMembers(result.items.filter(m => m.role !== 'chief'));
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleTransfer = async (newOwnerId: string) => {
    setIsTransferring(true);
    try {
      await onTransferOwnership(newOwnerId);
      setShowTransferModal(false);
    } catch (err) {
      console.error('Transfer failed:', err);
      alert('Failed to transfer ownership');
    } finally {
      setIsTransferring(false);
    }
  };

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
          <TrendingUp size={20} className="text-primary" /> {useI18n().t('dataCenter')}
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
             <span className="text-gray-500 text-sm">{useI18n().t('totalCitizens')}</span>
             <span className="font-mono font-bold text-xl">{village.members}</span>
          </div>
           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
             <span className="text-gray-500 text-sm">{useI18n().t('activeToday')}</span>
             <span className="font-mono font-bold text-xl text-green-600">{Math.floor(village.members * 0.15)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
             <span className="text-gray-500 text-sm">{useI18n().t('treasury')}</span>
             <span className="font-mono font-bold text-xl text-yellow-600">{village.currencySymbol} 84.5k</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" /> {useI18n().t('constitution')}
        </h3>
        <div className="text-sm text-gray-600 space-y-2 bg-sand/30 p-4 rounded-xl border border-sand">
          <p>1. Be respectful to all villagers.</p>
          <p>2. No spamming in the public square.</p>
          <p>3. Contribute to the economy to earn {village.currencyName}.</p>
        </div>
        {isOwner && (
          <button className="mt-4 text-primary text-sm font-bold hover:underline">{useI18n().t('editRules')}</button>
        )}
      </div>
    </div>
    
    {isOwner ? (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-gray-500" /> {useI18n().t('adminSettings')}
          </h3>
         
         <div className="flex items-center justify-between py-4 border-b border-gray-100">
           <div>
             <div className="font-medium text-gray-800">{useI18n().t('privateVillage')}</div>
             <div className="text-xs text-gray-500">{useI18n().t('privateVillageHint')}</div>
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
               <div className="text-xs font-bold text-gray-400 uppercase">{useI18n().t('inviteCode')}</div>
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

         {/* Transfer Ownership Section */}
         <div className="mt-4 pt-4 border-t border-gray-100">
           <div className="flex items-center justify-between">
             <div>
               <div className="font-medium text-gray-800">Transfer Ownership</div>
               <div className="text-xs text-gray-500">Hand over chief role to another member</div>
             </div>
             <button
               onClick={() => {
                 setShowTransferModal(true);
                 loadMembers();
               }}
               className="px-4 py-2 text-amber-600 bg-amber-50 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-2"
             >
               <Crown size={16} />
               {useI18n().t('transfer')}
             </button>
           </div>
         </div>
      </div>
    ) : null}

    {/* Transfer Ownership Modal */}
    {showTransferModal && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowTransferModal(false)}>
        <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b bg-amber-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Crown size={24} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{useI18n().t('transferOwnership')}</h3>
                <p className="text-sm text-gray-500">{useI18n().t('transferHint')}</p>
              </div>
            </div>
          </div>

          <div className="p-4 max-h-80 overflow-y-auto">
            {isLoadingMembers ? (
              <div className="py-8 flex justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Users size={40} className="mx-auto mb-2 text-gray-300" />
                <p>No other members to transfer to</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(member => (
                  <button
                    key={member.user.id}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to transfer ownership to ${member.user.name}? You will become an Elder and they will become the Chief.`)) {
                        handleTransfer(member.user.id);
                      }
                    }}
                    disabled={isTransferring}
                    className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                  >
                    <img
                      src={member.localAvatar || member.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                      alt={member.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{member.nickname || member.user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                    </div>
                    <Crown size={18} className="text-amber-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => setShowTransferModal(false)}
              className="w-full py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Point Rules Configuration - Only for Chief */}
    {isOwner && (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Award size={20} className="text-yellow-500" /> {village.currencyName} Rules
        </h3>
        <p className="text-gray-500 text-sm mb-4">Set how many {village.currencyName} members earn for each action</p>

        <div className="space-y-3">
          {[
            { key: 'post', label: 'Create a Post', icon: '📝' },
            { key: 'comment', label: 'Leave a Comment', icon: '💬' },
            { key: 'rsvp', label: 'RSVP to Event', icon: '📅' },
            { key: 'like_received', label: 'Receive a Like', icon: '❤️' },
          ].map((rule) => (
            <div key={rule.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-xl">{rule.icon}</span>
                <span className="text-gray-700 font-medium">{rule.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={(village as any).pointRules?.[rule.key] ?? 0}
                  onChange={(e) => {
                    const newRules = { ...(village as any).pointRules, [rule.key]: parseInt(e.target.value) || 0 };
                    onUpdateVillage({ pointRules: newRules } as any);
                  }}
                  className="w-16 px-2 py-1 text-center font-mono font-bold text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-yellow-600 font-bold">{village.currencySymbol}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {!isOwner && (
      <div className="space-y-4">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center">
           <AlertCircle size={32} className="text-gray-400 mx-auto mb-2" />
           <h3 className="text-gray-600 font-bold mb-1">Restricted Area</h3>
           <p className="text-gray-400 text-sm">Only the Village Chief can access administrative settings.</p>
        </div>

        {/* Leave Village Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <LogOut size={20} className="text-red-500" /> Membership
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            If you no longer wish to be part of this village, you can leave at any time. You will lose access to all village content and your earned {village.currencyName}.
          </p>
          <button
            onClick={onLeaveVillage}
            className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Leave Village
          </button>
        </div>
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
    currentUserRole,
    events,
    isLoadingEvents,
    posts,
    isLoadingPosts,
    newPostContent,
    setNewPostContent,
    isSubmittingPost,
    handleCreatePost,
    handleLikePost,
    handleOpenComments,
    userAvatar,
    onApproveEvent,
    onRejectEvent,
    onRsvpEvent,
    onLoadEvents,
    userName,
    onLeaveVillage,
    onTransferOwnership
}: {
    village: Village,
    activeTab: string,
    onTabChange: (tab: string) => void,
    onUpdateVillage: (updates: Partial<Village>) => void,
    currentUserRole: string,
    events: VillageEvent[],
    isLoadingEvents: boolean,
    posts: Post[],
    isLoadingPosts: boolean,
    newPostContent: string,
    setNewPostContent: (content: string) => void,
    isSubmittingPost: boolean,
    handleCreatePost: () => void,
    handleLikePost: (postId: string) => void,
    handleOpenComments: (postId: string) => void,
    userAvatar: string,
    onApproveEvent: (eventId: string) => void,
    onRejectEvent: (eventId: string) => void,
    onRsvpEvent: (eventId: string, status: 'going' | 'interested' | 'not_going', registrationData?: { name: string; phone: string; note: string }) => void,
    onLoadEvents: () => void,
    userName?: string,
    onLeaveVillage: () => void,
    onTransferOwnership: (newOwnerId: string) => Promise<void>
}) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState<'all' | 'my'>('all');
  const [selectedEventDetail, setSelectedEventDetail] = useState<VillageEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'Offline' as 'Online' | 'Offline',
    location: '',
    date: '',
    time: '',
    coverImage: ''
  });
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  const isChief = currentUserRole?.toLowerCase() === 'chief';
  const isAdmin = isChief || currentUserRole?.toLowerCase() === 'elder';

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    if (eventFilter === 'my') {
      return events.filter(e => {
        const myRsvp = (e as any).myRsvp;
        return myRsvp === 'going' || myRsvp === 'interested';
      });
    }
    return events;
  }, [events, eventFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-sand lg:pl-20 pt-mobile-header lg:pt-0">
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
                  {currentUserRole && (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      currentUserRole === 'chief'
                        ? 'bg-amber-500 text-white'
                        : currentUserRole === 'elder'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-white'
                    }`}>
                      {currentUserRole === 'chief' && <Crown size={12} />}
                      {currentUserRole === 'elder' && <Shield size={12} />}
                      {currentUserRole === 'chief' ? 'Chief' : currentUserRole === 'elder' ? 'Elder' : 'Villager'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto w-full px-4 lg:px-8 pb-mobile-nav lg:pb-12">
            
            {/* Desktop Tabs (Sticky) */}
            <div className="hidden lg:flex sticky top-0 z-40 bg-sand/95 backdrop-blur-md border-b border-gray-200 mb-6 pt-4">
              <nav className="flex gap-8">
                {['Square', 'Citizens', 'Events', 'Town Hall', ...(isAdmin ? ['Admin'] : [])].map((tab) => {
                   const id = tab.toLowerCase().replace(' ', '');
                   const isAdminTab = tab === 'Admin';
                   return (
                    <button
                      key={tab}
                      onClick={() => onTabChange(id)}
                      className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeTab === id
                        ? isAdminTab ? 'border-amber-500 text-amber-600' : 'border-primary text-secondary'
                        : isAdminTab ? 'border-transparent text-amber-500 hover:text-amber-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {isAdminTab && <Shield size={14} />}
                      {tab}
                    </button>
                   );
                })}
              </nav>
            </div>

            {/* Mobile Title (In-flow for scrolling context) */}
            <div className="lg:hidden py-4">
               <div className="flex items-center gap-2 mb-1">
                 <h1 className="text-2xl font-bold text-secondary">{village.name}</h1>
                 {currentUserRole && (
                   <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                     currentUserRole === 'chief'
                       ? 'bg-amber-500 text-white'
                       : currentUserRole === 'elder'
                       ? 'bg-purple-500 text-white'
                       : 'bg-gray-200 text-gray-600'
                   }`}>
                     {currentUserRole === 'chief' && <Crown size={10} />}
                     {currentUserRole === 'elder' && <Shield size={10} />}
                     {currentUserRole === 'chief' ? 'Chief' : currentUserRole === 'elder' ? 'Elder' : 'Villager'}
                   </span>
                 )}
               </div>
               <p className="text-sm text-gray-500">{village.description}</p>
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
                       <img
                         src={userAvatar}
                         alt="Your avatar"
                         className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                       />
                       <div className="flex-1">
                          <input
                            className="w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                            placeholder={`What's happening in ${village.name}?`}
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCreatePost()}
                            disabled={isSubmittingPost}
                          />
                          <div className="flex justify-between mt-3">
                             <div className="flex gap-2 text-gray-400">
                                <button className="p-1.5 hover:bg-gray-100 rounded-md"><Camera size={18}/></button>
                                <button className="p-1.5 hover:bg-gray-100 rounded-md"><FileText size={18}/></button>
                             </div>
                             <button
                               onClick={handleCreatePost}
                               disabled={isSubmittingPost || !newPostContent.trim()}
                               className="bg-secondary text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                             >
                               {isSubmittingPost && <Loader2 size={14} className="animate-spin" />}
                               Post
                             </button>
                          </div>
                       </div>
                    </div>

                    {isLoadingPosts ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={32} className="animate-spin text-primary" />
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No posts yet</p>
                        <p className="text-sm">Be the first to share something!</p>
                      </div>
                    ) : (
                      posts.map(post => (
                        <FeedPost
                          key={post.id}
                          post={post}
                          onLike={handleLikePost}
                          onComment={handleOpenComments}
                        />
                      ))
                    )}
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

                    {/* Upcoming Events Preview */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Upcoming Events</h3>
                      <div className="space-y-3">
                        {events.slice(0, 2).map(event => (
                          <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => onTabChange('events')}>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Calendar size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-700 truncate">{event.title}</div>
                              <div className="text-xs text-gray-400">{event.date} • {event.time}</div>
                            </div>
                          </div>
                        ))}
                        {events.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-2">No upcoming events</p>
                        )}
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
                   <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-secondary">Events</h2>
                      <button
                        onClick={() => setIsCreateEventOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        <Plus size={16} /> Create Event
                      </button>
                   </div>

                   {/* Event Filter Tabs */}
                   <div className="flex gap-2 mb-4">
                     <button
                       onClick={() => setEventFilter('all')}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                         eventFilter === 'all'
                           ? 'bg-primary text-white'
                           : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                       }`}
                     >
                       All Events
                     </button>
                     <button
                       onClick={() => setEventFilter('my')}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                         eventFilter === 'my'
                           ? 'bg-green-500 text-white'
                           : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                       }`}
                     >
                       <CheckCircle size={14} />
                       My Events
                       {events.filter(e => (e as any).myRsvp === 'going' || (e as any).myRsvp === 'interested').length > 0 && (
                         <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                           eventFilter === 'my' ? 'bg-white/20' : 'bg-green-100 text-green-700'
                         }`}>
                           {events.filter(e => (e as any).myRsvp === 'going' || (e as any).myRsvp === 'interested').length}
                         </span>
                       )}
                     </button>
                   </div>

                   {!isAdmin && eventFilter === 'all' && (
                     <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
                       <Shield size={16} />
                       <span>Events you create will need approval from village admins before being visible to everyone.</span>
                     </div>
                   )}
                   {isLoadingEvents ? (
                     <div className="flex justify-center py-8">
                       <Loader2 size={32} className="animate-spin text-primary" />
                     </div>
                   ) : filteredEvents.length === 0 ? (
                     <div className="text-center py-12 text-gray-500">
                       <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                       {eventFilter === 'my' ? (
                         <>
                           <p className="text-lg font-medium">No events you're attending</p>
                           <p className="text-sm">RSVP to events to see them here!</p>
                           <button
                             onClick={() => setEventFilter('all')}
                             className="mt-4 text-primary font-medium hover:underline"
                           >
                             Browse all events
                           </button>
                         </>
                       ) : (
                         <>
                           <p className="text-lg font-medium">No events yet</p>
                           <p className="text-sm">Create the first event for this village!</p>
                         </>
                       )}
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {filteredEvents.map(event => (
                         <EventCard
                           key={event.id}
                           event={event}
                           isAdmin={isAdmin}
                           onApprove={onApproveEvent}
                           onReject={onRejectEvent}
                           onRsvp={onRsvpEvent}
                           onClick={() => setSelectedEventDetail(event)}
                         />
                       ))}
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'townhall' && (
                <TownHall
                  village={village}
                  onUpdateVillage={onUpdateVillage}
                  isOwner={isChief}
                  onLeaveVillage={onLeaveVillage}
                  onTransferOwnership={onTransferOwnership}
                />
              )}

              {activeTab === 'admin' && isAdmin && (
                <div className="space-y-6">
                  {/* Admin Header */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield size={28} />
                      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                    </div>
                    <p className="text-amber-100">Manage your village as {currentUserRole === 'chief' ? 'Chief' : 'Elder'}</p>
                  </div>

                  {/* Pending Events Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                      <Calendar size={20} className="text-amber-500" />
                      <h3 className="font-bold text-gray-800">Pending Events</h3>
                      <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {events.filter(e => e.status === 'pending').length} pending
                      </span>
                    </div>
                    <div className="divide-y">
                      {events.filter(e => e.status === 'pending').length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <CheckCircle size={40} className="mx-auto mb-2 text-green-400" />
                          <p>No pending events to review</p>
                        </div>
                      ) : (
                        events.filter(e => e.status === 'pending').map(event => (
                          <div key={event.id} className="p-4 flex items-start gap-4 hover:bg-gray-50">
                            <img
                              src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop'}
                              alt={event.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800">{event.title}</h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <User size={12} />
                                by {event.organizer?.name}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar size={12} />
                                {event.date} at {event.time}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => onApproveEvent(event.id)}
                                className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center gap-1"
                              >
                                <Check size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => onRejectEvent(event.id)}
                                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 flex items-center gap-1"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Users size={16} />
                        Members
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{village.members}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Calendar size={16} />
                        Total Events
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{events.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <CheckCircle size={16} className="text-green-500" />
                        Approved
                      </div>
                      <p className="text-2xl font-bold text-green-600">{events.filter(e => e.status === 'approved').length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Clock size={16} className="text-amber-500" />
                        Pending
                      </div>
                      <p className="text-2xl font-bold text-amber-600">{events.filter(e => e.status === 'pending').length}</p>
                    </div>
                  </div>

                  {/* Recent Activity - All Events */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                      <TrendingUp size={20} className="text-primary" />
                      <h3 className="font-bold text-gray-800">All Events</h3>
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                      {events.map(event => (
                        <div key={event.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                          <img
                            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop'}
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 truncate">{event.title}</h4>
                            <p className="text-xs text-gray-500">{event.date}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.status === 'approved' ? 'bg-green-100 text-green-700' :
                            event.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {event.status}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Users size={14} />
                            {event.attendees}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>

      <ContactCardModal member={selectedMember} onClose={() => setSelectedMember(null)} />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEventDetail}
        onClose={() => setSelectedEventDetail(null)}
        onRsvp={async (eventId, status, registrationData) => {
          await onRsvpEvent(eventId, status, registrationData);
          // Update the local state to reflect the new RSVP status
          if (selectedEventDetail && selectedEventDetail.id === eventId) {
            setSelectedEventDetail({
              ...selectedEventDetail,
              myRsvp: status,
              attendees: status === 'going' && !(selectedEventDetail as any).myRsvp?.includes('going')
                ? selectedEventDetail.attendees + 1
                : selectedEventDetail.attendees
            } as any);
          }
        }}
        userProfile={userName ? { name: userName, email: '' } : undefined}
      />

      {/* Create Event Modal */}
      {isCreateEventOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsCreateEventOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-primary to-blue-600">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Calendar size={20} />
                Create New Event
              </h3>
              <button onClick={() => setIsCreateEventOpen(false)} className="p-1 hover:bg-white/20 rounded-full text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {!isAdmin && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-start gap-2">
                  <Shield size={16} className="mt-0.5 shrink-0" />
                  <span>Your event will be submitted for approval by village admins before it becomes visible to all members.</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your event..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="eventType"
                      value="Offline"
                      checked={newEvent.type === 'Offline'}
                      onChange={() => setNewEvent(prev => ({ ...prev, type: 'Offline' }))}
                      className="text-primary focus:ring-primary"
                    />
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-sm">In Person</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="eventType"
                      value="Online"
                      checked={newEvent.type === 'Online'}
                      onChange={() => setNewEvent(prev => ({ ...prev, type: 'Online' }))}
                      className="text-primary focus:ring-primary"
                    />
                    <Video size={16} className="text-gray-500" />
                    <span className="text-sm">Online</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newEvent.type === 'Online' ? 'Meeting Link *' : 'Location *'}
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder={newEvent.type === 'Online' ? 'Zoom/Meet link or details' : 'Enter venue address'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image *
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={newEvent.coverImage}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  {newEvent.coverImage && (
                    <div className="relative rounded-lg overflow-hidden h-32 bg-gray-100">
                      <img
                        src={newEvent.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewEvent(prev => ({ ...prev, coverImage: '' }))}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Tip: Use images from Unsplash, e.g., https://images.unsplash.com/photo-...
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsCreateEventOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.coverImage) {
                    alert('Please fill in all required fields including cover image');
                    return;
                  }
                  setIsSubmittingEvent(true);
                  try {
                    const startTime = new Date(`${newEvent.date}T${newEvent.time}`).toISOString();
                    await eventService.create(village.id, {
                      title: newEvent.title,
                      description: newEvent.description,
                      coverImage: newEvent.coverImage,
                      type: newEvent.type,
                      location: newEvent.location,
                      startTime
                    });
                    setIsCreateEventOpen(false);
                    setNewEvent({ title: '', description: '', type: 'Offline', location: '', date: '', time: '', coverImage: '' });
                    onLoadEvents(); // Reload events after creation
                    alert(isAdmin ? 'Event created successfully!' : 'Event submitted for approval!');
                  } catch (err) {
                    console.error('Failed to create event:', err);
                    alert('Failed to create event');
                  } finally {
                    setIsSubmittingEvent(false);
                  }
                }}
                disabled={isSubmittingEvent}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingEvent ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    {isAdmin ? 'Create Event' : 'Submit for Approval'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Layout ---

const App = () => {
  // Auth state from store
  const { user, isAuthenticated, isLoading: authLoading, login, register, logout, checkAuth } = useAuthStore();

  // User profile (for local village identities)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    global: {
      id: '',
      name: '',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    local: {}
  });

  // App State
  const [villages, setVillages] = useState<Village[]>([]);
  const [myVillageIds, setMyVillageIds] = useState<Set<string>>(new Set());
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeVillageId, setActiveVillageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('square');
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinByCodeModalOpen, setIsJoinByCodeModalOpen] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Update userProfile when user changes
  useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        id: user.id,
        global: {
          id: user.globalId,
          name: user.name,
          email: user.email,
          avatar: user.avatar || prev.global.avatar
        }
      }));
    }
  }, [user]);

  // Load villages when authenticated
  const loadVillages = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingVillages(true);
    try {
      const response = await villageService.getAll();
      // Handle both array and paginated response formats
      const villageList = Array.isArray(response) ? response : (response.items || []);
      const mappedVillages: Village[] = villageList.map((v: any) => ({
        id: v.id,
        name: v.name,
        category: v.category,
        description: v.description || '',
        members: v.memberCount,
        online: Math.floor(v.memberCount * 0.1),
        coverImage: v.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
        icon: v.icon || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=100&q=80',
        currencyName: v.currencyName,
        currencySymbol: v.currencySymbol,
        isPrivate: v.isPrivate,
        isSemiPrivate: v.isSemiPrivate
      }));
      setVillages(mappedVillages);
    } catch (err) {
      console.error('Failed to load villages:', err);
    } finally {
      setIsLoadingVillages(false);
    }
  }, [isAuthenticated]);

  // Load user's memberships when authenticated
  const loadMyMemberships = useCallback(async () => {
    if (!isAuthenticated) {
      setMyVillageIds(new Set());
      return;
    }
    try {
      const memberships = await membershipService.getMyMemberships();
      const villageIds = new Set(memberships.map(m => m.villageId));
      setMyVillageIds(villageIds);
    } catch (err) {
      console.error('Failed to load memberships:', err);
      setMyVillageIds(new Set());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadVillages();
    loadMyMemberships();
  }, [loadVillages, loadMyMemberships]);

  // Load posts when active village changes
  const loadPosts = useCallback(async () => {
    if (!activeVillageId) {
      setPosts([]);
      return;
    }
    setIsLoadingPosts(true);
    try {
      const response = await postService.getPosts(activeVillageId);
      const mappedPosts: Post[] = response.items.map(p => ({
        id: p.id,
        author: {
          name: p.author.name,
          avatar: p.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          role: p.author.role
        },
        content: p.content,
        image: p.images?.[0],
        likes: p.likeCount,
        comments: p.commentCount,
        timestamp: new Date(p.createdAt).toLocaleDateString(),
        tags: p.tags,
        isLiked: p.isLiked
      }));
      setPosts(mappedPosts);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [activeVillageId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Events state
  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Load events when active village changes
  const loadEvents = useCallback(async () => {
    if (!activeVillageId) {
      setEvents([]);
      return;
    }
    setIsLoadingEvents(true);
    try {
      const response = await eventService.getEvents(activeVillageId);
      const mappedEvents: VillageEvent[] = response.items.map(e => ({
        id: e.id,
        title: e.title,
        date: new Date(e.startTime).toLocaleDateString(),
        time: new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: e.location,
        type: e.type,
        image: e.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80',
        organizer: {
          name: e.organizer.name,
          role: e.organizer.role || 'villager',
          avatar: e.organizer.avatar
        },
        attendees: e.attendeeCount,
        status: e.status,
        myRsvp: e.myRsvp,
        description: e.description
      } as any));
      setEvents(mappedEvents);
    } catch (err) {
      console.error('Failed to load events:', err);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [activeVillageId]);

  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab, loadEvents]);

  // Handle event approval
  const handleApproveEvent = async (eventId: string) => {
    try {
      await eventService.approve(eventId);
      loadEvents(); // Refresh the events list
    } catch (err) {
      console.error('Failed to approve event:', err);
    }
  };

  // Handle event rejection
  const handleRejectEvent = async (eventId: string) => {
    try {
      await eventService.reject(eventId);
      loadEvents(); // Refresh the events list
    } catch (err) {
      console.error('Failed to reject event:', err);
    }
  };

  // Handle event RSVP
  const handleRsvpEvent = async (
    eventId: string,
    status: 'going' | 'interested' | 'not_going',
    registrationData?: { name: string; phone: string; note: string }
  ) => {
    try {
      await eventService.rsvp(eventId, {
        status,
        name: registrationData?.name,
        phone: registrationData?.phone,
        note: registrationData?.note
      });
      // Update local state to reflect RSVP
      setEvents(prev => prev.map(e => {
        if (e.id === eventId) {
          const wasGoing = (e as any).myRsvp === 'going';
          const isNowGoing = status === 'going';
          return {
            ...e,
            myRsvp: status,
            attendees: wasGoing && !isNowGoing
              ? e.attendees - 1
              : !wasGoing && isNowGoing
                ? e.attendees + 1
                : e.attendees
          };
        }
        return e;
      }));
    } catch (err) {
      console.error('Failed to RSVP:', err);
    }
  };

  // Handle leave village
  const handleLeaveVillage = async () => {
    if (!activeVillageId) return;

    const confirmed = window.confirm('Are you sure you want to leave this village? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const villageIdToLeave = activeVillageId;
      await villageService.leave(villageIdToLeave);
      // Remove from myVillageIds
      setMyVillageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(villageIdToLeave);
        return newSet;
      });
      // Navigate back to village list
      setActiveVillageId(null);
      // Refresh villages list
      loadVillages();
    } catch (err: any) {
      console.error('Failed to leave village:', err);
      alert(err.response?.data?.message || 'Failed to leave village');
    }
  };

  // Handle transfer ownership
  const handleTransferOwnership = async (newOwnerId: string) => {
    if (!activeVillageId) return;

    try {
      await villageService.transferOwnership(activeVillageId, newOwnerId);
      // Update local role to elder (since we transferred ownership)
      setUserProfile(prev => ({
        ...prev,
        local: {
          ...prev.local,
          [activeVillageId]: {
            ...prev.local[activeVillageId],
            role: 'elder'
          }
        }
      }));
      // Refresh villages list
      loadVillages();
    } catch (err: any) {
      console.error('Failed to transfer ownership:', err);
      throw err; // Re-throw so the modal can show error
    }
  };

  // Determine current role based on active village
  const currentUserRole = activeVillageId
    ? (userProfile.local[activeVillageId]?.role || 'Villager')
    : 'Villager';

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  // Handle register
  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      await register({ email, password, name });
    } catch (err) {
      console.error('Register failed:', err);
      throw err;
    }
  };

  // Handle create post
  const handleCreatePost = async () => {
    if (!activeVillageId || !newPostContent.trim()) return;
    setIsSubmittingPost(true);
    try {
      const newPost = await postService.create(activeVillageId, {
        content: newPostContent.trim()
      });
      // Add to local state
      const mappedPost: Post = {
        id: newPost.id,
        author: {
          name: newPost.author.name,
          avatar: newPost.author.avatar || userProfile.global.avatar,
          role: newPost.author.role
        },
        content: newPost.content,
        likes: 0,
        comments: 0,
        timestamp: 'Just now',
        tags: newPost.tags
      };
      setPosts(prev => [mappedPost, ...prev]);
      setNewPostContent('');
    } catch (err) {
      console.error('Failed to create post:', err);
      alert('Failed to create post');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Handle like/unlike post
  const handleLikePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        await postService.unlike(postId);
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, isLiked: false, likes: p.likes - 1 } : p
        ));
      } else {
        await postService.like(postId);
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, isLiked: true, likes: p.likes + 1 } : p
        ));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Comment modal state
  const [selectedPostForComment, setSelectedPostForComment] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [commentsData, setCommentsData] = useState<Array<{id: string; author: {name: string; avatar?: string}; content: string; createdAt: string}>>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Handle open comments
  const handleOpenComments = async (postId: string) => {
    setSelectedPostForComment(postId);
    setIsLoadingComments(true);
    try {
      const comments = await postService.getComments(postId);
      setCommentsData(comments.map(c => ({
        id: c.id,
        author: { name: c.author.name, avatar: c.author.avatar },
        content: c.content,
        createdAt: new Date(c.createdAt).toLocaleDateString()
      })));
    } catch (err) {
      console.error('Failed to load comments:', err);
      setCommentsData([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Handle submit comment
  const handleSubmitComment = async () => {
    if (!selectedPostForComment || !commentContent.trim()) return;
    setIsSubmittingComment(true);
    try {
      const newComment = await postService.createComment(selectedPostForComment, {
        content: commentContent.trim()
      });
      setCommentsData(prev => [...prev, {
        id: newComment.id,
        author: { name: newComment.author.name, avatar: newComment.author.avatar },
        content: newComment.content,
        createdAt: 'Just now'
      }]);
      setCommentContent('');
      // Update comment count in posts
      setPosts(prev => prev.map(p =>
        p.id === selectedPostForComment ? { ...p, comments: p.comments + 1 } : p
      ));
    } catch (err) {
      console.error('Failed to submit comment:', err);
      alert('Failed to submit comment');
    } finally {
      setIsSubmittingComment(false);
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
  // Only show villages where user has a membership
  const myVillages = villages.filter(v => myVillageIds.has(v.id));

  const handleSelectVillage = async (id: string) => {
    setActiveVillageId(id);
    setActiveTab('square'); // Reset tab on switch
    window.scrollTo(0,0);

    // Fetch user's membership role for this village
    if (user?.id) {
      try {
        const membership = await membershipService.getMember(id, user.id);
        // User is already a member
        handleUpdateLocalProfile(id, {
          nickname: membership.nickname || userProfile.global.name,
          bio: membership.bio || 'New Villager',
          role: membership.role,
          avatar: membership.localAvatar,
          joinedAt: membership.joinedAt
            ? new Date(membership.joinedAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          privacy: membership.privacy || {
            showEmail: true,
            showPhone: false,
            showLocation: true,
            showSocials: true,
          },
        });
      } catch (err) {
        // User is not a member yet, try to join the village
        const tryJoinVillage = async (inviteCode?: string) => {
          try {
            await villageService.join(id, inviteCode ? { inviteCode } : undefined);
            // Successfully joined, add to myVillageIds
            setMyVillageIds(prev => new Set([...prev, id]));
            // Fetch the new membership
            const membership = await membershipService.getMember(id, user.id);
            handleUpdateLocalProfile(id, {
              nickname: membership.nickname || userProfile.global.name,
              bio: membership.bio || 'New Villager',
              role: membership.role || 'villager',
              avatar: membership.localAvatar,
              joinedAt: membership.joinedAt
                ? new Date(membership.joinedAt).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              privacy: membership.privacy || {
                showEmail: true,
                showPhone: false,
                showLocation: true,
                showSocials: true,
              },
            });
            return true;
          } catch (joinErr: any) {
            const errorMessage = joinErr?.response?.data?.message || '';
            // Check if it requires invite code
            if (errorMessage.includes('invite code') || errorMessage.includes('Invalid invite')) {
              const code = window.prompt('This is a private village. Please enter the invite code:');
              if (code) {
                return tryJoinVillage(code);
              } else {
                setActiveVillageId(null);
                return false;
              }
            }
            console.error('Failed to join village:', joinErr);
            alert(errorMessage || 'Failed to join this village');
            setActiveVillageId(null);
            return false;
          }
        };
        await tryJoinVillage();
      }
    }
  };

  const handleUpdateVillage = (id: string, updates: Partial<Village>) => {
    setVillages(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }

  const handleGoHome = () => {
    setActiveVillageId(null);
  };

  // Handle joining a village by invite code (callback for modal)
  const handleJoinByCode = async (villageId: string, inviteCode: string) => {
    // Try to join with the invite code
    await villageService.join(villageId, { inviteCode });

    // Successfully joined
    setMyVillageIds(prev => new Set([...prev, villageId]));

    // Reload villages and select it
    await loadVillages();
    await loadMyMemberships();
    setActiveVillageId(villageId);
  };

  const handleCreateVillage = async (data: any) => {
    try {
      const created = await villageService.create({
        name: data.name,
        description: data.description || 'A new community',
        category: data.category || 'Interest',
        currencyName: data.currencyName,
        currencySymbol: data.currencySymbol,
        visibility: data.privacy === 'private' ? 'private' : 'public'
      });

      const newVillage: Village = {
        id: created.id,
        name: created.name,
        category: created.category,
        description: created.description || '',
        announcement: 'Welcome to our new village!',
        members: created.memberCount || 1,
        online: 1,
        coverImage: created.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
        icon: created.icon || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=100&q=80',
        currencyName: created.currencyName,
        currencySymbol: created.currencySymbol,
        isPrivate: (created as any).visibility === 'private'
      };

      setVillages(prev => [...prev, newVillage]);
      // Add to user's village IDs
      setMyVillageIds(prev => new Set([...prev, newVillage.id]));

      // Fetch membership from backend to get correct role
      if (user?.id) {
        try {
          const membership = await membershipService.getMember(newVillage.id, user.id);
          handleUpdateLocalProfile(newVillage.id, {
            nickname: membership.nickname || userProfile.global.name,
            role: membership.role === 'chief' ? 'Chief' : membership.role === 'core_member' ? 'Core Member' : 'Villager',
            bio: membership.bio || 'Founder of this village',
            joinedAt: new Date(membership.joinedAt).toISOString().split('T')[0],
            privacy: membership.privacy || { showEmail: true, showPhone: true, showLocation: true, showSocials: true }
          });
        } catch (err) {
          console.error('Failed to fetch membership:', err);
          // Fallback to default Chief role
          handleUpdateLocalProfile(newVillage.id, {
            nickname: userProfile.global.name,
            role: 'Chief',
            bio: 'Founder of this village',
            joinedAt: new Date().toISOString().split('T')[0],
            privacy: { showEmail: true, showPhone: true, showLocation: true, showSocials: true }
          });
        }
      }

      // Close modal and navigate to new village
      setIsCreateModalOpen(false);
      setActiveVillageId(newVillage.id);
      setActiveTab('square');
    } catch (err) {
      console.error('Failed to create village:', err);
      throw err; // Re-throw so the modal can catch and display the error
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} onRegister={handleRegister} />;
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
        onLogout={logout}
      />

      {/* Mobile Drawer (Village Switcher) */}
      <VillageSwitcherDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        villages={myVillages}
        activeVillageId={activeVillageId}
        onSelectVillage={handleSelectVillage}
        onGoHome={handleGoHome}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="min-h-screen">
        {activeVillageId && activeVillage ? (
          <>
            <VillageView
              village={activeVillage}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onUpdateVillage={(updates) => handleUpdateVillage(activeVillage.id, updates)}
              currentUserRole={currentUserRole}
              events={events}
              isLoadingEvents={isLoadingEvents}
              posts={posts}
              isLoadingPosts={isLoadingPosts}
              newPostContent={newPostContent}
              setNewPostContent={setNewPostContent}
              isSubmittingPost={isSubmittingPost}
              handleCreatePost={handleCreatePost}
              handleLikePost={handleLikePost}
              handleOpenComments={handleOpenComments}
              userAvatar={user?.avatar || '/default-avatar.png'}
              onApproveEvent={handleApproveEvent}
              onRejectEvent={handleRejectEvent}
              onRsvpEvent={handleRsvpEvent}
              onLoadEvents={loadEvents}
              userName={user?.name}
              onLeaveVillage={handleLeaveVillage}
              onTransferOwnership={handleTransferOwnership}
            />
            {/* Mobile Bottom Nav (Only inside a Village) */}
            <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </>
        ) : (
          <div className="lg:pl-20 min-h-screen pt-mobile-header lg:pt-0">
            <HomeView
              onJoinVillage={handleSelectVillage}
              villages={villages}
              onCreateClick={() => setIsCreateModalOpen(true)}
              onJoinByCode={() => setIsJoinByCodeModalOpen(true)}
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
      <JoinByCodeModal
        isOpen={isJoinByCodeModalOpen}
        onClose={() => setIsJoinByCodeModalOpen(false)}
        onJoin={handleJoinByCode}
      />

      {/* Comments Modal */}
      {selectedPostForComment && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPostForComment(null)}>
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Comments</h3>
              <button onClick={() => setSelectedPostForComment(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : commentsData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No comments yet. Be the first!</p>
                </div>
              ) : (
                commentsData.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      alt={comment.author.name}
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-xl px-3 py-2">
                        <p className="font-semibold text-sm">{comment.author.name}</p>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-2">{comment.createdAt}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                disabled={isSubmittingComment}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleSubmitComment}
                disabled={isSubmittingComment || !commentContent.trim()}
                className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold disabled:opacity-50 flex items-center gap-1"
              >
                {isSubmittingComment && <Loader2 size={14} className="animate-spin" />}
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root')!;
const root = (container as any)._reactRoot || createRoot(container);
(container as any)._reactRoot = root;
root.render(<I18nProvider><App /></I18nProvider>);
