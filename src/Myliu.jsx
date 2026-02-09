import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Heart, MessageCircle, User, Eye, Search, Bell, X, Send, Camera, Settings, MapPin, Shield, CreditCard, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { sendVerificationEmail } from './emailService';

const PazintysPlatforma = () => {
  // Ref kad išvengtume begalinio loop su useEffect
  const isInitialMount = useRef(true);
  const hasLoadedFromStorage = useRef(false);
  const hasRestoredFromBackup = useRef(false);
  const [currentView, setCurrentView] = useState('nariai');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState('manoPasirinkimai');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [credits, setCredits] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [totalMessagesSent, setTotalMessagesSent] = useState(0); // Išsiųstų žinučių skaičius
  const TRIAL_MESSAGES = 100; // Bandomojo laikotarpio žinučių skaičius
  const [freeMessages, setFreeMessages] = useState({}); // { profileId: count } - nemokamos žinutės kiekvienam nariui
  const [meetingProposals, setMeetingProposals] = useState(new Set()); // Profile IDs, kuriems siųstas susitikimo pasiūlymas
  const [showSettings, setShowSettings] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [isRegistration, setIsRegistration] = useState(false);
  // Atkurti isLoggedIn iš localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('myliu_isLoggedIn') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerFormKey, setRegisterFormKey] = useState(0); // keičiamas atidarant – forma remountinama tuščia
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginFormKey, setLoginFormKey] = useState(0); // keičiamas atidarant – forma tuščia
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [storedVerificationCode, setStoredVerificationCode] = useState(null); // Store the generated code for verification
  const [showVerification, setShowVerification] = useState(false);
  const [verificationSentTo, setVerificationSentTo] = useState([]); // Array of 'email' and/or 'phone'
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [changePhoneInput, setChangePhoneInput] = useState('');
  const [changePhonePassword, setChangePhonePassword] = useState('');
  const [changePhoneVerificationCode, setChangePhoneVerificationCode] = useState('');
  const [showChangePhoneVerification, setShowChangePhoneVerification] = useState(false);
  // Atkurti profileComplete iš localStorage
  const [profileComplete, setProfileComplete] = useState(() => {
    try {
      return localStorage.getItem('myliu_profileComplete') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showProfileForm, setShowProfileForm] = useState(false); // Anketos modalas po registracijos
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [changePasswordCurrent, setChangePasswordCurrent] = useState('');
  const [changePasswordNew, setChangePasswordNew] = useState('');
  const [changePasswordConfirm, setChangePasswordConfirm] = useState('');
  const [changeEmailNew, setChangeEmailNew] = useState('');
  const [changeEmailPassword, setChangeEmailPassword] = useState('');
  const [showCustomHobbyInput, setShowCustomHobbyInput] = useState(false);
  const [customHobbyText, setCustomHobbyText] = useState('');
  const [showCustomEroticInput, setShowCustomEroticInput] = useState(false);
  const [customEroticText, setCustomEroticText] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedImageIndex, setExpandedImageIndex] = useState(null);
  
  // Tooltip states
  const [showLifeWithoutLimitsTooltip, setShowLifeWithoutLimitsTooltip] = useState(false);
  const [showLogoHeartTooltip, setShowLogoHeartTooltip] = useState(false);
  const [showMeetingTooltip, setShowMeetingTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, profileId: null });
  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0, transform: 'translateX(-50%)' });
  const [savedSections, setSavedSections] = useState(new Set()); // Seka, kurios sekcijos išsaugotos
  
  // Photo editor state
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [currentEditingPhoto, setCurrentEditingPhoto] = useState(null);
  const [isEditingRegistrationPhoto, setIsEditingRegistrationPhoto] = useState(false);
  const [photoEditorData, setPhotoEditorData] = useState({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    originalImage: null
  });

  // PHOTO PROCESSING FUNCTION
  const processAndResizeImage = (file, cropData = null) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Target dimensions
          const targetWidth = 400;
          const targetHeight = 500;
          const targetRatio = targetWidth / targetHeight; // 0.8
          
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;
          
          // If crop data is provided, use it
          if (cropData) {
            const { zoom, offsetX, offsetY } = cropData;
            
            // Calculate source dimensions based on zoom
            sourceWidth = img.width / zoom;
            sourceHeight = img.height / zoom;
            
            // Ensure aspect ratio
            if (sourceWidth / sourceHeight > targetRatio) {
              sourceWidth = sourceHeight * targetRatio;
            } else {
              sourceHeight = sourceWidth / targetRatio;
            }
            
            // Calculate source position with offset
            sourceX = (img.width - sourceWidth) / 2 + offsetX;
            sourceY = (img.height - sourceHeight) / 2 + offsetY;
            
            // Clamp to image bounds
            sourceX = Math.max(0, Math.min(sourceX, img.width - sourceWidth));
            sourceY = Math.max(0, Math.min(sourceY, img.height - sourceHeight));
          } else {
            // Default center crop
            const sourceRatio = sourceWidth / sourceHeight;
            
            if (sourceRatio > targetRatio) {
              sourceWidth = sourceHeight * targetRatio;
              sourceX = (img.width - sourceWidth) / 2;
            } else {
              sourceHeight = sourceWidth / targetRatio;
              sourceY = (img.height - sourceHeight) / 2;
            }
          }
          
          // Set canvas to target size
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          // Draw cropped and resized image
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, targetWidth, targetHeight
          );
          
          // Convert to base64 with compression
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          resolve(base64);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const openPhotoEditor = (file, forRegistration = false) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setCurrentEditingPhoto(file);
        setIsEditingRegistrationPhoto(forRegistration);
        setPhotoEditorData({
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          originalImage: e.target.result,
          imageWidth: img.width,
          imageHeight: img.height
        });
        setShowPhotoEditor(true);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  const saveEditedPhoto = async () => {
    try {
      setUploadingPhotos(true);
      setShowPhotoEditor(false);
      
      const processedPhoto = await processAndResizeImage(
        currentEditingPhoto,
        {
          zoom: photoEditorData.zoom,
          offsetX: photoEditorData.offsetX,
          offsetY: photoEditorData.offsetY
        }
      );
      
      if (isEditingRegistrationPhoto) {
        // Save to registration form
        const newPhotos = [...(registrationData.photos || []), processedPhoto];
        setRegistrationData({
          ...registrationData,
          photos: newPhotos
        });
        // Also update user profile if editing existing profile
        if (!isRegistration) {
          setUserProfile({
            ...userProfile,
            photos: newPhotos
          });
        }
      } else {
        // Save to user profile
      const currentPhotos = userProfile.photos || [];
      setUserProfile({
        ...userProfile,
        photos: [...currentPhotos, processedPhoto]
      });
      }
      
      setUploadingPhotos(false);
      
      // Reset editor
      setCurrentEditingPhoto(null);
      setIsEditingRegistrationPhoto(false);
      setPhotoEditorData({ zoom: 1, offsetX: 0, offsetY: 0, originalImage: null });
    } catch (error) {
      console.error('Klaida apdorojant nuotrauką:', error);
      setUploadingPhotos(false);
      alert('Klaida įkeliant nuotrauką');
    }
  };
  
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxPhotos = 6;
    const currentPhotos = userProfile.photos || [];
    
    console.log('📸 Photo upload started');
    console.log('Files selected:', files.length);
    
    if (files.length === 0) {
      alert('Nepasirinkote jokių failų');
      return;
    }
    
    if (currentPhotos.length >= maxPhotos) {
      alert(`Galite turėti daugiausiai ${maxPhotos} nuotraukas`);
      return;
    }
    
    // Open editor for first photo
    openPhotoEditor(files[0]);
    
    // Reset file input
    e.target.value = '';
  };

  const deletePhoto = (profileSetter, currentProfile, photoIndex) => {
    const newPhotos = currentProfile.photos.filter((_, index) => index !== photoIndex);
    profileSetter({
      ...currentProfile,
      photos: newPhotos
    });
  };
  
  // Atkurti userProfile – pirmiausia iš allMembers (jei yra email), tada iš localStorage
  const [userProfile, setUserProfile] = useState(() => {
    try {
      // Pirmiausia patikrinti, ar yra email localStorage (iš ankstesnės sesijos)
      const savedEmail = localStorage.getItem('myliu_lastLoginEmail');
      if (savedEmail) {
        const membersJson = localStorage.getItem('myliu_allMembers');
        if (membersJson) {
          const members = JSON.parse(membersJson);
          const member = Array.isArray(members) && members.find(m => m && m.email === savedEmail);
          if (member) {
            // Atkurti VISUS duomenis iš allMembers
            const restored = {
              name: member.name || '',
              age: member.age || 18,
              city: member.city || '',
              street: member.street || '',
              house: member.house || '',
              gender: member.gender || '',
              bodyType: member.bodyType || 'Vidutinis',
              height: member.height || '175',
              hairColor: member.hairColor || '',
              eyeColor: member.eyeColor || '',
              civilStatus: member.civilStatus || '',
              bio: member.bio || '',
              interests: Array.isArray(member.interests) ? member.interests : [],
              eroticInterests: Array.isArray(member.eroticInterests) ? member.eroticInterests : [],
              photos: Array.isArray(member.photos) ? member.photos : [],
              smoking: member.smoking || 'Ne',
              tattoos: member.tattoos || 'Ne',
              piercing: member.piercing || 'Ne',
              phone: member.phone || '',
              email: savedEmail,
              isOnline: member.isOnline !== undefined ? member.isOnline : true
            };
            hasLoadedFromStorage.current = true;
            return restored;
          }
        }
      }
      // Jei allMembers nerastas, bandoma iš userProfile localStorage
      let saved = localStorage.getItem('myliu_userProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && (parsed.name !== 'Tomas' || parsed.photos?.length > 0 || parsed.bio)) {
          hasLoadedFromStorage.current = true;
          return parsed;
        }
      }
      saved = localStorage.getItem('myliu_userProfile_backup');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && (parsed.name !== 'Tomas' || parsed.photos?.length > 0 || parsed.bio)) {
          localStorage.setItem('myliu_userProfile', JSON.stringify(parsed));
          hasLoadedFromStorage.current = true;
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading userProfile from localStorage:', e);
    }
    return {
      name: 'Tomas',
      age: 28,
      city: 'Vilnius',
      gender: 'Vyras',
      bodyType: 'Vidutinis',
      height: '180',
      hairColor: 'Šviesiaplaukis',
      eyeColor: 'Mėlyna',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Mėgstu keliauti, fotografuoti ir aktyviai leisti laiką.',
      interests: ['Kelionės', 'Fotografija', 'Sportas', 'Muzika'],
      photos: [],
      isOnline: true,
      street: '',
      house: '',
      eroticInterests: [],
      phone: '+37061234567',
      email: ''
    };
  });
  
  // Registration form state - tik iš localStorage (nenaudoti userProfile čia – gali kilti "before initialization" klaida)
  const [registrationData, setRegistrationData] = useState(() => {
    try {
      let saved = localStorage.getItem('myliu_registrationData');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.photos?.length > 0 || parsed.bio) {
          return parsed;
        }
      }
      saved = localStorage.getItem('myliu_registrationData_backup');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.photos?.length > 0 || parsed.bio) {
          localStorage.setItem('myliu_registrationData', JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading registrationData from localStorage:', e);
    }
    return {
      photos: [],
      name: '',
      gender: '',
      age: '',
      city: '',
      street: '',
      house: '',
      height: '',
      bodyType: '',
      civilStatus: '',
      hairColor: '',
      eyeColor: '',
      bio: '',
      hobbies: [],
      eroticInterests: []
    };
  });
  
  // Automatiškai išsaugoti userProfile į localStorage – BET NIEKADA neperrašyti su tuščiais duomenimis
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      // Išsaugoti tik jei yra REALIUS duomenys (ne default "Tomas" arba tuščias)
      const hasRealData = (userProfile.name && userProfile.name !== 'Tomas' && userProfile.name.trim()) || 
                          (Array.isArray(userProfile.photos) && userProfile.photos.length > 0) || 
                          (userProfile.bio && userProfile.bio.trim()) ||
                          profileComplete;
      if (hasRealData) {
        // Patikrinti, ar esamas localStorage profilis turi daugiau duomenų nei naujas
        const existing = localStorage.getItem('myliu_userProfile');
        if (existing) {
          try {
            const existingParsed = JSON.parse(existing);
            const existingHasPhotos = Array.isArray(existingParsed.photos) && existingParsed.photos.length > 0;
            const newHasPhotos = Array.isArray(userProfile.photos) && userProfile.photos.length > 0;
            // Jei esamas turi nuotraukas, bet naujas neturi – NEperrašyti (apsauga nuo praradimo)
            if (existingHasPhotos && !newHasPhotos && existingParsed.name && existingParsed.name !== 'Tomas') {
              console.warn('⚠️ Neišsaugojame userProfile: esamas profilis turi daugiau duomenų (nuotraukos)');
              return;
            }
          } catch (e) {
            // Jei parse klaida, tęsti su išsaugojimu
          }
        }
        localStorage.setItem('myliu_userProfile', JSON.stringify(userProfile));
        localStorage.setItem('myliu_userProfile_backup', JSON.stringify({
          ...userProfile,
          savedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.error('Error saving userProfile to localStorage:', e);
    }
  }, [userProfile, profileComplete]);

  // Vienkartinis atkūrimas iš backup – kuo anksčiau, kad anketų duomenys neišnyktų
  useLayoutEffect(() => {
    if (hasRestoredFromBackup.current) return;
    hasRestoredFromBackup.current = true;
    try {
      // 1) allMembers – visada sujungti su backup (pilnesni duomenys iš backup)
      const mainMembersJson = localStorage.getItem('myliu_allMembers');
      const backupMembersJson = localStorage.getItem('myliu_allMembers_backup');
      let mainArr = [];
      try {
        if (mainMembersJson) {
          const p = JSON.parse(mainMembersJson);
          mainArr = Array.isArray(p) ? p.filter(m => m && m.id) : [];
        }
      } catch (_) {}
      let backupArr = [];
      if (backupMembersJson) {
        try {
          const bp = JSON.parse(backupMembersJson);
          if (Array.isArray(bp)) backupArr = bp.filter(m => m && m.id);
          else if (bp && Array.isArray(bp.members)) backupArr = (bp.members || []).filter(m => m && m.id);
        } catch (_) {}
      }
      if (backupArr.length > 0) {
        // Backup kaip pagrindas – atstatome savarankiškai užsiregistravusių anketas iš backup
        const merged = mergeMembersWithBackup(backupArr, mainArr);
        if (merged.length > 0) {
          localStorage.setItem('myliu_allMembers', JSON.stringify(merged));
          setAllMembers(merged);
        }
      }

      // 2) userProfile – atkurti iš backup arba iš allMembers pagal lastLoginEmail
      const lastEmail = localStorage.getItem('myliu_lastLoginEmail');
      const mainProfileJson = localStorage.getItem('myliu_userProfile');
      const backupProfileJson = localStorage.getItem('myliu_userProfile_backup');
      let mainProfile = null;
      let backupProfile = null;
      try {
        if (mainProfileJson) mainProfile = JSON.parse(mainProfileJson);
      } catch (_) {}
      try {
        if (backupProfileJson) {
          const bp = JSON.parse(backupProfileJson);
          backupProfile = bp && typeof bp === 'object' && !Array.isArray(bp.members) ? bp : null;
        }
      } catch (_) {}
      const mainPhotos = mainProfile ? (Array.isArray(mainProfile.photos) ? mainProfile.photos.length : 0) : 0;
      const mainNoName = !mainProfile || !mainProfile.name || !mainProfile.name.trim() || mainProfile.name === 'Tomas';
      const backupPhotos = backupProfile ? (Array.isArray(backupProfile.photos) ? backupProfile.photos.length : 0) : 0;
      const backupHasName = backupProfile && backupProfile.name && backupProfile.name.trim() && backupProfile.name !== 'Tomas';

      if (backupProfile && (backupPhotos > mainPhotos || (backupHasName && mainNoName))) {
        const restored = { ...(mainProfile || {}), ...backupProfile };
        delete restored.savedAt;
        localStorage.setItem('myliu_userProfile', JSON.stringify(restored));
        setUserProfile(restored);
      } else if (lastEmail && mainNoName && mainPhotos === 0) {
        // Prisijungęs vartotojas, bet profilis tuščias – atkurti iš allMembers (jau sumerged)
        const membersJson = localStorage.getItem('myliu_allMembers');
        const members = membersJson ? JSON.parse(membersJson) : [];
        const member = Array.isArray(members) && members.find(m => m && m.email === lastEmail);
        if (member && (member.photos?.length > 0 || (member.name && member.name.trim()))) {
          const restoredProfile = {
            name: member.name || '',
            age: member.age || 18,
            city: member.city || '',
            street: member.street || '',
            house: member.house || '',
            gender: member.gender || '',
            bodyType: member.bodyType || 'Vidutinis',
            height: member.height || '175',
            hairColor: member.hairColor || '',
            eyeColor: member.eyeColor || '',
            civilStatus: member.civilStatus || '',
            bio: member.bio || '',
            interests: Array.isArray(member.interests) ? member.interests : [],
            eroticInterests: Array.isArray(member.eroticInterests) ? member.eroticInterests : [],
            photos: Array.isArray(member.photos) ? member.photos : [],
            smoking: member.smoking || 'Ne',
            tattoos: member.tattoos || 'Ne',
            piercing: member.piercing || 'Ne',
            phone: member.phone || '',
            email: lastEmail,
            isOnline: member.isOnline !== undefined ? member.isOnline : true
          };
          localStorage.setItem('myliu_userProfile', JSON.stringify(restoredProfile));
          setUserProfile(restoredProfile);
          localStorage.setItem('myliu_userProfile_backup', JSON.stringify({ ...restoredProfile, savedAt: new Date().toISOString() }));
        }
      }
    } catch (e) {
      console.error('Error restoring from backup:', e);
    }
  }, []);

  // Automatiškai išsaugoti registrationData į localStorage kai jis keičiasi (VISADA)
  useEffect(() => {
    // Praleisti pirmą render'į (initial mount)
    if (isInitialMount.current) {
      return;
    }
    
    try {
      // Išsaugoti tik jei yra bent koks turinys
      const hasData = registrationData.name || 
                      registrationData.photos?.length > 0 || 
                      registrationData.bio ||
                      profileComplete;
      if (hasData) {
        localStorage.setItem('myliu_registrationData', JSON.stringify(registrationData));
        // Backup
        localStorage.setItem('myliu_registrationData_backup', JSON.stringify({
          ...registrationData,
          savedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.error('Error saving registrationData to localStorage:', e);
    }
  }, [registrationData, profileComplete]);

  // Kai registracijos modalas tik atsidaro – išvalyti formą prieš paint (useLayoutEffect)
  const prevShowRegisterModal = useRef(false);
  useLayoutEffect(() => {
    if (showRegisterModal && !prevShowRegisterModal.current) {
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setVerificationCode('');
      setStoredVerificationCode(null);
      setVerificationSentTo([]);
      setShowVerification(false);
    }
    prevShowRegisterModal.current = showRegisterModal;
  }, [showRegisterModal]);

  // Kai prisijungimo modalas tik atsidaro – išvalyti formą (slaptažodžių atmintis vėliau gali užpildyti)
  const prevShowLoginModal = useRef(false);
  useLayoutEffect(() => {
    if (showLoginModal && !prevShowLoginModal.current) {
      setLoginEmailOrPhone('');
      setLoginPassword('');
    }
    prevShowLoginModal.current = showLoginModal;
  }, [showLoginModal]);

  // Automatiškai sukurti pokalbį ir nustatyti activeChat kai atidaromas profilis
  useEffect(() => {
    if (selectedProfile && selectedProfile.id !== 'my-profile') {
      // Patikrinti, ar profilis užpildytas
      if (!profileComplete) {
        return; // Neleisti sukurti pokalbio jei profilis neužpildytas
      }
      
      // Sukurti pokalbį jei jo nėra
      const existingConv = conversations.find(c => c.profileId === selectedProfile.id);
      if (!existingConv) {
        setConversations(prev => [{
          profileId: selectedProfile.id,
          messages: [],
          lastMessageTime: new Date()
        }, ...prev]);
      }
      
      // Nustatyti activeChat
      if (activeChat !== selectedProfile.id) {
        setActiveChat(selectedProfile.id);
      }
    }
  }, [selectedProfile?.id, profileComplete]);

  // Auto-scroll į chat sekciją, kai ji atsidaro
  useEffect(() => {
    if (activeChat && selectedProfile && activeChat === selectedProfile.id) {
      const timer = setTimeout(() => {
        const chatSection = document.getElementById('chat-section');
        if (chatSection) {
          chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeChat, selectedProfile]);

  // Uždaryti rūšiavimo dropdown paspaudus už jo ribų
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSort && !event.target.closest('.sort-dropdown-container')) {
        setShowSort(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSort]);

  // Auto-scroll į apačią pokalbio lange, kai keičiasi žinutės
  useEffect(() => {
    if (activeChat && selectedProfile && activeChat === selectedProfile.id) {
      const timer = setTimeout(() => {
        const messagesContainer = document.getElementById('chat-messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeChat, selectedProfile?.id]);

  // Adjust tooltip position to stay within viewport boundaries
  useEffect(() => {
    if (showMeetingTooltip && tooltipPosition.left > 0) {
      if (typeof window === 'undefined') return;
      
      const adjustTooltipPosition = () => {
        try {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const tooltipWidth = 250;
          const padding = 8;
          
          let adjustedLeft = tooltipPosition.left;
          let adjustedTop = tooltipPosition.top + 8;
          let adjustedTransform = 'translateX(-50%)';
          
          // Adjust horizontal position
          if (adjustedLeft < tooltipWidth / 2 + padding) {
            adjustedLeft = tooltipWidth / 2 + padding;
            adjustedTransform = 'translateX(0)';
          } else if (adjustedLeft > viewportWidth - tooltipWidth / 2 - padding) {
            adjustedLeft = viewportWidth - tooltipWidth / 2 - padding;
            adjustedTransform = 'translateX(-100%)';
          }
          
          // Adjust vertical position if tooltip goes beyond bottom
          if (adjustedTop + 80 > viewportHeight - padding) {
            adjustedTop = Math.max(padding, tooltipPosition.top - 80 - 8);
          }
          
          setTooltipStyle({ 
            top: Math.max(padding, Math.min(adjustedTop, viewportHeight - 80 - padding)), 
            left: adjustedLeft, 
            transform: adjustedTransform 
          });
        } catch (error) {
          console.error('Error adjusting tooltip position:', error);
          // Fallback to default position
          setTooltipStyle({ 
            top: tooltipPosition.top + 8, 
            left: tooltipPosition.left, 
            transform: 'translateX(-50%)' 
          });
        }
      };
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(adjustTooltipPosition);
      
      const handleResize = () => {
        requestAnimationFrame(adjustTooltipPosition);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } else {
      // Reset tooltip style when tooltips are hidden
      setTooltipStyle({ top: 0, left: 0, transform: 'translateX(-50%)' });
    }
  }, [tooltipPosition, showMeetingTooltip]);

  // Sync registrationData when userProfile changes (bet TIK jei registrationData tuščias ir nėra localStorage)
  // SVARBU: Šis useEffect NIEKADA neperrašo esamų duomenų!
  // Nedaryti sync kai atidaryta registracijos forma – naujas narys turi matyti tuščią anketą
  useEffect(() => {
    // Praleisti pirmą render'į
    if (isInitialMount.current) {
      return;
    }
    if (showRegisterModal || showVerification) {
      return;
    }
    
    // Ne sync'inti jei jau yra localStorage duomenys arba registrationData jau turi duomenis
    try {
      const hasLocalStorageData = localStorage.getItem('myliu_registrationData');
      const hasRegistrationData = registrationData.name || 
                                  registrationData.photos?.length > 0 || 
                                  registrationData.bio ||
                                  registrationData.gender;
      
      // SVARBU: Jei yra bet kokie duomenys, NIEKADA neperrašyti!
      if (hasLocalStorageData || hasRegistrationData || profileComplete || hasLoadedFromStorage.current) {
        return; // Neperrašyti esamų duomenų
      }
    } catch (e) {
      // Jei klaida, ne sync'inti
      return;
    }
    
    // Sync'inti tik jei registrationData visiškai tuščias IR userProfile turi duomenis
    const isEmpty = !registrationData.name && 
                    !registrationData.photos?.length && 
                    !registrationData.bio &&
                    !registrationData.gender;
    
    // Sync'inti tik jei userProfile turi realius duomenis (ne default)
    const userProfileHasData = userProfile.name && 
                                userProfile.name !== 'Tomas' || 
                                userProfile.photos?.length > 0 || 
                                userProfile.bio;
    
    if (isEmpty && userProfileHasData) {
      setRegistrationData({
        photos: userProfile.photos || [],
        name: userProfile.name || '',
        gender: userProfile.gender || '',
        age: userProfile.age?.toString() || '',
        city: userProfile.city || '',
        street: userProfile.street || '',
        house: userProfile.house || '',
        height: userProfile.height || '',
        bodyType: userProfile.bodyType || '',
        civilStatus: userProfile.civilStatus || '',
        hairColor: userProfile.hairColor || '',
        eyeColor: userProfile.eyeColor || '',
        bio: userProfile.bio || '',
        hobbies: userProfile.interests || [],
        eroticInterests: userProfile.eroticInterests || []
      });
    }
  }, [userProfile, profileComplete, registrationData, showRegisterModal, showVerification]);

  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 80,
    distance: 500,
    gender: 'visi',
    bodyType: 'visi',
    minHeight: 150,
    maxHeight: 200,
    eroticInterest: 'visi'
  });

  // Sujungti main + backup: grąžinti pilnesnius duomenis (backup laimi jei daugiau nuotraukų/vardas)
  const mergeMembersWithBackup = (mainArr, backupArr) => {
    const withId = (m) => m && m.id;
    const photosCount = (m) => Array.isArray(m.photos) ? m.photos.length : 0;
    const hasName = (m) => m.name && String(m.name).trim();
    const merged = (mainArr || []).filter(withId).slice();
    (backupArr || []).filter(withId).forEach(b => {
      const idx = merged.findIndex(m => m.id === b.id);
      if (idx >= 0) {
        const ex = merged[idx];
        const bRicher = photosCount(b) > photosCount(ex) || (hasName(b) && !hasName(ex));
        if (bRicher) merged[idx] = { ...ex, ...b, status: ex.status || b.status };
      } else {
        merged.push(b);
      }
    });
    return merged;
  };

  // Visi užsiregistravę nariai (išsaugomi localStorage) – kad matytume kitus narius
  // ⚠️ SVARBU: Pirmiausia atstatome iš backup – jei backup turi pilnesnius duomenis, naudojame juos
  const [allMembers, setAllMembers] = useState(() => {
    const withId = (m) => m && m.id;
    try {
      let main = [];
      const saved = localStorage.getItem('myliu_allMembers');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) main = parsed.filter(withId);
        } catch (_) {}
      }
      let backupArr = [];
      const backup = localStorage.getItem('myliu_allMembers_backup');
      if (backup) {
        try {
          const bp = JSON.parse(backup);
          if (Array.isArray(bp)) backupArr = bp.filter(withId);
          else if (bp && Array.isArray(bp.members)) backupArr = (bp.members || []).filter(withId);
        } catch (_) {}
      }
      // Backup kaip pagrindas – jei yra backup, pirmiausia naudojame ją, tada papildome iš main (anketos neišnyktų)
      const merged = backupArr.length > 0
        ? mergeMembersWithBackup(backupArr, main)
        : mergeMembersWithBackup(main, backupArr);
      if (merged.length > 0) {
        try {
          localStorage.setItem('myliu_allMembers', JSON.stringify(merged));
        } catch (_) {}
        return merged;
      }
    } catch (e) {
      console.error('Error loading allMembers from localStorage:', e);
      try {
        const backup = localStorage.getItem('myliu_allMembers_backup');
        if (backup) {
          const bp = JSON.parse(backup);
          let arr = Array.isArray(bp) ? bp : (bp?.members || []);
          const fallback = arr.filter(m => m && m.id);
          if (fallback.length > 0) {
            localStorage.setItem('myliu_allMembers', JSON.stringify(fallback));
            return fallback;
          }
        }
      } catch (e2) {
        console.error('Error loading allMembers backup:', e2);
      }
    }
    return [];
  });

  // Išsaugoti visus narius – NIEKADA neperrašyti backup prastesniais duomenimis (kad anketos neišnyktų)
  useEffect(() => {
    if (isInitialMount.current) return;
    try {
      if (!Array.isArray(allMembers)) return;
      const toSave = allMembers.filter(m => m && m.id);
      localStorage.setItem('myliu_allMembers', JSON.stringify(toSave));
      // Backup atnaujinti TIK jei nauji duomenys nėra prastesni už esamą backup
      const backupJson = localStorage.getItem('myliu_allMembers_backup');
      let backupArr = [];
      if (backupJson) {
        try {
          const bp = JSON.parse(backupJson);
          backupArr = Array.isArray(bp) ? bp : (bp?.members || []);
          backupArr = backupArr.filter(m => m && m.id);
        } catch (_) {}
      }
      const photosCount = (m) => Array.isArray(m.photos) ? m.photos.length : 0;
      const wouldLoseData = toSave.length < backupArr.length ||
        toSave.some(m => {
          const inB = backupArr.find(b => b.id === m.id);
          return inB && (photosCount(m) < photosCount(inB) || (inB.name && inB.name.trim() && !(m.name && m.name.trim())));
        });
      if (!wouldLoseData) {
        localStorage.setItem('myliu_allMembers_backup', JSON.stringify({
          members: toSave,
          savedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.error('Error saving allMembers to localStorage:', e);
    }
  }, [allMembers]);

  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: 'Laura',
      age: 25,
      city: 'Vilnius',
      street: 'Gedimino pr.',
      house: '15',
      distance: 1.3,
      gender: 'Moteris',
      bodyType: 'Lieknas',
      height: '168',
      hairColor: 'Šviesūs',
      eyeColor: 'Žalios',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Dirbu IT srityje, mėgstu jogą ir knygų skaitymus. Ieškau rimtų santykių.',
      interests: ['meditacija / joga', 'skaitymas', 'technologijos', 'restoranai ir kavinės'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Saugus seksas'],
            photos: [
        '/laura_work.png',
        '/laura_yoga.png',
        '/laura_cafe.png',
        '/laura_restaurant.png',
        '/laura_nature.png',
        '/laura_casual.png'
      ],
      avatar: '👩‍💼',
      avatarBg: 'from-pink-400 to-purple-500',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 2,
      name: 'Tomas',
      age: 30,
      city: 'Kaunas',
      street: 'Laisvės al.',
      house: '42',
      distance: 1.7,
      gender: 'Vyras',
      bodyType: 'Atletiškas',
      height: '185',
      hairColor: 'Tamsūs',
      eyeColor: 'Rudos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Ne',
      bio: 'Verslininkas, sportuoju kiekvieną dieną. Mėgstu keliones ir nuotykius.',
      interests: ['verslas / investavimas', 'sportas ir aktyvus laisvalaikis', 'kelionės', 'automobiliai / motociklai'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Virtualus seksas'],
      photos: [
        '/tomas_gym_workout.png',
        '/tomas_business_meeting.png',
        '/tomas_motorcycle_adventure.png',
        '/tomas_restaurant_evening.png',
        '/tomas_sporting_event.png',
        '/tomas_casual_weekend.png'
      ],
      avatar: '👨‍💼',
      avatarBg: 'from-blue-400 to-cyan-500',
      isOnline: false,
      status: { watching: true, liked: false, likedMe: false }
    },
    {
      id: 3,
      name: 'Simona',
      age: 27,
      city: 'Klaipėda',
      street: 'Herkaus Manto g.',
      house: '8',
      distance: 1.1,
      gender: 'Moteris',
      bodyType: 'Vidutinis',
      height: '172',
      hairColor: 'Šviesūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Taip',
      bio: 'Dailininkė ir fotografė. Gamtos mylėtoja. Ieškau meninės sielos.',
      interests: ['menas ir parodos', 'fotografija', 'pasivaikščiojimai gamtoje', 'muzika'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Erotinis masažas', 'Tantrinis seksas'],
      photos: [
        '/simona_art.png',
        '/simona_photography.png',
        '/simona_casual.png',
        '/simona_sensual.png',
        '/simona_restaurant.png',
        '/simona_nature.png'
      ],
      avatar: '👩‍🎨',
      avatarBg: 'from-yellow-400 to-orange-500',
      isOnline: true,
      status: { watching: true, liked: true, likedMe: false }
    },
    {
      id: 4,
      name: 'Darius',
      age: 32,
      city: 'Šiauliai',
      street: 'Vilniaus g.',
      house: '25',
      distance: 1.6,
      gender: 'Vyras',
      bodyType: 'Vidutinis',
      height: '178',
      hairColor: 'Tamsūs',
      eyeColor: 'Žalios',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Inžinierius, mėgstu technologijas ir gamtą. Ramus ir atsakingas.',
      interests: ['technologijos', 'pasivaikščiojimai gamtoje', 'žygiai / kalnai', 'stalo žaidimai'],
      eroticInterests: ['Pasimatymai', 'Saugus seksas', 'Oralinis seksas'],
      photos: [
        '/darius_hiking_adventure.png',
        '/darius_tech_workspace.png',
        '/darius_board_game_evening.png',
        '/darius_nature_walk.png',
        '/darius_coffee_cafe.png',
        '/darius_evening_date.png'
      ],
      avatar: '👨‍💻',
      avatarBg: 'from-green-400 to-teal-500',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: true }
    },
    {
      id: 5,
      name: 'Greta',
      age: 29,
      city: 'Panevėžys',
      street: 'Respublikos g.',
      house: '12',
      distance: 0.7,
      gender: 'Moteris',
      bodyType: 'Atletiškas',
      height: '165',
      hairColor: 'Rudi',
      eyeColor: 'Rudos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Taip',
      bio: 'Trenerė, sveikos gyvensenos propagatorė. Aktyvus gyvenimo būdas - mano prioritetas.',
      interests: ['fitnesas / sporto salė', 'savęs tobulinimas', 'meditacija / joga', 'kelionės'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Erotinis masažas', 'Tantrinis seksas'],
      photos: [
        '/greta_fitness.png',
        '/greta_yoga.png',
        '/greta_casual.png',
        '/greta_outdoor.png',
        '/greta_erotic.png',
        '/greta_sexy.png'
      ],
      avatar: '👩‍⚕️',
      avatarBg: 'from-red-400 to-pink-500',
      isOnline: true,
      status: { watching: false, liked: true, likedMe: true }
    },
    {
      id: 6,
      name: 'Mantas',
      age: 35,
      city: 'Alytus',
      street: 'Dariaus ir Girėno g.',
      house: '7',
      distance: 1.3,
      gender: 'Vyras',
      bodyType: 'Atletiškas',
      height: '182',
      hairColor: 'Šviesūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Ne',
      bio: 'Architektas, keliautojas. Ieškau partnerės gyvenimo nuotykiams.',
      interests: ['kelionės', 'fotografija', 'maisto gaminimas', 'restoranai ir kavinės'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Virtualus seksas', 'Viešas seksas'],
      photos: [
        '/mantas_architecture_site.png',
        '/mantas_photography_adventure.png',
        '/mantas_cooking_kitchen.png',
        '/mantas_restaurant_date.png',
        '/mantas_travel_adventure.png',
        '/mantas_casual_weekend.png'
      ],
      avatar: '👨‍🎨',
      avatarBg: 'from-indigo-400 to-purple-500',
      isOnline: false,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 7,
      name: 'Ieva',
      age: 26,
      city: 'Marijampolė',
      street: 'Vytauto g.',
      house: '33',
      distance: 0.4,
      gender: 'Moteris',
      bodyType: 'Lieknas',
      height: '170',
      hairColor: 'Šviesūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Taip',
      bio: 'Mokytoja, mėgstu vaikus ir keliones. Ieškau šeimos žmogaus.',
      interests: ['skaitymas', 'kelionės', 'gyvūnai', 'šunys / katės'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Saugus seksas'],
      photos: [
        '/ieva_spring_morning.png',
        '/ieva_summer_beach.png',
        '/ieva_autumn_park.png',
        '/ieva_winter_indoor.png',
        '/ieva_romantic_evening.png',
        '/ieva_casual_date.png'
      ],
      avatar: '👩‍🏫',
      avatarBg: 'from-cyan-400 to-blue-500',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 8,
      name: 'Andrius',
      age: 31,
      city: 'Utena',
      street: 'Aukštaitijos g.',
      house: '19',
      distance: 1.1,
      gender: 'Vyras',
      bodyType: 'Atletiškas',
      height: '180',
      hairColor: 'Tamsūs',
      eyeColor: 'Rudos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Gydytojas, mėgstu sportą ir keliones. Ieškau rimtų santykių.',
      interests: ['sportas ir aktyvus laisvalaikis', 'kelionės', 'muzika', 'koncertai'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Saugus seksas', 'Oralinis seksas'],
      photos: [
        '/andrius_hospital_shift.png',
        '/andrius_sports_outdoor.png',
        '/andrius_concert_night.png',
        '/andrius_travel_adventure.png',
        '/andrius_restaurant_evening.png',
        '/andrius_casual_weekend.png'
      ],
      avatar: '👨‍⚕️',
      avatarBg: 'from-teal-400 to-green-500',
      isOnline: false,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 9,
      name: 'Kristina',
      age: 28,
      city: 'Telšiai',
      street: 'Kęstučio g.',
      house: '5',
      distance: 0.5,
      gender: 'Moteris',
      bodyType: 'Vidutinis',
      height: '167',
      hairColor: 'Rudi',
      eyeColor: 'Žalios',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Ne',
      bio: 'Dizainerė, kūrybinga siela. Mėgstu meną ir modernią kultūrą.',
      interests: ['menas ir parodos', 'fotografija', 'muzika', 'koncertai'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Erotinis masažas', 'Tantrinis seksas'],
      photos: [
        '/kristina_art_gallery.png',
        '/kristina_photography_session.png',
        '/kristina_concert_evening.png',
        '/kristina_studio_work.png',
        '/kristina_elegant_restaurant.png',
        '/kristina_cafe_afternoon.png'
      ],
      avatar: '👩‍🎤',
      avatarBg: 'from-fuchsia-400 to-purple-500',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 10,
      name: 'Lukas',
      age: 24,
      city: 'Kėdainiai',
      street: 'Didžioji g.',
      house: '21',
      distance: 2.2,
      gender: 'Vyras',
      bodyType: 'Lieknas',
      height: '175',
      hairColor: 'Šviesūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Programuotojas, technologijų entuziastas. Mėgstu gaminti ir keliauti.',
      interests: ['technologijos', 'maisto gaminimas', 'kelionės', 'video žaidimai'],
      eroticInterests: ['Pasimatymai', 'Virtualus seksas', 'Oralinis seksas'],
      photos: [
        '/lukas_coding_workspace.png',
        '/lukas_cooking_kitchen.png',
        '/lukas_travel_adventure.png',
        '/lukas_gaming_evening.png',
        '/lukas_cafe_afternoon.png',
        '/lukas_casual_weekend.png'
      ],
      avatar: '👨‍🔬',
      avatarBg: 'from-violet-400 to-indigo-500',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 11,
      name: 'Agnė',
      age: 29,
      city: 'Tauragė',
      street: 'Vytauto g.',
      house: '14',
      distance: 0.8,
      gender: 'Moteris',
      bodyType: 'Atletiškas',
      height: '169',
      hairColor: 'Šviesūs',
      eyeColor: 'Žalios',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Taip',
      bio: 'Verslininkė, motyvuota ir energinga. Ieškau partnerio gyvenimui.',
      interests: ['verslas / investavimas', 'sportas ir aktyvus laisvalaikis', 'kelionės', 'meditacija / joga'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Tantrinis seksas', 'Saugus seksas'],
      photos: [
        '/agne_business_meeting.png',
        '/agne_yoga_session.png',
        '/agne_travel_adventure.png',
        '/agne_evening_networking.png',
        '/agne_romantic_dinner.png',
        '/agne_casual_weekend.png'
      ],
      avatar: '👩‍💼',
      avatarBg: 'from-rose-400 to-red-500',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 12,
      name: 'Vytautas',
      age: 33,
      city: 'Plungė',
      street: 'Vytauto g.',
      house: '28',
      distance: 1.8,
      gender: 'Vyras',
      bodyType: 'Vidutinis',
      height: '183',
      hairColor: 'Tamsūs',
      eyeColor: 'Rudos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Ne',
      bio: 'Verslininkas, mėgstu automobilius ir keliones. Ieškau antrosios pusės.',
      interests: ['verslas / investavimas', 'automobiliai / motociklai', 'kelionės', 'technologijos'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Viešas seksas', 'Analinis saksas'],
      photos: [
        '/vytautas_car_showcase.png',
        '/vytautas_business_meeting.png',
        '/vytautas_travel_adventure.png',
        '/vytautas_restaurant_evening.png',
        '/vytautas_tech_expo.png',
        '/vytautas_casual_weekend.png'
      ],
      avatar: '👨‍✈️',
      avatarBg: 'from-sky-400 to-blue-500',
      isOnline: false,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 13,
      name: 'Svajonė',
      age: 18,
      city: 'Vilnius',
      street: 'Pilies g.',
      house: '12',
      distance: 0.8,
      gender: 'Moteris',
      bodyType: 'Lieknas',
      height: '165',
      hairColor: 'Juodi',
      eyeColor: 'Rudos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Studijuoju, mėgstu knygas, muziką ir keliones. Ieškau draugų ir naujų pažinčių. Aktiviai leidžiu laiką su draugais.',
      interests: ['skaitymas', 'muzika', 'kelionės', 'menas', 'fotografija'],
      eroticInterests: ['Pasimatymai'],
      photos: [
        '/svajone_winter_university.png',
        '/svajone_spring_park.png',
        '/svajone_summer_cafe.png',
        '/svajone_autumn_library.png',
        '/svajone_winter_indoor.png',
        '/svajone_spring_outdoor.png'
      ],
      avatar: '👧',
      avatarBg: 'from-purple-400 to-pink-500',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 14,
      name: 'Amber',
      age: 18,
      city: 'Kaunas',
      street: 'Laisvės al.',
      house: '55',
      distance: 1.2,
      gender: 'Moteris',
      bodyType: 'Lieknas',
      height: '165',
      hairColor: 'Šviesūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Taip',
      bio: 'Mėgstu muziką, meną ir kūrybiškumą. Ieškau kažko naujo ir įdomaus.',
      interests: ['muzika', 'menas', 'fotografija', 'moda'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis'],
      photos: [
        '/amber_winter_coat.png',
        '/amber_spring_flowers.png',
        '/amber_summer_street.png',
        '/amber_autumn_cafe.png',
        '/amber_winter_indoor.png',
        '/amber_spring_outdoor.png'
      ],
      avatar: '👱‍♀️',
      avatarBg: 'from-yellow-400 to-orange-500',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 15,
      name: 'Domantas',
      age: 26,
      city: 'Šilutė',
      street: 'Tilžės g.',
      house: '18',
      distance: 2.5,
      gender: 'Vyras',
      bodyType: 'Atletiškas',
      height: '182',
      hairColor: 'Šviesūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Ne',
      bio: 'Laukinių nuotykių entuziastas, medžiotojas ir žvejys. Mėgstu gamtą, lauko veiklas ir ekstremalius nuotykius. Ieškau partnerės, su kuria dalinsiuosi aistrą gamtai.',
      interests: ['pasivaikščiojimai gamtoje', 'žygiai / kalnai', 'dviračiai', 'kelionės', 'sportas ir aktyvus laisvalaikis'],
      eroticInterests: ['Pasimatymai', 'Viešas seksas', 'Analinis saksas', 'BDSM'],
      photos: [
        '/domantas_hiking_adventure.png',
        '/domantas_camping_night.png',
        '/domantas_fishing_lake.png',
        '/domantas_forest_exploration.png',
        '/domantas_mountain_climbing.png',
        '/domantas_wilderness_outdoor.png'
      ],
      avatar: '🌲',
      avatarBg: 'from-green-600 to-emerald-700',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 16,
      name: 'Aurelija',
      age: 45,
      city: 'Vilnius',
      street: 'Gedimino pr.',
      house: '88',
      distance: 0.9,
      gender: 'Moteris',
      bodyType: 'Vidutinis',
      height: '170',
      hairColor: 'Šviesūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Verslininkė, elegantiška ir sėkminga. Ieškau lygio partnerio, su kuriuo dalinsiuosi pasiekimais.',
      interests: ['verslas / investavimas', 'restoranai ir kavinės', 'kelionės', 'prabangos prekės'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Tantrinis seksas', 'Saugus seksas'],
      photos: [
        '/aurelija_winter_elegant.png',
        '/aurelija_spring_business.png',
        '/aurelija_summer_resort.png',
        '/aurelija_autumn_gala.png',
        '/aurelija_winter_restaurant.png',
        '/aurelija_spring_garden.png'
      ],
      avatar: '👩‍💼',
      avatarBg: 'from-amber-400 to-yellow-500',
      isOnline: false,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 17,
      name: 'Arturas',
      age: 38,
      city: 'Vilnius',
      street: 'Konstitucijos pr.',
      house: '7A',
      distance: 0.6,
      gender: 'Vyras',
      bodyType: 'Atletiškas',
      height: '184',
      hairColor: 'Šviesūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Tech verslininkas, įkūriau kelias sėkmingas IT startuolius. Aktyviai investuoju į inovacijas ir technologijas. Ieškau intelektualios ir ambicingos partnerės, su kuria kurtume ateitį.',
      interests: ['verslas / investavimas', 'technologijos', 'kelionės', 'sportas ir aktyvus laisvalaikis', 'restoranai ir kavinės', 'automobiliai / motociklai'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Tantrinis seksas', 'Saugus seksas'],
      photos: [
        '/arturas_tech_startup.png',
        '/arturas_luxury_car.png',
        '/arturas_restaurant_modern.png',
        '/arturas_sports_activity.png',
        '/arturas_travel_business.png',
        '/arturas_casual_smart.png'
      ],
      avatar: '👨‍💼',
      avatarBg: 'from-slate-600 to-gray-700',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 18,
      name: 'Kęstutis',
      age: 42,
      city: 'Vilnius',
      street: 'Vilniaus g.',
      house: '31',
      distance: 0.5,
      gender: 'Vyras',
      bodyType: 'Vidutinis',
      height: '188',
      hairColor: 'Juodi',
      eyeColor: 'Tamsiai rudos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Verslo bankininkas, investicijų konsultantas. Įkūriau sėkmingą finansinės konsultacijų įmonę. Ieškau intelektualios partnerės, su kuria dalinsiuosi sėkmę ir aukštus tikslus.',
      interests: ['verslas / investavimas', 'restoranai ir kavinės', 'kelionės', 'menas ir parodos'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Tantrinis seksas', 'Saugus seksas'],
      photos: [
        '/kestutis_business_suit.png',
        '/kestutis_luxury_office.png',
        '/kestutis_restaurant_elegant.png',
        '/kestutis_golf_club.png',
        '/kestutis_travel_business.png',
        '/kestutis_casual_elegant.png'
      ],
      avatar: '👔',
      avatarBg: 'from-indigo-600 to-blue-700',
      isOnline: false,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 19,
      name: 'Basta',
      age: 29,
      city: 'Klaipėda',
      street: 'Manto g.',
      house: '12',
      distance: 1.4,
      gender: 'Moteris',
      bodyType: 'Stambesnis',
      height: '172',
      hairColor: 'Daugiaspalviai',
      eyeColor: 'Rudos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Taip',
      bio: 'Punk roko muzikantė, menininkė. Laisva dvasia, kūrybinga siela. Ieškau partnerio, kuris supranta meno kalbą.',
      interests: ['muzika', 'menas ir parodos', 'koncertai', 'fotografija'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Virtualus seksas', 'BDSM'],
      photos: [
        '/basta_winter_concert.png',
        '/basta_spring_art.png',
        '/basta_summer_festival.png',
        '/basta_autumn_studio.png',
        '/basta_winter_indoor.png',
        '/basta_spring_outdoor.png'
      ],
      avatar: '🎸',
      avatarBg: 'from-purple-600 to-pink-700',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 20,
      name: 'Gabija',
      age: 21,
      city: 'Vilnius',
      street: 'Pylimo g.',
      house: '34',
      distance: 0.9,
      gender: 'Moteris',
      bodyType: 'Lieknas',
      height: '165',
      hairColor: 'Daugiaspalviai',
      eyeColor: 'Rudos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Taip',
      bio: 'Laukinė jaunuolė, mėgstu koncertus, šokius ir gyvenimą be ribų. Ieškau kažko panašaus!',
      interests: ['muzika / koncertai', 'menas ir parodos', 'šokis', 'naktinis gyvenimas'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Viešas seksas', 'Oralinis seksas'],
      photos: [
        '/amber_winter_coat.png',
        '/amber_spring_flowers.png',
        '/amber_summer_street.png',
        '/amber_autumn_cafe.png',
        '/amber_winter_indoor.png',
        '/amber_spring_outdoor.png'
      ],
      avatar: '🎪',
      avatarBg: 'from-pink-500 to-red-600',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 21,
      name: 'Gintarė',
      age: 38,
      city: 'Vilnius',
      street: 'Gedimino pr.',
      house: '42',
      distance: 0.7,
      gender: 'Moteris',
      bodyType: 'Vidutinis',
      height: '172',
      hairColor: 'Rudi',
      eyeColor: 'Žalios',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Turtinga nekilnojamojo turto verslininkė. Sėkminga, elegantiška ir patyrusi. Ieškau lygio partnerio.',
      interests: ['verslas / investavimas', 'prabangos prekės', 'kelionės', 'restoranai ir kavinės'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Tantrinis seksas', 'Saugus seksas'],
      photos: [
        '/gintare_real_estate.png',
        '/gintare_luxury_property.png',
        '/gintare_business_meeting.png',
        '/gintare_restaurant_elegant.png',
        '/gintare_travel_luxury.png',
        '/gintare_casual_executive.png'
      ],
      avatar: '🏛️',
      avatarBg: 'from-amber-500 to-orange-600',
      isOnline: false,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 22,
      name: 'Julijė',
      age: 35,
      city: 'Vilnius',
      street: 'Konstitucijos pr.',
      house: '15',
      distance: 0.6,
      gender: 'Moteris',
      bodyType: 'Vidutinis',
      height: '168',
      hairColor: 'Tamsūs',
      eyeColor: 'Rudos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Turtinga verslo konsultantė. Inteligentiška ir ambicinga. Ieškau partnerio, su kuriuo dalinsiuosi sėkmę.',
      interests: ['verslas / investavimas', 'restoranai ir kavinės', 'kelionės', 'menas ir parodos'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Tantrinis seksas', 'Saugus seksas'],
      photos: [
        '/julije_business_elegant.png',
        '/julije_luxury_office.png',
        '/julije_restaurant_premium.png',
        '/julije_travel_business.png',
        '/julije_evening_gala.png',
        '/julije_casual_sophisticated.png'
      ],
      avatar: '💼',
      avatarBg: 'from-indigo-500 to-purple-600',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 23,
      name: 'Kajus',
      age: 24,
      city: 'Neringa',
      street: 'Naglių g.',
      house: '15',
      distance: 1.7,
      gender: 'Vyras',
      bodyType: 'Lieknas',
      height: '178',
      hairColor: 'Juodi',
      eyeColor: 'Tamsios',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Jūros mylėtojas, buriuotojas ir gamtos fotografas. Mėgstu jūrą, paplūdimius ir laukinę gamtą. Ieškau laisvos dvasios partnerės.',
      interests: ['vandens sportai', 'fotografija', 'pasivaikščiojimai gamtoje', 'stovyklavimas', 'kelionės', 'paplūdimys'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Viešas seksas', 'Oralinis seksas'],
      photos: [
        '/kajus_sailing_boat.png',
        '/kajus_beach_sunset.png',
        '/kajus_nature_photography.png',
        '/kajus_wilderness_camping.png',
        '/kajus_forest_exploration.png',
        '/kajus_coastal_adventure.png'
      ],
      avatar: '🏄',
      avatarBg: 'from-cyan-600 to-blue-700',
      isOnline: false,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 24,
      name: 'Karolina',
      age: 22,
      city: 'Kaunas',
      street: 'Laisvės al.',
      house: '28',
      distance: 1.3,
      gender: 'Moteris',
      bodyType: 'Atletiškas',
      height: '170',
      hairColor: 'Tamsūs',
      eyeColor: 'Mišrios',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Taip',
      bio: 'Elektroninės muzikos fanė, fotografijos mėgėja. Mėgstu urban kultūrą ir laisvą gyvenimo būdą. Ieškau kažko panašaus!',
      interests: ['muzika / koncertai', 'fotografija', 'urban kultūra', 'naktinis gyvenimas'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Viešas seksas', 'Oralinis seksas'],
      photos: [
        '/basta_winter_concert.png',
        '/basta_spring_art.png',
        '/basta_summer_festival.png',
        '/basta_autumn_studio.png',
        '/basta_winter_indoor.png',
        '/basta_spring_outdoor.png'
      ],
      avatar: '🎧',
      avatarBg: 'from-purple-500 to-pink-600',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 25,
      name: 'Rokas',
      age: 45,
      city: 'Vilnius',
      street: 'Konstitucijos pr.',
      house: '25',
      distance: 0.5,
      gender: 'Vyras',
      bodyType: 'Stambesnis',
      height: '190',
      hairColor: 'Tamsūs',
      eyeColor: 'Rudos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Statybos įmonės vadovas ir savininkas. Įgyvendinau daug prestižinių projektų Lietuvoje ir užsienyje. Ieškau patikimos ir išsilavinusios partnerės, su kuria dalinsiuosi pasiekimais ir būtiną gyvenimo komfortą.',
      interests: ['verslas / investavimas', 'automobiliai / motociklai', 'kelionės', 'prabangos prekės', 'restoranai ir kavinės', 'sportas ir aktyvus laisvalaikis'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Tantrinis seksas', 'Saugus seksas'],
      photos: [
        '/rokas_construction_site.png',
        '/rokas_luxury_vehicle.png',
        '/rokas_business_meeting.png',
        '/rokas_restaurant_premium.png',
        '/rokas_travel_luxury.png',
        '/rokas_casual_executive.png'
      ],
      avatar: '🏗️',
      avatarBg: 'from-gray-600 to-slate-700',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 26,
      name: 'Rūtė',
      age: 32,
      city: 'Vilnius',
      street: 'Konstitucijos pr.',
      house: '18',
      distance: 0.6,
      gender: 'Moteris',
      bodyType: 'Lieknas',
      height: '170',
      hairColor: 'Šviesūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Turtinga IT verslininkė. Inovatyvi ir sėkminga. Ieškau intelektualios partnerės, su kuria kurtume ateitį.',
      interests: ['verslas / investavimas', 'technologijos', 'kelionės', 'sportas ir aktyvus laisvalaikis', 'restoranai ir kavinės'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Tantrinis seksas', 'Saugus seksas'],
      photos: [
        '/rute_tech_startup.png',
        '/rute_luxury_car.png',
        '/rute_sports_activity.png',
        '/rute_restaurant_modern.png',
        '/rute_travel_business.png',
        '/rute_casual_smart.png'
      ],
      avatar: '💻',
      avatarBg: 'from-blue-500 to-cyan-600',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 27,
      name: 'Tautvydas',
      age: 28,
      city: 'Druskininkai',
      street: 'Maironio g.',
      house: '21',
      distance: 1.4,
      gender: 'Vyras',
      bodyType: 'Atletiškas',
      height: '185',
      hairColor: 'Rudi',
      eyeColor: 'Žalios',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Taip',
      bio: 'Ekstremalių sportų mėgėjas, baseinuotojas ir kalnų slidininkas. Gyvenu aktyvų gyvenimą gamtoje. Ieškau drąsios partnerės nuotykiams.',
      interests: ['sportas ir aktyvus laisvalaikis', 'žygiai / kalnai', 'vandens sportai', 'žiemos sportai', 'stovyklavimas', 'pasivaikščiojimai gamtoje'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Viešas seksas', 'Saugus seksas'],
      photos: [
        '/tautvydas_cliff_diving.png',
        '/tautvydas_mountain_climbing.png',
        '/tautvydas_camping_fire.png',
        '/tautvydas_water_sports.png',
        '/tautvydas_forest_exploration.png',
        '/tautvydas_wilderness_adventure.png'
      ],
      avatar: '⛰️',
      avatarBg: 'from-blue-600 to-cyan-700',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 28,
      name: 'Vakarėlis',
      age: 27,
      city: 'Biržai',
      street: 'Širvėnos g.',
      house: '8',
      distance: 2.1,
      gender: 'Vyras',
      bodyType: 'Vidutinis',
      height: '180',
      hairColor: 'Tamsūs',
      eyeColor: 'Rudos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Taip',
      piercing: 'Ne',
      bio: 'Laukinių gyvūnų mylėtojas, žvejys ir gamtos mokslininkas. Mėgstu tyrinėti gamtą ir būti lauke. Ieškau partnerės, kuri vertina gamtą kaip aš.',
      interests: ['pasivaikščiojimai gamtoje', 'žvejyba / medžioklė', 'gyvūnai', 'stovyklavimas', 'žygiai / kalnai', 'fotografija'],
      eroticInterests: ['Pasimatymai', 'Bučiavimasis', 'Saugus seksas', 'Oralinis seksas'],
      photos: [
        '/vakarelis_fishing_river.png',
        '/vakarelis_forest_wildlife.png',
        '/vakarelis_camping_lake.png',
        '/vakarelis_hiking_mountains.png',
        '/vakarelis_nature_exploration.png',
        '/vakarelis_wilderness_adventure.png'
      ],
      avatar: '🐺',
      avatarBg: 'from-brown-600 to-amber-700',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 29,
      name: 'Britva',
      age: 50,
      city: 'Vilnius',
      street: 'Gedimino pr.',
      house: '52',
      distance: 0.8,
      gender: 'Vyras',
      bodyType: 'Vidutinis',
      height: '178',
      hairColor: 'Tamsūs',
      eyeColor: 'Rudos',
      civilStatus: 'Išsiskyręs (-usi)',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Patyręs verslininkas, mėgstu kultūrą, meną ir gerą kavą. Vertinu autentiškumą ir tiesą. Ieškau intelektualios partnerės, su kuria galėčiau dalintis gyvenimo patirtimi ir kurti naują skyrių.',
      interests: ['menas ir parodos', 'restoranai ir kavinės', 'kelionės', 'muzika', 'skaitymas', 'verslas / investavimas'],
      eroticInterests: ['Pasimatymai', 'Glamonės', 'Tantrinis seksas', 'Saugus seksas'],
      photos: [
        '/briva_cafe_window.png',
        '/briva_city_street.png',
        '/briva_home_indoor.png',
        '/briva_evening_city.png',
        '/briva_close_portrait.png',
        '/briva_laughing_moment.png'
      ],
      avatar: '☕',
      avatarBg: 'from-slate-700 to-gray-800',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 30,
      name: 'Plikis',
      age: 55,
      city: 'Vilnius',
      street: 'Gedimino pr.',
      house: '15',
      distance: 1.2,
      gender: 'Vyras',
      bodyType: 'Vidutinis',
      height: '175',
      hairColor: 'Plikė',
      eyeColor: 'Mėlynos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Ieškau partnerės, su kuria dalinsiuosi gyvenimo patirtimi.',
      interests: ['kelionės', 'muzika', 'skaitymas'],
      eroticInterests: ['Pasimatymai', 'Saugus seksas'],
      photos: [
        '/plikis_1.png',
        '/plikis_2.png',
        '/plikis_3.png',
        '/plikis_4.png',
        '/plikis_5.png',
        '/plikis_6.png'
      ],
      avatar: '👴',
      avatarBg: 'from-gray-600 to-gray-700',
      isOnline: false,
      status: { watching: false, liked: false, likedMe: false }
    },
    {
      id: 31,
      name: 'Gytis',
      age: 45,
      city: 'Vilnius',
      street: 'Gedimino pr.',
      house: '28',
      distance: 0.9,
      gender: 'Vyras',
      bodyType: 'Vidutinis',
      height: '180',
      hairColor: 'Tamsūs',
      eyeColor: 'Mėlynos',
      civilStatus: 'Vienišius',
      smoking: 'Ne',
      tattoos: 'Ne',
      piercing: 'Ne',
      bio: 'Mėgstu keliones, ypač į šiltas šalis. Ieškau partnerės, su kuria galėčiau dalintis gyvenimo patirtimi ir kurti naujus prisiminimus.',
      interests: ['kelionės', 'restoranai ir kavinės', 'muzika', 'sportas', 'skaitymas'],
      eroticInterests: ['Pasimatymai', 'Saugus seksas', 'Glamonės'],
      photos: [
        '/gytis_1.png',
        '/gytis_2.png',
        '/gytis_3.png'
      ],
      avatar: '🏖️',
      avatarBg: 'from-orange-500 to-yellow-600',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    }
  ]);

  const [conversations, setConversations] = useState([
    {
      profileId: 3,
      messages: [
        { text: 'Labas! Kaip sekasi?', sender: 'them', time: '14:30', read: true },
        { text: 'Labas! Viskas gerai, ačiū 😊', sender: 'me', time: '14:32', read: true },
        { text: 'Gal susitiktume kavai?', sender: 'them', time: '14:35', read: false }
      ],
      lastMessageTime: new Date('2024-01-06T14:35:00')
    },
    {
      profileId: 5,
      messages: [
        { text: 'Labas! Matau mėgsti sportą 💪', sender: 'me', time: '10:15', read: true },
        { text: 'Taip! Sportuoju kasdien. O tu?', sender: 'them', time: '10:20', read: true }
      ],
      lastMessageTime: new Date('2024-01-06T10:20:00')
    }
  ]);

  const [visitors, setVisitors] = useState([
    { profileId: 1, visitTime: '2 val. prieš' },
    { profileId: 4, visitTime: '5 val. prieš' },
    { profileId: 6, visitTime: 'Vakar' }
  ]);

  const getProfile = (id) => profiles.find(p => p.id === id) || allMembers.find(p => p.id === id);

  // Narių sąrašas be savo profilio (kiti nariai + statiniai profiliai)
  const displayProfiles = (Array.isArray(profiles) ? profiles : []).concat(Array.isArray(allMembers) ? allMembers : []).filter(p =>
    p && p.id !== 'my-profile' && (!p.email || p.email !== ((userProfile && userProfile.email) || ''))
  );

  const toggleStatus = (profileId, statusType) => {
    const isMember = typeof profileId === 'string' && String(profileId).startsWith('member-');
    if (isMember) {
      // SVARBU: Keičiamas TIK status – kiti duomenys lieka nepakitę!
      setAllMembers(prev => prev.map(p => {
        if (p && p.id === profileId) {
          const newStatus = { ...(p.status || {}), [statusType]: !(p.status && p.status[statusType]) };
          if (statusType === 'liked' && newStatus.liked) setNotifications(n => n + 1);
          // Išsaugoti VISUS kitus laukus nepakitę – tik status keičiamas
          const updated = { ...p, status: newStatus };
          setSelectedProfile(s => s && s.id === profileId ? updated : s);
          return updated;
        }
        return p;
      }));
      return;
    }
    setProfiles(prevProfiles => prevProfiles.map(p => {
      if (p.id === profileId) {
        const newStatus = { ...p.status };
        newStatus[statusType] = !newStatus[statusType];
        if (statusType === 'liked' && newStatus.liked) setNotifications(prev => prev + 1);
        const updatedProfile = { ...p, status: newStatus };
        setSelectedProfile(prevSelected => (prevSelected && prevSelected.id === profileId) ? updatedProfile : prevSelected);
        return updatedProfile;
      }
      return p;
    }));
  };

  const proposeMeeting = (profileId) => {
    // Patikrinti, ar yra pakankamai lėšų (1 euro = 100 credits)
    // Arba ar yra bandomojo laikotarpio žinučių
    const remainingTrialMessages = TRIAL_MESSAGES - totalMessagesSent;
    const hasTrialMessages = remainingTrialMessages > 0;
    
    if (credits < 100 && !hasTrialMessages) {
      setShowPayment(true);
      return;
    }

    // Apmokestinti 1 euro (100 credits) arba naudoti bandomojo laikotarpio žinutę
    if (hasTrialMessages) {
      setTotalMessagesSent(prev => prev + 100); // Susitikimo pasiūlymas = 100 žinučių
    } else {
      setCredits(prevCredits => prevCredits - 100);
    }

    // Siųsti žinutę su rožių puokšte
    const meetingMessage = {
      text: '🌹🌹🌹 Puokštė rožių jums! Norėčiau pasiūlyti susitikimą. 🌹🌹🌹',
      sender: 'me',
      time: new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    const conversation = conversations.find(c => c.profileId === profileId);
    
    if (conversation) {
      setConversations(prevConversations => prevConversations.map(c => {
        if (c.profileId === profileId) {
          return {
            ...c,
            messages: [...c.messages, meetingMessage],
            lastMessageTime: new Date()
          };
        }
        return c;
      }));
    } else {
      setConversations(prevConversations => [{
        profileId: profileId,
        messages: [meetingMessage],
        lastMessageTime: new Date()
      }, ...prevConversations]);
    }

    // Suteikti 3 nemokamas žinutes šiam nariui
    setFreeMessages(prev => ({
      ...prev,
      [profileId]: (prev[profileId] || 0) + 3
    }));

    // Pažymėti, kad siųstas susitikimo pasiūlymas
    setMeetingProposals(prev => new Set([...prev, profileId]));

    // Atidaryti pokalbį
    setActiveChat(profileId);
    setSelectedProfile(getProfile(profileId));
  };

  const sendMessage = () => {
    // Tikrinti, ar vartotojas prisijungęs
    if (!isLoggedIn) {
      alert('Prašome prisijungti, kad galėtumėte siųsti žinutes.');
      openLoginModal();
      return;
    }
    
    // Patikrinti, ar profilis užpildytas
    if (!profileComplete) {
      alert('Prašome pirmiausia užpildyti savo profilį. Be užpildytos anketos negalite rašyti žinučių.');
      setShowProfileForm(true);
      return;
    }
    
    // Naudoti activeChat arba selectedProfile.id jei activeChat nėra nustatytas
    const chatProfileId = activeChat || (selectedProfile && selectedProfile.id !== 'my-profile' ? selectedProfile.id : null);
    if (!messageInput.trim() || !chatProfileId) return;
    
    const conversation = conversations.find(c => c.profileId === chatProfileId);
    const isFirstMessage = !conversation;
    
    // Patikrinti, ar yra nemokamų žinučių šiam nariui (iš susitikimo pasiūlymo)
    const freeMessagesCount = freeMessages[chatProfileId] || 0;
    const hasFreeMessages = freeMessagesCount > 0;
    
    // Patikrinti, ar dar yra bandomojo laikotarpio žinučių
    const remainingTrialMessages = TRIAL_MESSAGES - totalMessagesSent;
    const hasTrialMessages = remainingTrialMessages > 0;

    // Jei nėra nemokamų žinučių, nėra bandomojo laikotarpio žinučių ir nėra credits, rodyti payment modal
    if (!hasFreeMessages && !hasTrialMessages && credits <= 0 && !isFirstMessage) {
      setShowPayment(true);
      return;
    }

    // Skaičiuoti žinučių skaičių
    if (!isFirstMessage) {
      if (hasFreeMessages) {
        // Naudoti nemokamą žinutę iš susitikimo pasiūlymo
        setFreeMessages(prev => ({
          ...prev,
          [activeChat]: (prev[activeChat] || 0) - 1
        }));
      } else if (hasTrialMessages) {
        // Naudoti bandomojo laikotarpio žinutę
        setTotalMessagesSent(prev => prev + 1);
      } else {
        // Naudoti credit
        setCredits(prevCredits => prevCredits - 1);
      }
    } else {
      // Pirmoji žinutė visada nemokama (skaičiuojama kaip bandomojo laikotarpio)
      setTotalMessagesSent(prev => prev + 1);
    }

    const newMessage = {
      text: messageInput,
      sender: 'me',
      time: new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    if (conversation) {
      setConversations(prevConversations => prevConversations.map(c => {
        if (c.profileId === chatProfileId) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            lastMessageTime: new Date()
          };
        }
        return c;
      }));
    } else {
      setConversations(prevConversations => [{
        profileId: chatProfileId,
        messages: [newMessage],
        lastMessageTime: new Date()
      }, ...prevConversations]);
    }
    
    // Užtikrinti kad activeChat būtų nustatytas
    if (!activeChat || activeChat !== chatProfileId) {
      setActiveChat(chatProfileId);
    }

    setMessageInput('');

    // Scroll į apačią po siuntimo
    setTimeout(() => {
      const messagesContainer = document.getElementById('chat-messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 50);

    setTimeout(() => {
      const replies = [
        'Labas! 😊',
        'Kaip laikaisi?',
        'Smagu susipažinti!',
        'Dėkui už žinutę!',
        'Taip pat mėgstu ' + (getProfile(chatProfileId)?.interests[0] || 'keliones') + '!'
      ];
      
      const reply = {
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'them',
        time: new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' }),
        read: false
      };

      setConversations(prevConversations => prevConversations.map(c => {
        if (c.profileId === chatProfileId) {
          return {
            ...c,
            messages: [...c.messages, reply],
            lastMessageTime: new Date()
          };
        }
        return c;
      }));
      
      // Scroll į apačią po gavimo atsakymo
      setTimeout(() => {
        const messagesContainer = document.getElementById('chat-messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }, 2000);
  };

  const buyCredits = (amount, price) => {
    setCredits(prevCredits => prevCredits + amount);
    setShowPayment(false);
    alert(`Sėkmingai nusipirkote ${amount} žinučių už ${price}€!`);
  };

  const isEmail = (str) => {
    return str.includes('@');
  };

  const isPhone = (str) => {
    return /^\+?[0-9]{8,15}$/.test(str.replace(/\s/g, ''));
  };

  // Naujai registruojantis – registracijos forma ir anketa turi būti tuščios
  const openRegistrationModal = () => {
    try {
      localStorage.removeItem('myliu_registrationData');
      localStorage.removeItem('myliu_registrationData_backup');
    } catch (e) {
      console.error('Error clearing registrationData from localStorage:', e);
    }
    // flushSync priverčia React iš karto pritaikyti išvalymą – tik tada atidarome modalą
    flushSync(() => {
      setRegisterFormKey(k => k + 1); // naujas key – forma remountinama
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setVerificationCode('');
      setStoredVerificationCode(null);
      setVerificationSentTo([]);
      setShowVerification(false);
      setRegistrationData({
        photos: [],
        name: '',
        gender: '',
        age: '',
        city: '',
        street: '',
        house: '',
        height: '',
        bodyType: '',
        civilStatus: '',
        hairColor: '',
        eyeColor: '',
        bio: '',
        hobbies: [],
        eroticInterests: []
      });
    });
    setShowRegisterModal(true);
  };

  // Prisijungimo forma – atidarant tuščia; slaptažodžių atmintis gali užpildyti paspaudus ant lauko
  const openLoginModal = () => {
    flushSync(() => {
      setLoginFormKey(k => k + 1);
      setLoginEmailOrPhone('');
      setLoginPassword('');
    });
    setShowLoginModal(true);
  };

  const handleRegister = () => {
    // El. paštas privalomas
    if (!registerEmail.trim()) {
      alert('Prašome įvesti el. pašto adresą');
      return;
    }

    // Validuoti el. paštą
    if (!isEmail(registerEmail)) {
      alert('Prašome įvesti teisingą el. pašto adresą');
      return;
    }

    if (!registerPassword.trim()) {
      alert('Prašome įvesti slaptažodį');
      return;
    }

    if (registerPassword.length < 6) {
      alert('Slaptažodis turi būti bent 6 simbolių');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      alert('Slaptažodžiai nesutampa');
      return;
    }

    // Generuoti patvirtinimo kodą
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setStoredVerificationCode(code); // Išsaugoti kodą patikrinimui
    
    // Siųsti email (privalomas)
    setIsSendingEmail(true);
    setVerificationSentTo(['email']);
    
    // Asinchroniškai siųsti email
    sendVerificationEmail(registerEmail, code, registerEmail.split('@')[0] || 'Naudotojas')
      .then(result => {
        console.log('Email siuntimo rezultatas:', result);
        setIsSendingEmail(false);
        
        if (result.success && !result.mock) {
          // Tikras email išsiųstas sėkmingai
          console.log(`✅ Email sėkmingai išsiųstas į ${registerEmail} iš myliu67x@outlook.com`);
        } else if (result.mock) {
          // Mock mode - development režimas
          console.log(`⚠️ Email siuntimas mock režime. Kodas: ${code}`);
          alert(`Email siuntimas mock režime. Patvirtinimo kodas: ${code}\n\nPastaba: Production režime sukonfigūruokite EmailJS arba Backend email siuntimą.`);
        } else {
          // Email siuntimas nepavyko
          console.warn(`⚠️ Email siuntimo problema: ${result.message}`);
          alert(`Klaida siunčiant email į ${registerEmail}: ${result.message || 'Nežinoma klaida'}\n\nPatvirtinimo kodas: ${code}\n\nPrašome patikrinti email adresą arba naudoti šį kodą testavimui.`);
        }
      })
      .catch(error => {
        console.error('Email siuntimo klaida:', error);
        setIsSendingEmail(false);
        alert(`Nepavyko išsiųsti email į ${registerEmail}.\n\nPatvirtinimo kodas: ${code}\n\nKlaida: ${error.message || 'Nežinoma klaida'}\n\nPrašome patikrinti email adresą arba naudoti šį kodą testavimui.`);
      });
    
    // Atidaryti patvirtinimo modalą
    setShowVerification(true);
    setShowRegisterModal(false);
    
    // Pranešimas vartotojui
    console.log(`Patvirtinimo kodas: ${code}`);
    alert(`Patvirtinimo kodas siunčiamas į el. paštą ${registerEmail}.\n\nPrašome patikrinti el. paštą (taip pat patikrinkite spam folderį).`);
  };

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      alert('Patvirtinimo kodas turi būti 6 skaitmenų');
      return;
    }
    
    // Patikrinti, ar kodas teisingas
    if (storedVerificationCode && verificationCode !== storedVerificationCode) {
      alert('Neteisingas patvirtinimo kodas. Prašome patikrinti ir bandyti dar kartą.');
      return;
    }
    
    // Kodas teisingas - užbaigti registraciją
    alert('Registracija sėkminga! Dabar galite prisijungti.');
    setShowVerification(false);
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setVerificationCode('');
    setStoredVerificationCode(null);
    setVerificationSentTo([]);
    setIsSendingEmail(false);
    openLoginModal();
  };

  // Pilnas atkūrimas iš atsarginės kopijos – savarankiškai užsiregistravusių narių anketos
  const forceRestoreFromBackup = () => {
    try {
      const backupJson = localStorage.getItem('myliu_allMembers_backup');
      if (!backupJson) {
        alert('Atsarginėje kopijoje nėra narių duomenų.');
        return;
      }
      const bp = JSON.parse(backupJson);
      let backupArr = Array.isArray(bp) ? bp : (bp && Array.isArray(bp.members) ? bp.members : []);
      backupArr = backupArr.filter(m => m && m.id);
      if (backupArr.length === 0) {
        alert('Atsarginėje kopijoje nėra narių duomenų.');
        return;
      }
      localStorage.setItem('myliu_allMembers', JSON.stringify(backupArr));
      setAllMembers(backupArr);
      const lastEmail = localStorage.getItem('myliu_lastLoginEmail');
      if (lastEmail) {
        const member = backupArr.find(m => m && m.email === lastEmail);
        if (member) {
          const restoredProfile = {
            name: member.name || '',
            age: member.age || 18,
            city: member.city || '',
            street: member.street || '',
            house: member.house || '',
            gender: member.gender || '',
            bodyType: member.bodyType || 'Vidutinis',
            height: member.height || '175',
            hairColor: member.hairColor || '',
            eyeColor: member.eyeColor || '',
            civilStatus: member.civilStatus || '',
            bio: member.bio || '',
            interests: Array.isArray(member.interests) ? member.interests : [],
            eroticInterests: Array.isArray(member.eroticInterests) ? member.eroticInterests : [],
            photos: Array.isArray(member.photos) ? member.photos : [],
            smoking: member.smoking || 'Ne',
            tattoos: member.tattoos || 'Ne',
            piercing: member.piercing || 'Ne',
            phone: member.phone || '',
            email: lastEmail,
            isOnline: member.isOnline !== undefined ? member.isOnline : true
          };
          localStorage.setItem('myliu_userProfile', JSON.stringify(restoredProfile));
          localStorage.setItem('myliu_userProfile_backup', JSON.stringify({ ...restoredProfile, savedAt: new Date().toISOString() }));
          setUserProfile(restoredProfile);
        }
      }
      setShowSettings(false);
      alert('Anketos atkurtos iš atsarginės kopijos. Puslapis bus perkrautas.');
      window.location.reload();
    } catch (e) {
      console.error('Error force-restoring from backup:', e);
      alert('Nepavyko atkurti: ' + (e.message || 'klaida'));
    }
  };

  const handleLogin = () => {
    if (!loginEmailOrPhone.trim() || !loginPassword.trim()) {
      alert('Prašome užpildyti visus laukus');
      return;
    }

    // Prisijungimas tik per el. paštą
    if (!isEmail(loginEmailOrPhone)) {
      alert('Prašome įvesti teisingą el. pašto adresą');
      return;
    }

    // Atkurti duomenis iš localStorage (VISADA, net jei jie buvo išsaugoti prieš prisijungimą)
    // Su backup atkūrimu jei pagrindiniai duomenys sugadinti
    try {
      // Bandoma atkurti iš pagrindinių
      let savedProfile = localStorage.getItem('myliu_userProfile');
      let savedRegistrationData = localStorage.getItem('myliu_registrationData');
      const savedProfileComplete = localStorage.getItem('myliu_profileComplete');
      
      // Jei pagrindiniai netinkami, bandoma iš backup
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.name && (parsed.name !== 'Tomas' || parsed.photos?.length > 0 || parsed.bio)) {
            setUserProfile(parsed);
          } else {
            // Bandoma iš backup
            const backup = localStorage.getItem('myliu_userProfile_backup');
            if (backup) {
              const backupParsed = JSON.parse(backup);
              if (backupParsed.name && (backupParsed.name !== 'Tomas' || backupParsed.photos?.length > 0 || backupParsed.bio)) {
                setUserProfile(backupParsed);
                localStorage.setItem('myliu_userProfile', JSON.stringify(backupParsed));
              }
            }
          }
        } catch (e) {
          // Jei parse klaida, bandoma iš backup
          const backup = localStorage.getItem('myliu_userProfile_backup');
          if (backup) {
            try {
              const backupParsed = JSON.parse(backup);
              setUserProfile(backupParsed);
              localStorage.setItem('myliu_userProfile', JSON.stringify(backupParsed));
            } catch (e2) {
              console.error('Error loading backup:', e2);
            }
          }
        }
      } else {
        // Jei nėra pagrindinio, bandoma iš backup
        const backup = localStorage.getItem('myliu_userProfile_backup');
        if (backup) {
          try {
            const backupParsed = JSON.parse(backup);
            setUserProfile(backupParsed);
            localStorage.setItem('myliu_userProfile', JSON.stringify(backupParsed));
          } catch (e) {
            console.error('Error loading backup:', e);
          }
        }
      }
      
      // Atkurti registrationData
      if (savedRegistrationData) {
        try {
          const parsed = JSON.parse(savedRegistrationData);
          if (parsed.name || parsed.photos?.length > 0 || parsed.bio) {
            setRegistrationData(parsed);
          } else {
            // Bandoma iš backup
            const backup = localStorage.getItem('myliu_registrationData_backup');
            if (backup) {
              const backupParsed = JSON.parse(backup);
              if (backupParsed.name || backupParsed.photos?.length > 0 || backupParsed.bio) {
                setRegistrationData(backupParsed);
                localStorage.setItem('myliu_registrationData', JSON.stringify(backupParsed));
              }
            }
          }
        } catch (e) {
          // Jei parse klaida, bandoma iš backup
          const backup = localStorage.getItem('myliu_registrationData_backup');
          if (backup) {
            try {
              const backupParsed = JSON.parse(backup);
              setRegistrationData(backupParsed);
              localStorage.setItem('myliu_registrationData', JSON.stringify(backupParsed));
            } catch (e2) {
              console.error('Error loading backup:', e2);
            }
          }
        }
      } else {
        // Jei nėra pagrindinio, bandoma iš backup
        const backup = localStorage.getItem('myliu_registrationData_backup');
        if (backup) {
          try {
            const backupParsed = JSON.parse(backup);
            setRegistrationData(backupParsed);
            localStorage.setItem('myliu_registrationData', JSON.stringify(backupParsed));
          } catch (e) {
            console.error('Error loading backup:', e);
          }
        }
      }
      
      // Atkurti profileComplete
      if (savedProfileComplete === 'true') {
        setProfileComplete(true);
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }

    // Prisijungti – atkurti VISUS profilio duomenis iš allMembers (apsauga nuo duomenų praradimo)
    const loginEmail = loginEmailOrPhone.trim();
    try {
      const membersJson = localStorage.getItem('myliu_allMembers');
      const members = membersJson ? JSON.parse(membersJson) : [];
      const member = Array.isArray(members) && members.find(m => m && m.email === loginEmail);
      if (member) {
        // Atkurti VISUS duomenis iš allMembers – užtikrinti, kad visi laukai būtų užpildyti
        const restoredProfile = {
          name: member.name || '',
          age: member.age || 18,
          city: member.city || '',
          street: member.street || '',
          house: member.house || '',
          gender: member.gender || '',
          bodyType: member.bodyType || 'Vidutinis',
          height: member.height || '175',
          hairColor: member.hairColor || '',
          eyeColor: member.eyeColor || '',
          civilStatus: member.civilStatus || '',
          bio: member.bio || '',
          interests: Array.isArray(member.interests) ? member.interests : [],
          eroticInterests: Array.isArray(member.eroticInterests) ? member.eroticInterests : [],
          photos: Array.isArray(member.photos) ? member.photos : [],
          smoking: member.smoking || 'Ne',
          tattoos: member.tattoos || 'Ne',
          piercing: member.piercing || 'Ne',
          phone: member.phone || '',
          email: loginEmail,
          isOnline: member.isOnline !== undefined ? member.isOnline : true
        };
        setUserProfile(restoredProfile);
        // Sinchronizuoti registrationData su prisijungusio nario duomenimis – kad „Mano profilis“ forma rodytų to nario anketą, ne kito
        const regData = {
          photos: Array.isArray(member.photos) ? member.photos : [],
          name: member.name || '',
          gender: member.gender || '',
          age: member.age || '',
          city: member.city || '',
          street: member.street || '',
          house: member.house || '',
          height: member.height || '175',
          bodyType: member.bodyType || 'Vidutinis',
          civilStatus: member.civilStatus || '',
          hairColor: member.hairColor || '',
          eyeColor: member.eyeColor || '',
          bio: member.bio || '',
          hobbies: Array.isArray(member.interests) ? member.interests : [],
          eroticInterests: Array.isArray(member.eroticInterests) ? member.eroticInterests : []
        };
        setRegistrationData(regData);
        localStorage.setItem('myliu_registrationData', JSON.stringify(regData));
        // Išsaugoti atkurtą profilį su VISOMIS duomenimis
        localStorage.setItem('myliu_userProfile', JSON.stringify(restoredProfile));
        localStorage.setItem('myliu_userProfile_backup', JSON.stringify({
          ...restoredProfile,
          savedAt: new Date().toISOString()
        }));
        // Išsaugoti email, kad kitą kartą galėtume atkurti iš allMembers
        localStorage.setItem('myliu_lastLoginEmail', loginEmail);
        // Jei profilis turi duomenis, nustatyti profileComplete
        if (restoredProfile.name && restoredProfile.photos?.length > 0) {
          setProfileComplete(true);
          localStorage.setItem('myliu_profileComplete', 'true');
        }
      } else {
        // Jei narys nerastas allMembers, tik pridėti email (neperrašyti esamų duomenų)
        setUserProfile(prev => ({ ...prev, email: loginEmail }));
      }
    } catch (e) {
      console.error('Error restoring profile from allMembers:', e);
      setUserProfile(prev => ({ ...prev, email: loginEmail }));
    }
    setIsLoggedIn(true);
    localStorage.setItem('myliu_isLoggedIn', 'true');
    setShowLoginModal(false);
    setLoginEmailOrPhone('');
    setLoginPassword('');
  };

  // Patvirtinti anketą – profilis atsiranda tarp narių
  const handleCompleteProfile = () => {
    const errors = [];
    if (!registrationData.name?.trim()) errors.push('Vardas');
    if (!registrationData.gender) errors.push('Lytis');
    if (!registrationData.age) errors.push('Amžius');
    if (!registrationData.city?.trim()) errors.push('Miestas');
    if (!registrationData.photos?.length) errors.push('Bent viena nuotrauka');
    if (errors.length > 0) {
      alert(`Prašome užpildyti privalomus laukus:\n${errors.join(', ')}`);
      return;
    }
    // SVARBU: Naudoti registrationData duomenis (naujai užpildyti), bet jei trūksta – naudoti userProfile (apsauga nuo praradimo)
    const updatedProfile = {
      name: registrationData.name?.trim() || userProfile.name || '',
      gender: registrationData.gender || userProfile.gender || '',
      age: parseInt(registrationData.age, 10) || userProfile.age || 18,
      city: registrationData.city?.trim() || userProfile.city || '',
      street: registrationData.street?.trim() || userProfile.street || '',
      house: registrationData.house?.trim() || userProfile.house || '',
      height: registrationData.height || userProfile.height || '175',
      bodyType: registrationData.bodyType || userProfile.bodyType || 'Vidutinis',
      civilStatus: registrationData.civilStatus || userProfile.civilStatus || '',
      hairColor: registrationData.hairColor || userProfile.hairColor || '',
      eyeColor: registrationData.eyeColor || userProfile.eyeColor || '',
      bio: registrationData.bio?.trim() || userProfile.bio || '',
      interests: Array.isArray(registrationData.hobbies) && registrationData.hobbies.length > 0 
        ? registrationData.hobbies 
        : (Array.isArray(userProfile.interests) ? userProfile.interests : []),
      eroticInterests: Array.isArray(registrationData.eroticInterests) && registrationData.eroticInterests.length > 0
        ? registrationData.eroticInterests
        : (Array.isArray(userProfile.eroticInterests) ? userProfile.eroticInterests : []),
      photos: Array.isArray(registrationData.photos) && registrationData.photos.length > 0
        ? registrationData.photos
        : (Array.isArray(userProfile.photos) ? userProfile.photos : []),
      isOnline: userProfile.isOnline !== undefined ? userProfile.isOnline : true,
      smoking: userProfile.smoking || 'Ne',
      tattoos: userProfile.tattoos || 'Ne',
      piercing: userProfile.piercing || 'Ne',
      phone: userProfile.phone || '',
      email: userProfile.email || ''
    };
    
    setUserProfile(updatedProfile);
    setProfileComplete(true);
    setShowProfileForm(false);
    setCurrentView('nariai');
    
    // Pridėti / atnaujinti šį narį į visų narių sąrašą (kad kiti matytų) – visada išsaugome visus duomenis
    const memberId = updatedProfile.email ? 'member-' + updatedProfile.email : 'member-' + Date.now();
    const memberCard = {
      id: memberId,
      email: updatedProfile.email || '',
      name: updatedProfile.name || '',
      age: updatedProfile.age,
      city: updatedProfile.city || '',
      street: updatedProfile.street || '',
      house: updatedProfile.house || '',
      distance: 0.5,
      gender: updatedProfile.gender || '',
      bodyType: updatedProfile.bodyType || 'Vidutinis',
      height: String(updatedProfile.height || '175'),
      hairColor: updatedProfile.hairColor || '',
      eyeColor: updatedProfile.eyeColor || '',
      civilStatus: updatedProfile.civilStatus || '',
      smoking: updatedProfile.smoking || 'Ne',
      tattoos: updatedProfile.tattoos || 'Ne',
      piercing: updatedProfile.piercing || 'Ne',
      bio: updatedProfile.bio || '',
      interests: updatedProfile.interests || [],
      eroticInterests: updatedProfile.eroticInterests || [],
      photos: Array.isArray(updatedProfile.photos) ? updatedProfile.photos : [],
      avatar: '👤',
      avatarBg: 'from-orange-400 to-orange-600',
      isOnline: true,
      status: { watching: false, liked: false, likedMe: false }
    };
    setAllMembers(prev => {
      // SVARBU: Visada išsaugoti VISUS duomenis – niekada neperrašyti su tuščiais
      const existingIndex = prev.findIndex(p => p && (p.email === updatedProfile.email || p.id === memberId));
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        // Sujungti esamus duomenis su naujais – jei nauji turi duomenų, naudoti juos; jei ne, išlaikyti esamus
        const merged = {
          ...existing, // Pradėti nuo esamų duomenų (apsauga nuo praradimo)
          ...memberCard, // Perrašyti naujais duomenimis
          status: existing.status || memberCard.status, // Išsaugoti status
          // Jei nauji duomenys tušti, bet esami turi – išlaikyti esamus
          photos: (Array.isArray(memberCard.photos) && memberCard.photos.length > 0) ? memberCard.photos : (existing.photos || []),
          name: memberCard.name || existing.name || '',
          bio: memberCard.bio || existing.bio || '',
          interests: (Array.isArray(memberCard.interests) && memberCard.interests.length > 0) ? memberCard.interests : (existing.interests || []),
          eroticInterests: (Array.isArray(memberCard.eroticInterests) && memberCard.eroticInterests.length > 0) ? memberCard.eroticInterests : (existing.eroticInterests || [])
        };
        const newMembers = [...prev];
        newMembers[existingIndex] = merged;
        return newMembers;
      } else {
        return [...prev, memberCard];
      }
    });
    
    // Išsaugoti į localStorage su VISOMIS duomenimis (apsauga nuo praradimo)
    try {
      localStorage.setItem('myliu_userProfile', JSON.stringify(updatedProfile));
      localStorage.setItem('myliu_profileComplete', 'true');
      localStorage.setItem('myliu_registrationData', JSON.stringify(registrationData));
      // Išsaugoti email, kad kitą kartą galėtume atkurti iš allMembers
      if (updatedProfile.email) {
        localStorage.setItem('myliu_lastLoginEmail', updatedProfile.email);
      }
      // Backup - išsaugoti su timestamp
      localStorage.setItem('myliu_userProfile_backup', JSON.stringify({
        ...updatedProfile,
        savedAt: new Date().toISOString()
      }));
      localStorage.setItem('myliu_registrationData_backup', JSON.stringify({
        ...registrationData,
        savedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      try {
        localStorage.removeItem('myliu_userProfile_backup');
        localStorage.setItem('myliu_userProfile', JSON.stringify(updatedProfile));
        localStorage.setItem('myliu_profileComplete', 'true');
        localStorage.setItem('myliu_registrationData', JSON.stringify(registrationData));
        if (updatedProfile.email) {
          localStorage.setItem('myliu_lastLoginEmail', updatedProfile.email);
        }
      } catch (e2) {
        console.error('Error saving after cleanup:', e2);
      }
    }
    
    alert('Anketa patvirtinta! Jūsų profilis dabar matomas tarp narių.');
  };

  const renderStatusIcons = (status) => {
    const icons = [];
    if (status.watching) {
      icons.push(<div key="watch" className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
        <Heart size={18} className="text-blue-500" fill="currentColor" />
      </div>);
    }
    if (status.liked) {
      icons.push(<div key="liked" className="absolute top-2 left-12 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
        <Heart size={18} className="text-yellow-500" fill="currentColor" />
      </div>);
    }
    if (status.likedMe) {
      icons.push(<div key="likedMe" className="absolute top-2 left-22 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
        <Heart size={18} className="text-red-500" fill="currentColor" />
      </div>);
    }
    return icons;
  };

  const ProfileCard = ({ profile, onClick, hasConversation }) => {
    return (
      <div className="relative group w-full sm:w-[280px] mx-auto" style={{ height: '450px', maxWidth: '280px' }}>
        <div 
          onClick={onClick}
          className="relative rounded-xl overflow-hidden cursor-pointer w-full"
          style={{ height: '350px', maxWidth: '280px' }}
        >
          {/* Photo or Avatar - z-index: 0 (base layer) */}
          <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${profile.avatarBg} flex items-center justify-center`}>
            {profile.photos && profile.photos.length > 0 && profile.photos[0] !== '' ? (
              <img 
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="text-8xl">${profile.avatar}</div>`;
                }}
              />
            ) : (
              <div className="text-8xl">{profile.avatar}</div>
            )}
          </div>
            
          {/* Status Icons - Top Left - z-index: 20 */}
          <div className="absolute top-2 left-2 flex gap-1 z-20">
            {hasConversation && (
              <div className="flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#9CA3AF" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            )}
            {profile.status.watching && (
              <div className="flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#3B82F6" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            )}
            {profile.status.liked && (
              <div className="flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#FBBF24" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            )}
            {profile.status.likedMe && (
              <div className="flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#EF4444" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            )}
          </div>

          {/* Distance - Top Right - z-index: 20 */}
          <div className="absolute top-2 right-2 bg-black/80 text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-20">
            <MapPin size={12} />
            {profile.distance} km
          </div>

          {/* Info Section - Inside card at bottom - z-index: 10 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-8 z-10">
            <h3 className="text-white font-bold text-lg leading-tight">{profile.name}</h3>
            <p className="text-white/90 text-sm">{profile.age} m.</p>
          </div>

          {/* Online Status - Bottom Right - z-index: 20 */}
          {profile.isOnline && (
            <div className="absolute bottom-3 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg z-20"></div>
          )}
        </div>

        {/* Action Buttons - Outside card */}
        <div className="flex gap-2 mt-3">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              toggleStatus(profile.id, 'watching');
            }}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all border-2 border-orange-500 ${
              profile.status.watching
                ? 'text-white'
                : 'bg-gray-800 text-orange-500 hover:bg-orange-500/10'
            }`}
            style={profile.status.watching ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={profile.status.watching ? "white" : "#3B82F6"} stroke="white" strokeWidth="2"/>
            </svg>
            {profile.status.watching ? 'Stebiu' : 'Stebėti'}
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              toggleStatus(profile.id, 'liked');
            }}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all border-2 border-orange-500 ${
              profile.status.liked
                ? 'text-white'
                : 'bg-gray-800 text-orange-500 hover:bg-orange-500/10'
            }`}
            style={profile.status.liked ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={profile.status.liked ? "white" : "#FBBF24"} stroke="white" strokeWidth="2"/>
            </svg>
            {profile.status.liked ? 'Myliu' : 'Mylėti'}
          </button>
        </div>
      </div>
    );
  };

  const sortedConversations = [...conversations].sort((a, b) => 
    b.lastMessageTime - a.lastMessageTime
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header – fiksuotas aukštis; tik logo raides 2× didesnės (scale), lango aukštis nekeičiamas */}
      <div className="bg-gray-800 border-b border-gray-700 py-1 sm:py-1.5 px-1.5 sm:px-4 overflow-hidden">
        <div className="w-full mx-auto flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-0.5 sm:gap-3 flex-shrink-0 overflow-visible">
            <h1 className="flex items-center flex-shrink-0 bg-gray-800 rounded">
              <img src="/logo-67x.png" alt="67X gyvenimas be ribų" className="h-10 sm:h-12 w-auto object-contain object-left mix-blend-lighten object-center" />
            </h1>
            </div>
          
          <div className="flex items-center gap-0.5 sm:gap-2 lg:gap-4 flex-shrink-0 ml-auto">
            <button
              onClick={() => {
                setCurrentView('pokalbiai');
                setShowUnreadOnly(true);
              }}
              className="relative p-1 sm:p-2 hover:bg-gray-700 rounded-full"
            >
              <MessageCircle size={16} className="sm:w-6 sm:h-6" />
              {(() => {
                const unreadCount = conversations.reduce((count, conv) => {
                  return count + conv.messages.filter(msg => msg.sender === 'them' && !msg.read).length;
                }, 0);
                return unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] sm:text-xs w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                ) : null;
              })()}
            </button>
            <div className="bg-gray-700 px-1.5 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2">
              <CreditCard size={12} className="sm:w-[18px] sm:h-[18px] text-orange-500" />
              <span className="font-bold text-xs sm:text-base">{credits}</span>
              <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">žinutės</span>
              {TRIAL_MESSAGES - totalMessagesSent > 0 && (
                <span className="text-[10px] sm:text-xs text-green-400 ml-1 sm:ml-2 hidden lg:inline">
                  (Bandomasis: {TRIAL_MESSAGES - totalMessagesSent} liko)
                </span>
              )}
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="relative p-1 sm:p-2 hover:bg-gray-700 rounded-full"
            >
              <Bell size={16} className="sm:w-6 sm:h-6" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] sm:text-xs w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <button 
              onClick={() => setCurrentView('profilis')}
              className="p-0.5 sm:p-1 hover:bg-gray-700 rounded-full overflow-hidden flex-shrink-0"
              title="Mano profilis"
            >
              {isLoggedIn && userProfile.photos?.length > 0 && userProfile.photos[0] ? (
                <img src={userProfile.photos[0]} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
              ) : (
                <User size={16} className="sm:w-6 sm:h-6" />
              )}
            </button>
            <div className="flex items-center gap-0.5 sm:gap-3">
              <button
                onClick={openRegistrationModal}
                className="px-1.5 sm:px-4 py-1 sm:py-2.5 bg-gray-700 hover:bg-gray-600 text-[10px] sm:text-base font-medium rounded-lg border-2 border-orange-500 transition-colors"
              >
                <span className="hidden sm:inline">Reg</span>
                <span className="sm:hidden">R</span>
              </button>
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    setIsLoggedIn(false);
                    localStorage.removeItem('myliu_isLoggedIn');
                    localStorage.removeItem('myliu_userProfile');
                    localStorage.removeItem('myliu_profileComplete');
                    localStorage.removeItem('myliu_registrationData');
                  } else {
                    openLoginModal();
                  }
                }}
                className={`px-1.5 sm:px-4 py-1 sm:py-2.5 text-[10px] sm:text-base font-medium rounded-lg border-2 border-orange-500 transition-colors ${
                  isLoggedIn 
                    ? 'bg-orange-300 hover:bg-orange-400 text-gray-900' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <span className="hidden sm:inline">{isLoggedIn ? 'Atsijungti' : 'Pri'}</span>
                <span className="sm:hidden">{isLoggedIn ? 'A' : 'P'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="w-full mx-auto grid grid-cols-3 sm:flex sm:items-center sm:justify-center gap-2 sm:gap-4 lg:gap-8 p-2 sm:p-4">
          <button
            onClick={() => setCurrentView('nariai')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors border-2 border-orange-500 ${
              currentView === 'nariai' ? 'text-white' : 'text-orange-500 hover:text-orange-400'
            }`}
            style={currentView === 'nariai' ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
          >
            <Search size={16} className="sm:w-5 sm:h-5" style={currentView === 'nariai' ? { color: 'white' } : { color: '#f97316' }} />
            <span className="font-medium text-xs sm:text-base">Nariai</span>
          </button>
          <button
            onClick={() => {
              setCurrentView('pokalbiai');
              setShowUnreadOnly(false);
            }}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors border-2 border-orange-500 ${
              currentView === 'pokalbiai' ? 'text-white' : 'text-orange-500 hover:text-orange-400'
            }`}
            style={currentView === 'pokalbiai' ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
          >
            <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#9CA3AF" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="font-medium text-xs sm:text-base">Kalbam</span>
          </button>
          <button
            onClick={() => setCurrentView('stebiu')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors border-2 border-orange-500 ${
              currentView === 'stebiu' ? 'text-white' : 'text-orange-500 hover:text-orange-400'
            }`}
            style={currentView === 'stebiu' ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
          >
            <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#3B82F6" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="font-medium text-xs sm:text-base">Stebiu</span>
          </button>
          <button
            onClick={() => setCurrentView('myliu')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors border-2 border-orange-500 ${
              currentView === 'myliu' ? 'text-white' : 'text-orange-500 hover:text-orange-400'
            }`}
            style={currentView === 'myliu' ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
          >
            <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#FBBF24" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="font-medium text-xs sm:text-base">Myliu</span>
          </button>
          <button
            onClick={() => setCurrentView('myli')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors border-2 border-orange-500 ${
              currentView === 'myli' ? 'text-white' : 'text-orange-500 hover:text-orange-400'
            }`}
            style={currentView === 'myli' ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
          >
            <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#EF4444" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="font-medium text-xs sm:text-base">Myli</span>
          </button>
          <button
            onClick={() => setCurrentView('lankytojai')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors border-2 border-orange-500 ${
              currentView === 'lankytojai' ? 'text-white' : 'text-orange-500 hover:text-orange-400'
            }`}
            style={currentView === 'lankytojai' ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
          >
            <Eye size={16} className="sm:w-5 sm:h-5" style={currentView === 'lankytojai' ? { color: 'white' } : { color: '#f97316' }} />
            <span className="font-medium text-xs sm:text-base">Lankytojai</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full mx-auto p-2 sm:p-4 lg:p-6">
          {/* Nariai View */}
          {currentView === 'nariai' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Nariai</h2>
                  <p className="text-orange-500 text-base sm:text-lg">
                    {displayProfiles.filter(profile => {
                      if (profile.age < filters.minAge || profile.age > filters.maxAge) return false;
                      if (profile.distance > filters.distance) return false;
                      if (filters.gender !== 'visi' && profile.gender !== filters.gender) return false;
                      if (filters.bodyType !== 'visi' && profile.bodyType !== filters.bodyType) return false;
                      const height = parseInt(profile.height);
                      if (height < filters.minHeight || height > filters.maxHeight) return false;
                      if (filters.eroticInterest !== 'visi') {
                        if (!profile.eroticInterests || !profile.eroticInterests.includes(filters.eroticInterest)) {
                          return false;
                        }
                      }
                      return true;
                    }).length} nariai rasta
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gray-800 hover:bg-gray-700 px-3 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 sm:flex-initial"
                >
                  <Settings size={16} className="sm:w-5 sm:h-5" />
                  <span>Filtrai</span>
                  </button>
                  <div className="relative sort-dropdown-container">
                    <button
                      onClick={() => setShowSort(!showSort)}
                      className="bg-gray-800 hover:bg-gray-700 px-3 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 sm:flex-initial"
                    >
                      <span>Rūšiuoti</span>
                    </button>
                    {showSort && (
                      <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px]">
                        <button
                          onClick={() => {
                            setSortBy('manoPasirinkimai');
                            setShowSort(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${
                            sortBy === 'manoPasirinkimai' ? 'bg-gray-700 text-orange-500' : 'text-white'
                          }`}
                        >
                          Mano pasirinkimai
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('vardas');
                            setShowSort(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${
                            sortBy === 'vardas' ? 'bg-gray-700 text-orange-500' : 'text-white'
                          }`}
                        >
                          Pagal vardą
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('atstumas');
                            setShowSort(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${
                            sortBy === 'atstumas' ? 'bg-gray-700 text-orange-500' : 'text-white'
                          }`}
                        >
                          Pagal atstumą
                </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="bg-gray-800 rounded-lg p-3 sm:p-6 mb-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-4">Paieškos filtrai</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Lytis</label>
                      <select 
                        value={filters.gender}
                        onChange={(e) => setFilters({...filters, gender: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base"
                      >
                        <option value="Moteris">Moteris</option>
                        <option value="Vyras">Vyras</option>
                        <option value="visi">Visi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Kūno tipas</label>
                      <select 
                        value={filters.bodyType}
                        onChange={(e) => setFilters({...filters, bodyType: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base"
                      >
                        <option value="visi">Visi</option>
                        <option value="Lieknas">Lieknas</option>
                        <option value="Atletiškas">Atletiškas</option>
                        <option value="Vidutinis">Vidutinis</option>
                        <option value="Stambesnis">Stambesnis</option>
                        <option value="Apkūnus">Apkūnus</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Amžius: {filters.minAge} - {filters.maxAge} m.
                      </label>
                      <div className="flex gap-4">
                        <input
                          type="range"
                          min="18"
                          max="80"
                          value={filters.minAge}
                          onChange={(e) => setFilters({...filters, minAge: parseInt(e.target.value)})}
                          className="flex-1"
                        />
                        <input
                          type="range"
                          min="18"
                          max="80"
                          value={filters.maxAge}
                          onChange={(e) => setFilters({...filters, maxAge: parseInt(e.target.value)})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Atstumas: {filters.distance} km
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="500"
                        value={filters.distance}
                        onChange={(e) => setFilters({...filters, distance: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Erotiškumas</label>
                      <select 
                        value={filters.eroticInterest}
                        onChange={(e) => setFilters({...filters, eroticInterest: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base"
                      >
                        <option value="visi">Visi</option>
                        <option value="Pasimatymai">Pasimatymai</option>
                        <option value="Bučiavimasis">Bučiavimasis</option>
                        <option value="Saugus seksas">Saugus seksas</option>
                        <option value="Glamonės">Glamonės</option>
                        <option value="Erotinis masažas">Erotinis masažas</option>
                        <option value="Tantrinis seksas">Tantrinis seksas</option>
                        <option value="Virtualus seksas">Virtualus seksas</option>
                        <option value="Viešas seksas">Viešas seksas</option>
                        <option value="Oralinis seksas">Oralinis seksas</option>
                        <option value="Analinis saksas">Analinis saksas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ūgis: {filters.minHeight} - {filters.maxHeight} cm
                      </label>
                      <div className="flex gap-4">
                        <input
                          type="range"
                          min="150"
                          max="200"
                          value={filters.minHeight}
                          onChange={(e) => setFilters({...filters, minHeight: parseInt(e.target.value)})}
                          className="flex-1"
                        />
                        <input
                          type="range"
                          min="150"
                          max="200"
                          value={filters.maxHeight}
                          onChange={(e) => setFilters({...filters, maxHeight: parseInt(e.target.value)})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {displayProfiles.filter(profile => {
                  // Amžiaus filtras
                  if (profile.age < filters.minAge || profile.age > filters.maxAge) return false;
                  
                  // Atstumo filtras
                  if (profile.distance > filters.distance) return false;
                  
                  // Lyties filtras
                  if (filters.gender !== 'visi' && profile.gender !== filters.gender) return false;
                  
                  // Kūno tipo filtras
                  if (filters.bodyType !== 'visi' && profile.bodyType !== filters.bodyType) return false;
                  
                  // Ūgio filtras
                  const height = parseInt(profile.height);
                  if (height < filters.minHeight || height > filters.maxHeight) return false;
                  
                  // Erotiškumo filtras
                  if (filters.eroticInterest !== 'visi') {
                    if (!profile.eroticInterests || !profile.eroticInterests.includes(filters.eroticInterest)) {
                      return false;
                    }
                  }
                  
                  return true;
                }).sort((a, b) => {
                  if (sortBy === 'manoPasirinkimai') {
                    // Pirmiausia tie, kurie yra kalbam, myli, myliu, stebiu papkėse
                    const aHasConversation = !!conversations.find(c => c.profileId === a.id);
                    const bHasConversation = !!conversations.find(c => c.profileId === b.id);
                    const aLikedMe = a.status?.likedMe || false;
                    const bLikedMe = b.status?.likedMe || false;
                    const aLiked = a.status?.liked || false;
                    const bLiked = b.status?.liked || false;
                    const aWatching = a.status?.watching || false;
                    const bWatching = b.status?.watching || false;
                    
                    const aHasStatus = aHasConversation || aLikedMe || aLiked || aWatching;
                    const bHasStatus = bHasConversation || bLikedMe || bLiked || bWatching;
                    
                    if (aHasStatus && !bHasStatus) return -1;
                    if (!aHasStatus && bHasStatus) return 1;
                    
                    // Jei abu turi statusą, rūšiuojame pagal prioritetą: kalbam > myli > myliu > stebiu
                    const getPriority = (profile, hasConv) => {
                      if (hasConv) return 4;
                      if (profile.status?.likedMe) return 3;
                      if (profile.status?.liked) return 2;
                      if (profile.status?.watching) return 1;
                      return 0;
                    };
                    
                    const aPriority = getPriority(a, aHasConversation);
                    const bPriority = getPriority(b, bHasConversation);
                    const priorityDiff = bPriority - aPriority;
                    if (priorityDiff !== 0) return priorityDiff;
                    
                    // Jei prioritetas vienodas, rūšiuojame pagal vardą
                    return a.name.localeCompare(b.name, 'lt');
                  } else if (sortBy === 'vardas') {
                    return a.name.localeCompare(b.name, 'lt');
                  } else if (sortBy === 'atstumas') {
                    return a.distance - b.distance;
                  }
                  return 0;
                }).map(profile => (
                  <div key={profile.id} className="w-full sm:w-[280px] flex justify-center">
                    <ProfileCard 
                      profile={profile}
                      onClick={() => setSelectedProfile(profile)}
                      hasConversation={!!conversations.find(c => c.profileId === profile.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pokalbiai View */}
          {currentView === 'pokalbiai' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Pokalbiai</h2>
              {(() => {
                const conversationsToShow = showUnreadOnly 
                  ? sortedConversations.filter(conv => {
                      return conv.messages.some(msg => msg.sender === 'them' && !msg.read);
                    })
                  : sortedConversations;
                
                if (conversationsToShow.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-400">
                      <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>{showUnreadOnly ? 'Nėra neperskaitytų žinučių' : 'Dar neturite pokalbių'}</p>
                    </div>
                  );
                }
                
                return (
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    {conversationsToShow.map(conv => {
                      const profile = getProfile(conv.profileId);
                      return (
                        <div key={conv.profileId} className="w-full sm:w-[280px] flex justify-center">
                          <ProfileCard 
                            profile={profile}
                            onClick={() => {
                              // Patikrinti, ar profilis užpildytas
                              if (!profileComplete) {
                                alert('Prašome pirmiausia užpildyti savo profilį. Be užpildytos anketos negalite atidaryti pokalbių.');
                                setShowProfileForm(true);
                                return;
                              }
                              
                              setActiveChat(conv.profileId);
                              setSelectedProfile(profile);
                              setShowUnreadOnly(false);
                              // Pažymėti žinutes kaip perskaitytas
                              setConversations(prevConversations => prevConversations.map(c => {
                                if (c.profileId === conv.profileId) {
                                  return {
                                    ...c,
                                    messages: c.messages.map(msg => 
                                      msg.sender === 'them' && !msg.read ? { ...msg, read: true } : msg
                                    )
                                  };
                                }
                                return c;
                              }));
                            }}
                            hasConversation={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Stebiu View */}
          {currentView === 'stebiu' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Stebiu</h2>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {displayProfiles.filter(p => p.status?.watching).map(profile => (
                  <div key={profile.id} className="w-full sm:w-[280px] flex justify-center">
                    <ProfileCard 
                      profile={profile}
                      onClick={() => setSelectedProfile(profile)}
                      hasConversation={!!conversations.find(c => c.profileId === profile.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Myliu View */}
          {currentView === 'myliu' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Myliu</h2>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {displayProfiles.filter(p => p.status?.liked).map(profile => (
                  <div key={profile.id} className="w-full sm:w-[280px] flex justify-center">
                    <ProfileCard 
                      profile={profile}
                      onClick={() => setSelectedProfile(profile)}
                      hasConversation={!!conversations.find(c => c.profileId === profile.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Myli View */}
          {currentView === 'myli' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Myli mane</h2>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {displayProfiles.filter(p => p.status?.likedMe).map(profile => (
                  <div key={profile.id} className="w-full sm:w-[280px] flex justify-center">
                    <ProfileCard 
                      profile={profile}
                      onClick={() => setSelectedProfile(profile)}
                      hasConversation={!!conversations.find(c => c.profileId === profile.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lankytojai View */}
          {currentView === 'lankytojai' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Lankytojai</h2>
              <div className="space-y-4">
                {visitors.map(visitor => {
                  const profile = getProfile(visitor.profileId);
                  return (
                    <div 
                      key={visitor.profileId}
                      onClick={() => setSelectedProfile(profile)}
                      className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-700"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                        <img 
                          src={profile.photos[0]}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${profile.avatarBg} flex items-center justify-center text-3xl">${profile.avatar}</div>`;
                          }}
                        />
                        {profile.isOnline && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{profile.name}</h3>
                        <p className="text-gray-400 text-sm">{profile.age} m. • {profile.city}</p>
                      </div>
                      <div className="text-gray-400 text-sm">{visitor.visitTime}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Registration View */}
          {currentView === 'registracija' && (
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Registracija</h2>
              
              <div className="bg-gray-800 rounded-lg p-3 sm:p-6 space-y-6 sm:space-y-8">
              {/* Nuotraukos */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Nuotraukos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {registrationData.photos && registrationData.photos.map((photo, idx) => (
                      <div key={idx} className="aspect-[4/5] bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden relative group">
                        {photo ? (
                          <>
                            <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                const newPhotos = registrationData.photos.filter((_, index) => index !== idx);
                                setRegistrationData({...registrationData, photos: newPhotos});
                              }}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <div className="text-6xl">📸</div>
                        )}
                      </div>
                    ))}
                    {(!registrationData.photos || registrationData.photos.length < 6) && (
                      <label className={`aspect-[4/5] bg-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors ${uploadingPhotos ? 'opacity-50 cursor-wait' : ''}`}>
                        {uploadingPhotos ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                            <span className="text-sm text-gray-400">Apdorojama...</span>
                          </>
                        ) : (
                          <>
                            <Camera size={32} className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-400">Įkelti</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          disabled={uploadingPhotos}
                          onChange={async (e) => {
                            const files = Array.from(e.target.files);
                            if (files.length === 0) return;
                            if ((registrationData.photos || []).length >= 6) {
                              alert('Galite įkelti daugiausiai 6 nuotraukas');
                              e.target.value = '';
                              return;
                            }
                            // Open photo editor for registration
                            openPhotoEditor(files[0], true);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Galite įkelti iki 6 nuotraukų. Nuotraukos bus automatiškai sumažintos.</p>
                </div>

                {/* Vardas */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Vardas</h3>
                  <input 
                    type="text" 
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    placeholder="Įveskite savo vardą"
                  />
                </div>

                {/* Bendra informacija */}
                    <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Bendra informacija</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Lytis *</label>
                      <select 
                        value={registrationData.gender}
                        onChange={(e) => setRegistrationData({...registrationData, gender: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Vyras">Vyras</option>
                        <option value="Moteris">Moteris</option>
                        <option value="Neapsisprendęs">Neapsisprendęs</option>
                        <option value="Nenoriu nurodyti">Nenoriu nurodyti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Amžius *</label>
                      <select 
                        value={registrationData.age}
                        onChange={(e) => setRegistrationData({...registrationData, age: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        {Array.from({length: 63}, (_, i) => i + 18).map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-400 mb-2">Vietovė *</label>
                      <div className="flex gap-2">
                      <input 
                        type="text" 
                          value={registrationData.city}
                          onChange={(e) => setRegistrationData({...registrationData, city: e.target.value})}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          placeholder="Miestas"
                        />
                        <input 
                          type="text" 
                          value={registrationData.street}
                          onChange={(e) => setRegistrationData({...registrationData, street: e.target.value})}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          placeholder="Gatvė"
                        />
                        <input 
                          type="text" 
                          value={registrationData.house}
                          onChange={(e) => setRegistrationData({...registrationData, house: e.target.value})}
                          className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          placeholder="Namas"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                // In real app, you would reverse geocode the coordinates
                                alert('Geolokacija gauta. Miestas ir gatvė bus automatiškai užpildyti.');
                              },
                              (error) => {
                                alert('Nepavyko gauti geolokacijos. Įveskite rankiniu būdu.');
                              }
                            );
                          } else {
                            alert('Jūsų naršyklė nepalaiko geolokacijos.');
                          }
                        }}
                        className="mt-2 text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1"
                      >
                        <MapPin size={14} />
                        Gauti iš geolokacijos
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Ūgis *</label>
                      <input 
                        type="number" 
                        value={registrationData.height}
                        onChange={(e) => setRegistrationData({...registrationData, height: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                        placeholder="Pvz., 175 cm"
                        min="100"
                        max="250"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Kūno tipas *</label>
                      <select 
                        value={registrationData.bodyType}
                        onChange={(e) => setRegistrationData({...registrationData, bodyType: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Lieknas">Lieknas</option>
                        <option value="Atletiškas">Atletiškas</option>
                        <option value="Vidutinis">Vidutinis</option>
                        <option value="Stambesnis">Stambesnis</option>
                        <option value="Apkūnus">Apkūnus</option>
                        <option value="Nenoriu nurodyti">Nenoriu nurodyti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Šeimyninė padėtis *</label>
                      <select 
                        value={registrationData.civilStatus}
                        onChange={(e) => setRegistrationData({...registrationData, civilStatus: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Vienišius">Vienišius</option>
                        <option value="Išsiskyręs (-usi)">Išsiskyręs (-usi)</option>
                        <option value="Vedęs/įštekėjusi">Vedęs/įštekėjusi</option>
                        <option value="Santykiuose">Santykiuose</option>
                        <option value="Kita">Kita</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Plaukų spalva *</label>
                      <select 
                        value={registrationData.hairColor}
                        onChange={(e) => setRegistrationData({...registrationData, hairColor: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Šviesūs">Šviesūs</option>
                        <option value="Tamsūs">Tamsūs</option>
                        <option value="Rudi">Rudi</option>
                        <option value="Juodi">Juodi</option>
                        <option value="Raudoni">Raudoni</option>
                        <option value="Žili">Žili</option>
                        <option value="Daugiaspalviai">Daugiaspalviai</option>
                        <option value="Plikė">Plikė</option>
                        <option value="Kita">Kita</option>
                        <option value="Nenoriu nurodyti">Nenoriu nurodyti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Akių spalva *</label>
                      <select 
                        value={registrationData.eyeColor}
                        onChange={(e) => setRegistrationData({...registrationData, eyeColor: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Mėlynos">Mėlynos</option>
                        <option value="Žalios">Žalios</option>
                        <option value="Rudos">Rudos</option>
                        <option value="Pilkos">Pilkos</option>
                        <option value="Gintarinės">Gintarinės</option>
                        <option value="Mišrios">Mišrios</option>
                        <option value="Nenoriu nurodyti">Nenoriu nurodyti</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const errors = [];
                      if (!registrationData.gender) errors.push('Lytis');
                      if (!registrationData.age) errors.push('Amžius');
                      if (!registrationData.city || !registrationData.street) errors.push('Vietovė (miestas ir gatvė)');
                      if (!registrationData.height) errors.push('Ūgis');
                      if (!registrationData.bodyType) errors.push('Kūno tipas');
                      if (!registrationData.civilStatus) errors.push('Šeimyninė padėtis');
                      if (!registrationData.hairColor) errors.push('Plaukų spalva');
                      if (!registrationData.eyeColor) errors.push('Akių spalva');
                      
                      if (errors.length > 0) {
                        alert(`Prašome užpildyti visus privalomus laukus:\n${errors.join('\n')}`);
                        return;
                      }
                      // Išsaugoti - pažymėti sekciją kaip išsaugotą
                      setSavedSections(prev => new Set([...prev, 'bendra-info']));
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto border-2 border-orange-500 transition-colors ${
                      savedSections.has('bendra-info')
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-300 hover:bg-orange-400 text-gray-900'
                    }`}
                  >
                    {savedSections.has('bendra-info') ? 'Išsaugota' : 'Išsaugoti pakeitimus'}
                  </button>
                </div>

                {/* Apie mane */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Apie mane</h3>
                  <textarea 
                    value={registrationData.bio}
                    onChange={(e) => setRegistrationData({...registrationData, bio: e.target.value})}
                    maxLength={700}
                    rows={4}
                    placeholder="Parašyk kelias eilutes apie save..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                  />
                  <p className="text-sm text-gray-400 mt-2">{registrationData.bio.length} / 700 simbolių</p>
                  <button
                    onClick={() => {
                      // Išsaugoti - pažymėti sekciją kaip išsaugotą
                      setSavedSections(prev => new Set([...prev, 'apie-mane']));
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto border-2 border-orange-500 transition-colors ${
                      savedSections.has('apie-mane')
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-300 hover:bg-orange-400 text-gray-900'
                    }`}
                  >
                    {savedSections.has('apie-mane') ? 'Išsaugota' : 'Išsaugoti pakeitimus'}
                  </button>
                </div>

                {/* Mano pomėgiai */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Mano pomėgiai *</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Kelionės', 'sportas ir aktyvus laisvalaikis', 'pasivaikščiojimai gamtoje', 'žygiai / kalnai', 'dviračiai', 'fitnesas / sporto salė', 'bėgimas', 'plaukimas', 'maisto gaminimas', 'restoranai ir kavinės', 'kinas', 'serialai', 'muzika', 'koncertai', 'skaitymas', 'savęs tobulinimas', 'fotografija', 'menas ir parodos', 'technologijos', 'automobiliai / motociklai', 'rankdarbiai / DIY', 'sodininkystė', 'gyvūnai', 'šunys / katės', 'stalo žaidimai', 'video žaidimai', 'meditacija / joga', 'psichologija', 'verslas / investavimas', 'kelionės automobiliu (road trips)', 'Kita (įrašyti)'].map((hobby) => (
                      <button
                        key={hobby}
                        onClick={() => {
                          if (hobby === 'Kita (įrašyti)') {
                            setShowCustomHobbyInput(true);
                            return;
                          }
                          const isSelected = registrationData.hobbies.includes(hobby);
                          if (isSelected) {
                            setRegistrationData({
                              ...registrationData,
                              hobbies: registrationData.hobbies.filter(h => h !== hobby)
                            });
                          } else {
                            setRegistrationData({
                              ...registrationData,
                              hobbies: [...registrationData.hobbies, hobby]
                            });
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          registrationData.hobbies.includes(hobby)
                            ? 'text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        style={registrationData.hobbies.includes(hobby) ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
                      >
                        {hobby}
                      </button>
                    ))}
                  </div>
                  {showCustomHobbyInput && (
                    <div className="mt-4 flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={customHobbyText}
                        onChange={(e) => {
                          if (e.target.value.length <= 20) {
                            setCustomHobbyText(e.target.value);
                          }
                        }}
                        placeholder="Įrašykite pomėgį (iki 20 simbolių)"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        maxLength={20}
                      />
                      <button
                        onClick={() => {
                          if (customHobbyText.trim()) {
                            setRegistrationData({
                              ...registrationData,
                              hobbies: [...registrationData.hobbies, customHobbyText.trim()]
                            });
                            setCustomHobbyText('');
                            setShowCustomHobbyInput(false);
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Pridėti
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomHobbyInput(false);
                          setCustomHobbyText('');
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Atšaukti
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mt-2">Pasirinkta: {registrationData.hobbies.length}</p>
                  <button
                    onClick={() => {
                      if (registrationData.hobbies.length === 0) {
                        alert('Būtina pasirinkti bent vieną pomėgį');
                        return;
                      }
                      // Išsaugoti - pažymėti sekciją kaip išsaugotą
                      setSavedSections(prev => new Set([...prev, 'pomegiai']));
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto border-2 border-orange-500 transition-colors ${
                      savedSections.has('pomegiai')
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-300 hover:bg-orange-400 text-gray-900'
                    }`}
                  >
                    {savedSections.has('pomegiai') ? 'Išsaugota' : 'Išsaugoti pakeitimus'}
                  </button>
                </div>

                {/* Mano erotiniai pomėgiai */}
                    <div>
                  <h3 className="text-xl font-bold mb-4">Mano erotiniai pomėgiai *</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Pasimatymai', 'Bučiavimasis', 'Glamonės', 'Erotinis masažas', 'Virtualus seksas', 'Tantrinis seksas', 'Saugus seksas', '69', 'Oralinis seksas', 'Viešas seksas', 'Analinis saksas', 'SM', 'BDSM', 'Grupinis seksas', 'Keitimasis partneriais', 'Vergavimas', 'Kita (Įrašyti)'].map((interest) => (
                      <button
                        key={interest}
                        onClick={() => {
                          if (interest === 'Kita (Įrašyti)') {
                            setShowCustomEroticInput(true);
                            return;
                          }
                          const isSelected = registrationData.eroticInterests.includes(interest);
                          if (isSelected) {
                            setRegistrationData({
                              ...registrationData,
                              eroticInterests: registrationData.eroticInterests.filter(i => i !== interest)
                            });
                          } else {
                            setRegistrationData({
                              ...registrationData,
                              eroticInterests: [...registrationData.eroticInterests, interest]
                            });
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          registrationData.eroticInterests.includes(interest)
                            ? 'text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        style={registrationData.eroticInterests.includes(interest) ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  {showCustomEroticInput && (
                    <div className="mt-4 flex gap-2 items-center">
                      <input
                        type="text"
                        value={customEroticText}
                        onChange={(e) => {
                          if (e.target.value.length <= 20) {
                            setCustomEroticText(e.target.value);
                          }
                        }}
                        placeholder="Įrašykite erotinį pomėgį (iki 20 simbolių)"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        maxLength={20}
                      />
                      <button
                        onClick={() => {
                          if (customEroticText.trim()) {
                            setRegistrationData({
                              ...registrationData,
                              eroticInterests: [...registrationData.eroticInterests, customEroticText.trim()]
                            });
                            setCustomEroticText('');
                            setShowCustomEroticInput(false);
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Pridėti
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomEroticInput(false);
                          setCustomEroticText('');
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Atšaukti
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mt-2">Pasirinkta: {registrationData.eroticInterests.length}</p>
                  <button
                    onClick={() => {
                      if (registrationData.eroticInterests.length === 0) {
                        alert('Būtina pasirinkti bent vieną erotinį pomėgį');
                        return;
                      }
                      // Išsaugoti - pažymėti sekciją kaip išsaugotą
                      setSavedSections(prev => new Set([...prev, 'erotiniai-pomegiai']));
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto border-2 border-orange-500 transition-colors ${
                      savedSections.has('erotiniai-pomegiai')
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-300 hover:bg-orange-400 text-gray-900'
                    }`}
                  >
                    {savedSections.has('erotiniai-pomegiai') ? 'Išsaugota' : 'Išsaugoti pakeitimus'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profilis View - Same as Registration Form */}
          {currentView === 'profilis' && (
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Mano profilis</h2>
              
              <div className="bg-gray-800 rounded-lg p-3 sm:p-6 space-y-6 sm:space-y-8">
                {/* Nuotraukos */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Nuotraukos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {registrationData.photos && registrationData.photos.map((photo, idx) => (
                      <div key={idx} className="aspect-[4/5] bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden relative group">
                        {photo ? (
                          <>
                            <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                const newPhotos = registrationData.photos.filter((_, index) => index !== idx);
                                setRegistrationData({...registrationData, photos: newPhotos});
                                setUserProfile({...userProfile, photos: newPhotos});
                              }}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <div className="text-6xl">📸</div>
                        )}
                      </div>
                    ))}
                    {(!registrationData.photos || registrationData.photos.length < 6) && (
                      <label className={`aspect-[4/5] bg-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors ${uploadingPhotos ? 'opacity-50 cursor-wait' : ''}`}>
                        {uploadingPhotos ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                            <span className="text-sm text-gray-400">Apdorojama...</span>
                          </>
                        ) : (
                          <>
                            <Camera size={32} className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-400">Įkelti</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          disabled={uploadingPhotos}
                          onChange={async (e) => {
                            const files = Array.from(e.target.files);
                            if (files.length === 0) return;
                            if ((registrationData.photos || []).length >= 6) {
                              alert('Galite įkelti daugiausiai 6 nuotraukas');
                              e.target.value = '';
                              return;
                            }
                            // Open photo editor for registration
                            openPhotoEditor(files[0], true);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Galite įkelti iki 6 nuotraukų. Nuotraukos bus automatiškai sumažintos.</p>
                </div>

                {/* Vardas */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Vardas</h3>
                      <input 
                        type="text" 
                    value={registrationData.name}
                    onChange={(e) => {
                      setRegistrationData({...registrationData, name: e.target.value});
                      setUserProfile({...userProfile, name: e.target.value});
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                    placeholder="Įveskite savo vardą"
                      />
                    </div>

                {/* Bendra informacija */}
                    <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Bendra informacija</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Lytis *</label>
                      <select 
                        value={registrationData.gender}
                        onChange={(e) => {
                          setRegistrationData({...registrationData, gender: e.target.value});
                          setUserProfile({...userProfile, gender: e.target.value});
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Vyras">Vyras</option>
                        <option value="Moteris">Moteris</option>
                        <option value="Neapsisprendęs">Neapsisprendęs</option>
                        <option value="Nenoriu nurodyti">Nenoriu nurodyti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Amžius *</label>
                      <select 
                        value={registrationData.age}
                        onChange={(e) => {
                          setRegistrationData({...registrationData, age: e.target.value});
                          setUserProfile({...userProfile, age: parseInt(e.target.value) || 0});
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        {Array.from({length: 63}, (_, i) => i + 18).map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                  </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-400 mb-2">Vietovė *</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={registrationData.city}
                          onChange={(e) => {
                            setRegistrationData({...registrationData, city: e.target.value});
                            setUserProfile({...userProfile, city: e.target.value});
                          }}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          placeholder="Miestas"
                        />
                        <input 
                          type="text" 
                          value={registrationData.street}
                          onChange={(e) => {
                            setRegistrationData({...registrationData, street: e.target.value});
                            setUserProfile({...userProfile, street: e.target.value});
                          }}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          placeholder="Gatvė"
                        />
                        <input 
                          type="text" 
                          value={registrationData.house}
                          onChange={(e) => {
                            setRegistrationData({...registrationData, house: e.target.value});
                            setUserProfile({...userProfile, house: e.target.value});
                          }}
                          className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          placeholder="Namas"
                        />
                </div>
                      <button
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                alert('Geolokacija gauta. Miestas ir gatvė bus automatiškai užpildyti.');
                              },
                              (error) => {
                                alert('Nepavyko gauti geolokacijos. Įveskite rankiniu būdu.');
                              }
                            );
                          } else {
                            alert('Jūsų naršyklė nepalaiko geolokacijos.');
                          }
                        }}
                        className="mt-2 text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1"
                      >
                        <MapPin size={14} />
                        Gauti iš geolokacijos
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Ūgis *</label>
                      <input 
                        type="number" 
                        value={registrationData.height}
                        onChange={(e) => {
                          setRegistrationData({...registrationData, height: e.target.value});
                          setUserProfile({...userProfile, height: e.target.value});
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                        placeholder="Pvz., 175"
                        min="100"
                        max="250"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Kūno tipas *</label>
                      <select 
                        value={registrationData.bodyType}
                        onChange={(e) => {
                          setRegistrationData({...registrationData, bodyType: e.target.value});
                          setUserProfile({...userProfile, bodyType: e.target.value});
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Lieknas">Lieknas</option>
                        <option value="Atletiškas">Atletiškas</option>
                        <option value="Vidutinis">Vidutinis</option>
                        <option value="Stambesnis">Stambesnis</option>
                        <option value="Apkūnus">Apkūnus</option>
                        <option value="Nenoriu nurodyti">Nenoriu nurodyti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Šeimyninė padėtis *</label>
                      <select 
                        value={registrationData.civilStatus}
                        onChange={(e) => {
                          setRegistrationData({...registrationData, civilStatus: e.target.value});
                          setUserProfile({...userProfile, civilStatus: e.target.value});
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Vienišius">Vienišius</option>
                        <option value="Išsiskyręs (-usi)">Išsiskyręs (-usi)</option>
                        <option value="Vedęs/įštekėjusi">Vedęs/įštekėjusi</option>
                        <option value="Santykiuose">Santykiuose</option>
                        <option value="Kita">Kita</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Plaukų spalva *</label>
                      <select 
                        value={registrationData.hairColor}
                        onChange={(e) => {
                          setRegistrationData({...registrationData, hairColor: e.target.value});
                          setUserProfile({...userProfile, hairColor: e.target.value});
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Šviesūs">Šviesūs</option>
                        <option value="Tamsūs">Tamsūs</option>
                        <option value="Rudi">Rudi</option>
                        <option value="Juodi">Juodi</option>
                        <option value="Raudoni">Raudoni</option>
                        <option value="Žili">Žili</option>
                        <option value="Daugiaspalviai">Daugiaspalviai</option>
                        <option value="Plikė">Plikė</option>
                        <option value="Kita">Kita</option>
                        <option value="Nenoriu nurodyti">Nenoriu nurodyti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Akių spalva *</label>
                      <select 
                        value={registrationData.eyeColor}
                        onChange={(e) => {
                          setRegistrationData({...registrationData, eyeColor: e.target.value});
                          setUserProfile({...userProfile, eyeColor: e.target.value});
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                      >
                        <option value="">Pasirinkti</option>
                        <option value="Mėlynos">Mėlynos</option>
                        <option value="Žalios">Žalios</option>
                        <option value="Rudos">Rudos</option>
                        <option value="Pilkos">Pilkos</option>
                        <option value="Gintarinės">Gintarinės</option>
                        <option value="Mišrios">Mišrios</option>
                        <option value="Nenoriu nurodyti">Nenoriu nurodyti</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const errors = [];
                      if (!registrationData.gender) errors.push('Lytis');
                      if (!registrationData.age) errors.push('Amžius');
                      if (!registrationData.city || !registrationData.street) errors.push('Vietovė (miestas ir gatvė)');
                      if (!registrationData.height) errors.push('Ūgis');
                      if (!registrationData.bodyType) errors.push('Kūno tipas');
                      if (!registrationData.civilStatus) errors.push('Šeimyninė padėtis');
                      if (!registrationData.hairColor) errors.push('Plaukų spalva');
                      if (!registrationData.eyeColor) errors.push('Akių spalva');
                      
                      if (errors.length > 0) {
                        alert(`Prašome užpildyti visus privalomus laukus:\n${errors.join('\n')}`);
                        return;
                      }
                      // Išsaugoti - pažymėti sekciją kaip išsaugotą
                      setSavedSections(prev => new Set([...prev, 'bendra-info-profilis']));
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto border-2 border-orange-500 transition-colors ${
                      savedSections.has('bendra-info-profilis')
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-300 hover:bg-orange-400 text-gray-900'
                    }`}
                  >
                    {savedSections.has('bendra-info-profilis') ? 'Išsaugota' : 'Išsaugoti pakeitimus'}
                  </button>
                </div>

                {/* Apie mane */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Apie mane</h3>
                  <textarea 
                    value={registrationData.bio}
                    onChange={(e) => {
                      setRegistrationData({...registrationData, bio: e.target.value});
                      setUserProfile({...userProfile, bio: e.target.value});
                    }}
                    maxLength={700}
                    rows={4}
                    placeholder="Parašyk kelias eilutes apie save..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base"
                  />
                  <p className="text-sm text-gray-400 mt-2">{registrationData.bio.length} / 700 simbolių</p>
                  <button
                    onClick={() => {
                      // Išsaugoti - pažymėti sekciją kaip išsaugotą
                      setSavedSections(prev => new Set([...prev, 'apie-mane-profilis']));
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto border-2 border-orange-500 transition-colors ${
                      savedSections.has('apie-mane-profilis')
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-300 hover:bg-orange-400 text-gray-900'
                    }`}
                  >
                    {savedSections.has('apie-mane-profilis') ? 'Išsaugota' : 'Išsaugoti pakeitimus'}
                  </button>
                </div>

                {/* Mano pomėgiai */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Mano pomėgiai *</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Kelionės', 'sportas ir aktyvus laisvalaikis', 'pasivaikščiojimai gamtoje', 'žygiai / kalnai', 'dviračiai', 'fitnesas / sporto salė', 'bėgimas', 'plaukimas', 'maisto gaminimas', 'restoranai ir kavinės', 'kinas', 'serialai', 'muzika', 'koncertai', 'skaitymas', 'savęs tobulinimas', 'fotografija', 'menas ir parodos', 'technologijos', 'automobiliai / motociklai', 'rankdarbiai / DIY', 'sodininkystė', 'gyvūnai', 'šunys / katės', 'stalo žaidimai', 'video žaidimai', 'meditacija / joga', 'psichologija', 'verslas / investavimas', 'kelionės automobiliu (road trips)', 'Kita (įrašyti)'].map((hobby) => (
                      <button
                        key={hobby}
                        onClick={() => {
                          if (hobby === 'Kita (įrašyti)') {
                            setShowCustomHobbyInput(true);
                            return;
                          }
                          const isSelected = registrationData.hobbies.includes(hobby);
                          const newHobbies = isSelected 
                            ? registrationData.hobbies.filter(h => h !== hobby)
                            : [...registrationData.hobbies, hobby];
                          setRegistrationData({...registrationData, hobbies: newHobbies});
                          setUserProfile({...userProfile, interests: newHobbies});
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          registrationData.hobbies.includes(hobby)
                            ? 'text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        style={registrationData.hobbies.includes(hobby) ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
                      >
                        {hobby}
                      </button>
                    ))}
                  </div>
                  {showCustomHobbyInput && (
                    <div className="mt-4 flex gap-2 items-center">
                      <input
                        type="text"
                        value={customHobbyText}
                        onChange={(e) => {
                          if (e.target.value.length <= 20) {
                            setCustomHobbyText(e.target.value);
                          }
                        }}
                        placeholder="Įrašykite pomėgį (iki 20 simbolių)"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        maxLength={20}
                      />
                      <button
                        onClick={() => {
                          if (customHobbyText.trim()) {
                            const newHobbies = [...registrationData.hobbies, customHobbyText.trim()];
                            setRegistrationData({...registrationData, hobbies: newHobbies});
                            setUserProfile({...userProfile, interests: newHobbies});
                            setCustomHobbyText('');
                            setShowCustomHobbyInput(false);
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Pridėti
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomHobbyInput(false);
                          setCustomHobbyText('');
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Atšaukti
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mt-2">Pasirinkta: {registrationData.hobbies.length}</p>
                  <button
                    onClick={() => {
                      if (registrationData.hobbies.length === 0) {
                        alert('Būtina pasirinkti bent vieną pomėgį');
                        return;
                      }
                      // Išsaugoti - pažymėti sekciją kaip išsaugotą
                      setSavedSections(prev => new Set([...prev, 'pomegiai-profilis']));
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto border-2 border-orange-500 transition-colors ${
                      savedSections.has('pomegiai-profilis')
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-300 hover:bg-orange-400 text-gray-900'
                    }`}
                  >
                    {savedSections.has('pomegiai-profilis') ? 'Išsaugota' : 'Išsaugoti pakeitimus'}
                  </button>
                </div>

                {/* Mano erotiniai pomėgiai */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Mano erotiniai pomėgiai *</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Pasimatymai', 'Bučiavimasis', 'Glamonės', 'Erotinis masažas', 'Virtualus seksas', 'Tantrinis seksas', 'Saugus seksas', '69', 'Oralinis seksas', 'Viešas seksas', 'Analinis saksas', 'SM', 'BDSM', 'Grupinis seksas', 'Keitimasis partneriais', 'Vergavimas', 'Kita (Įrašyti)'].map((interest) => (
                      <button
                        key={interest}
                        onClick={() => {
                          if (interest === 'Kita (Įrašyti)') {
                            setShowCustomEroticInput(true);
                            return;
                          }
                          const isSelected = registrationData.eroticInterests.includes(interest);
                          const newInterests = isSelected
                            ? registrationData.eroticInterests.filter(i => i !== interest)
                            : [...registrationData.eroticInterests, interest];
                          setRegistrationData({...registrationData, eroticInterests: newInterests});
                          setUserProfile({...userProfile, eroticInterests: newInterests});
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          registrationData.eroticInterests.includes(interest)
                            ? 'text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        style={registrationData.eroticInterests.includes(interest) ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  {showCustomEroticInput && (
                    <div className="mt-4 flex gap-2 items-center">
                      <input
                        type="text"
                        value={customEroticText}
                        onChange={(e) => {
                          if (e.target.value.length <= 20) {
                            setCustomEroticText(e.target.value);
                          }
                        }}
                        placeholder="Įrašykite erotinį pomėgį (iki 20 simbolių)"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        maxLength={20}
                      />
                      <button
                        onClick={() => {
                          if (customEroticText.trim()) {
                            const newInterests = [...registrationData.eroticInterests, customEroticText.trim()];
                            setRegistrationData({...registrationData, eroticInterests: newInterests});
                            setUserProfile({...userProfile, eroticInterests: newInterests});
                            setCustomEroticText('');
                            setShowCustomEroticInput(false);
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Pridėti
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomEroticInput(false);
                          setCustomEroticText('');
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Atšaukti
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mt-2">Pasirinkta: {registrationData.eroticInterests.length}</p>
                  <button
                    onClick={() => {
                      if (registrationData.eroticInterests.length === 0) {
                        alert('Būtina pasirinkti bent vieną erotinį pomėgį');
                        return;
                      }
                      // Išsaugoti - pažymėti sekciją kaip išsaugotą
                      setSavedSections(prev => new Set([...prev, 'erotiniai-pomegiai-profilis']));
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto border-2 border-orange-500 transition-colors ${
                      savedSections.has('erotiniai-pomegiai-profilis')
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-300 hover:bg-orange-400 text-gray-900'
                    }`}
                  >
                  {savedSections.has('erotiniai-pomegiai-profilis') ? 'Išsaugota' : 'Išsaugoti pakeitimus'}
                </button>
                </div>

                {/* Patvirtinti anketą – profilis atsiranda tarp narių */}
                <div className="sticky bottom-0 bg-gray-800 pt-4 pb-2 border-t border-gray-700 -mx-3 sm:-mx-6 px-3 sm:px-6 mt-6">
                  <button
                    onClick={handleCompleteProfile}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-4 rounded-lg text-base sm:text-lg"
                  >
                    Patvirtinti
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">Patvirtinus anketa bus matoma tarp kitų narių.</p>
                </div>
              </div>

              {/* Nustatymai */}
              <div className="bg-gray-800 rounded-lg p-6 mt-6 space-y-4">
                <h3 className="text-xl font-bold mb-4">Nustatymai</h3>
                
                <div className="flex items-center justify-between">
                  <span>El. pašto pranešimai</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <button 
                  onClick={() => setShowChangePasswordModal(true)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  Keisti slaptažodį
                </button>

                <button 
                  onClick={() => setShowChangeEmailModal(true)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  Keisti el. paštą
                </button>

                <button 
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  Ištrinti paskyrą
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Nustatymai</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span>El. pašto pranešimai</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <button
              onClick={forceRestoreFromBackup}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            >
              Atkurti anketas iš atsarginės kopijos
            </button>

            <button 
              onClick={() => { setShowSettings(false); setShowChangePasswordModal(true); }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            >
              Keisti slaptažodį
            </button>

            <button 
              onClick={() => { setShowSettings(false); setShowChangeEmailModal(true); }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            >
              Keisti el. paštą
            </button>

            <button 
              onClick={() => {
                setShowSettings(false);
                setShowChangePhoneModal(true);
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg"
            >
              Keisti telefono numerį
            </button>

            <button 
              onClick={() => { setShowSettings(false); setShowDeleteAccountModal(true); }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            >
              Ištrinti paskyrą
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => { setShowChangePasswordModal(false); setChangePasswordCurrent(''); setChangePasswordNew(''); setChangePasswordConfirm(''); }}>
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Keisti slaptažodį</h2>
            <div className="space-y-3">
              <input type="password" value={changePasswordCurrent} onChange={e => setChangePasswordCurrent(e.target.value)} placeholder="Dabartinis slaptažodis" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white" />
              <input type="password" value={changePasswordNew} onChange={e => setChangePasswordNew(e.target.value)} placeholder="Naujas slaptažodis" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white" />
              <input type="password" value={changePasswordConfirm} onChange={e => setChangePasswordConfirm(e.target.value)} placeholder="Pakartokite naują slaptažodį" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowChangePasswordModal(false); setChangePasswordCurrent(''); setChangePasswordNew(''); setChangePasswordConfirm(''); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg">Atšaukti</button>
              <button onClick={() => {
                if (!changePasswordCurrent || !changePasswordNew || !changePasswordConfirm) { alert('Užpildykite visus laukus'); return; }
                if (changePasswordNew !== changePasswordConfirm) { alert('Nauji slaptažodžiai nesutampa'); return; }
                if (changePasswordNew.length < 6) { alert('Naujas slaptažodis turi būti bent 6 simbolių'); return; }
                setShowChangePasswordModal(false); setChangePasswordCurrent(''); setChangePasswordNew(''); setChangePasswordConfirm(''); alert('Slaptažodis pakeistas.');
              }} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">Patvirtinti</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showChangeEmailModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => { setShowChangeEmailModal(false); setChangeEmailNew(''); setChangeEmailPassword(''); }}>
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Keisti el. paštą</h2>
            <div className="space-y-3">
              <input type="email" value={changeEmailNew} onChange={e => setChangeEmailNew(e.target.value)} placeholder="Naujas el. paštas" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white" />
              <input type="password" value={changeEmailPassword} onChange={e => setChangeEmailPassword(e.target.value)} placeholder="Dabartinis slaptažodis" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowChangeEmailModal(false); setChangeEmailNew(''); setChangeEmailPassword(''); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg">Atšaukti</button>
              <button onClick={() => {
                if (!changeEmailNew.trim() || !changeEmailPassword) { alert('Užpildykite visus laukus'); return; }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changeEmailNew)) { alert('Įveskite teisingą el. paštą'); return; }
                const updatedProfile = { ...userProfile, email: changeEmailNew };
                setUserProfile(updatedProfile);
                try {
                  localStorage.setItem('myliu_userProfile', JSON.stringify(updatedProfile));
                } catch (e) {
                  console.error('Error saving to localStorage:', e);
                }
                setShowChangeEmailModal(false);
                setChangeEmailNew('');
                setChangeEmailPassword('');
                alert('El. paštas pakeistas.');
              }} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">Patvirtinti</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteAccountModal(false)}>
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Ištrinti paskyrą</h2>
            <p className="text-gray-400 text-sm mb-4">Ar tikrai norite ištrinti paskyrą? Visi duomenys bus pašalinti.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteAccountModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg">Atšaukti</button>
              <button onClick={() => {
                setShowDeleteAccountModal(false);
                setIsLoggedIn(false);
                setProfileComplete(false);
                setSelectedProfile(null);
                setActiveChat(null);
                setUserProfile({ name: '', age: 18, city: '', gender: '', bodyType: '', height: '', hairColor: '', eyeColor: '', civilStatus: '', bio: '', interests: [], photos: [], street: '', house: '', eroticInterests: [], phone: '', email: '' });
                setRegistrationData({ photos: [], name: '', gender: '', age: '', city: '', street: '', house: '', height: '', bodyType: '', civilStatus: '', hairColor: '', eyeColor: '', bio: '', hobbies: [], eroticInterests: [] });
                setConversations([]);
                setCredits(0);
                setTotalMessagesSent(0);
                setFreeMessages({});
                setMeetingProposals(new Set());
                // Išvalyti localStorage
                localStorage.removeItem('myliu_isLoggedIn');
                localStorage.removeItem('myliu_userProfile');
                localStorage.removeItem('myliu_profileComplete');
                localStorage.removeItem('myliu_registrationData');
                alert('Paskyra ištrinta.');
              }} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Ištrinti</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Phone Modal */}
      {showChangePhoneModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowChangePhoneModal(false);
          setChangePhoneInput('');
          setChangePhonePassword('');
          setChangePhoneVerificationCode('');
          setShowChangePhoneVerification(false);
        }}>
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Keisti telefono numerį</h2>
              <button 
                onClick={() => {
                  setShowChangePhoneModal(false);
                  setChangePhoneInput('');
                  setChangePhonePassword('');
                  setChangePhoneVerificationCode('');
                  setShowChangePhoneVerification(false);
                }} 
                className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {!showChangePhoneVerification ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Naujas telefono numeris</label>
                  <input
                    type="tel"
                    value={changePhoneInput}
                    onChange={(e) => setChangePhoneInput(e.target.value)}
                    placeholder="pvz: +37061234567"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dabartinis slaptažodis</label>
                  <input
                    type="password"
                    value={changePhonePassword}
                    onChange={(e) => setChangePhonePassword(e.target.value)}
                    placeholder="Įveskite slaptažodį patvirtinimui"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!changePhoneInput.trim()) {
                      alert('Prašome įvesti naują telefono numerį');
                      return;
                    }
                    if (!isPhone(changePhoneInput)) {
                      alert('Prašome įvesti teisingą telefono numerį');
                      return;
                    }
                    if (!changePhonePassword.trim()) {
                      alert('Prašome įvesti slaptažodį');
                      return;
                    }
                    // Simuliuoti patvirtinimo kodo išsiuntimą
                    setShowChangePhoneVerification(true);
                    alert('Patvirtinimo kodas išsiųstas į naują telefono numerį');
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium"
                >
                  Siųsti patvirtinimo kodą
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Patvirtinimo kodas</label>
                  <input
                    type="text"
                    value={changePhoneVerificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setChangePhoneVerificationCode(value);
                      }
                    }}
                    placeholder="Įveskite 6 skaitmenų kodą"
                    maxLength={6}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-center text-xl sm:text-2xl tracking-widest"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Patvirtinimo kodas išsiųstas į {changePhoneInput}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      setShowChangePhoneVerification(false);
                      setChangePhoneVerificationCode('');
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                  >
                    Atgal
                  </button>
                  <button
                    onClick={() => {
                      if (changePhoneVerificationCode.length !== 6) {
                        alert('Prašome įvesti 6 skaitmenų patvirtinimo kodą');
                        return;
                      }
                      // Simuliuoti telefono numerio keitimą
                      const updatedProfile = {...userProfile, phone: changePhoneInput};
                      setUserProfile(updatedProfile);
                      try {
                        localStorage.setItem('myliu_userProfile', JSON.stringify(updatedProfile));
                      } catch (e) {
                        console.error('Error saving to localStorage:', e);
                      }
                      alert('Telefono numeris sėkmingai pakeistas');
                      setShowChangePhoneModal(false);
                      setChangePhoneInput('');
                      setChangePhonePassword('');
                      setChangePhoneVerificationCode('');
                      setShowChangePhoneVerification(false);
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                  >
                    Patvirtinti
                  </button>
                </div>
                <button
                  onClick={() => {
                    alert('Patvirtinimo kodas išsiųstas iš naujo');
                  }}
                  className="w-full text-sm text-orange-500 hover:text-orange-400 underline"
                >
                  Išsiųsti kodą iš naujo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => { setSelectedProfile(null); setActiveChat(null); }}>
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-2 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold truncate">{selectedProfile.name}, {selectedProfile.age}</h2>
                {selectedProfile.isOnline && (
                  <span className="flex items-center gap-1 text-xs sm:text-sm text-green-500 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">Prisijungęs</span>
                  </span>
                )}
              </div>
              <button onClick={() => { setSelectedProfile(null); setActiveChat(null); }} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full flex-shrink-0 ml-2">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-3 sm:p-6">
              {/* Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {selectedProfile.photos.map((photo, idx) => (
                  <div 
                    key={idx} 
                    className="aspect-[4/5] bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      setExpandedImage(photo);
                      setExpandedImageIndex(idx);
                    }}
                  >
                    <img 
                      src={photo} 
                      alt={`${selectedProfile.name} photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br ${selectedProfile.avatarBg}">${selectedProfile.avatar}</div>`;
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons (neparodome savo profilio – my-profile) */}
              {selectedProfile.id !== 'my-profile' && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
                <button 
                  onClick={() => toggleStatus(selectedProfile.id, 'watching')}
                  className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all border-2 border-orange-500 ${
                    selectedProfile.status.watching 
                      ? 'text-white'
                      : 'bg-gray-800 text-orange-500 hover:bg-orange-500/10'
                  }`}
                  style={selectedProfile.status.watching ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={selectedProfile.status.watching ? "white" : "#3B82F6"} stroke="white" strokeWidth="2"/>
                  </svg>
                  {selectedProfile.status.watching ? 'Stebiu' : 'Stebėti'}
                </button>
                <button 
                  onClick={() => toggleStatus(selectedProfile.id, 'liked')}
                  className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all border-2 border-orange-500 ${
                    selectedProfile.status.liked
                      ? 'text-white'
                      : 'bg-gray-800 text-orange-500 hover:bg-orange-500/10'
                  }`}
                  style={selectedProfile.status.liked ? { backgroundColor: 'rgb(255, 171, 115)' } : {}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={selectedProfile.status.liked ? "white" : "#FBBF24"} stroke="white" strokeWidth="2"/>
                  </svg>
                  {selectedProfile.status.liked ? 'Myliu' : 'Mylėti'}
                </button>
                <div className="relative flex-1">
                  <button 
                    onClick={() => proposeMeeting(selectedProfile.id)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgb(200, 20, 35)';
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPosition({ top: rect.bottom, left: rect.left + rect.width / 2, profileId: null });
                      setShowMeetingTooltip(true);
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgb(182, 14, 27)';
                      setShowMeetingTooltip(false);
                    }}
                    className="w-full text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                    style={{ backgroundColor: 'rgb(182, 14, 27)' }}
                  >
                    <Heart size={20} fill="currentColor" />
                    Susitinkam
                  </button>
                  {showMeetingTooltip && tooltipPosition && tooltipPosition.left > 0 && (
                    <div 
                      className="fixed bg-gray-800 border-2 border-red-600 rounded-lg p-2 sm:p-3 shadow-2xl z-[100] tooltip-fade-in pointer-events-none"
                      style={{
                        top: `${tooltipStyle?.top || tooltipPosition.top + 8}px`,
                        left: `${tooltipStyle?.left || tooltipPosition.left}px`,
                        transform: tooltipStyle?.transform || 'translateX(-50%)',
                        maxWidth: 'calc(100vw - 1rem)',
                        width: 'max-content',
                        minWidth: '180px',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        maxHeight: 'calc(100vh - 1rem)',
                        overflowY: 'auto'
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-red-600"></div>
                      <p className="text-white text-xs sm:text-sm text-center whitespace-normal break-words px-1">
                        Siųsti rožių puokštę ir pasiūlyti susitikimą (100 kreditų)
                      </p>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* About */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3">Apie mane</h3>
                <p className="text-sm sm:text-base text-gray-300">{selectedProfile.bio}</p>
              </div>

              {/* Personal Info */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3">Asmeninė informacija</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Lytis</p>
                    <p className="font-medium">{selectedProfile.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Amžius</p>
                    <p className="font-medium">{selectedProfile.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Atstumas</p>
                    <p className="font-medium">{selectedProfile.distance} km</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Vietovė</p>
                    <p className="font-medium">
                      {selectedProfile.city}
                      {selectedProfile.street && `, ${selectedProfile.street}`}
                      {selectedProfile.house && ` ${selectedProfile.house}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Ūgis</p>
                    <p className="font-medium">{selectedProfile.height} cm</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Kūno tipas</p>
                    <p className="font-medium">{selectedProfile.bodyType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Šeimyninė padėtis</p>
                    <p className="font-medium">{selectedProfile.civilStatus}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Plaukų spalva</p>
                    <p className="font-medium">{selectedProfile.hairColor}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Akių spalva</p>
                    <p className="font-medium">{selectedProfile.eyeColor}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Rūkymas</p>
                    <p className="font-medium">{selectedProfile.smoking || 'Ne'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tatuiruotės</p>
                    <p className="font-medium">{selectedProfile.tattoos || 'Ne'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Auskarai</p>
                    <p className="font-medium">{selectedProfile.piercing || 'Ne'}</p>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Mano pomėgiai</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.interests && selectedProfile.interests.map((interest, idx) => (
                    <span key={idx} className="bg-orange-500 text-white px-4 py-2 rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Erotic Interests */}
              {selectedProfile.eroticInterests && selectedProfile.eroticInterests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">Mano erotiniai pomėgiai</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.eroticInterests.map((interest, idx) => (
                      <span key={idx} className="bg-purple-600 text-white px-4 py-2 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Section - visada matomas kai atidarytas profilis (išskyrus savo profilį) */}
              {selectedProfile.id !== 'my-profile' && (
                <div className="border-t border-gray-700 pt-4 sm:pt-6 mt-4 sm:mt-6" id="chat-section">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Pokalbis</h3>
                  <div className="bg-gray-900 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 h-48 sm:h-64 overflow-auto" id="chat-messages-container">
                    {conversations.find(c => c.profileId === selectedProfile.id)?.messages.map((msg, idx) => (
                      <div key={idx} className={`mb-2 sm:mb-3 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 ${
                          msg.sender === 'me' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-700 text-white'
                        }`}>
                          <p className="text-sm sm:text-base">{msg.text}</p>
                          <p className="text-[10px] sm:text-xs opacity-75 mt-1">{msg.time}</p>
                        </div>
                      </div>
                    )) || <p className="text-gray-400 text-center text-sm sm:text-base">Pradėkite pokalbį!</p>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Parašykite žinutę..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                    />
                    <button 
                      onClick={sendMessage}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Send size={18} className="sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">
                        {(() => {
                          const hasFreeMessages = (freeMessages[selectedProfile.id] || 0) > 0;
                          const hasConversation = conversations.find(c => c.profileId === selectedProfile.id);
                          if (hasFreeMessages) return 'Siųsti (nemokama)';
                          if (!hasConversation) return 'Siųsti';
                          if (credits > 0) return 'Siųsti';
                          return 'Pirkti';
                        })()}
                      </span>
                      <span className="sm:hidden">
                        {(() => {
                          const hasFreeMessages = (freeMessages[selectedProfile.id] || 0) > 0;
                          const hasConversation = conversations.find(c => c.profileId === selectedProfile.id);
                          if (hasFreeMessages) return 'Nemokama';
                          if (!hasConversation) return 'Siųsti';
                          if (credits > 0) return 'Siųsti';
                          return 'Pirkti';
                        })()}
                      </span>
                    </button>
                  </div>
                  {(() => {
                    const freeMessagesCount = freeMessages[selectedProfile.id] || 0;
                    const hasConversation = conversations.find(c => c.profileId === selectedProfile.id);
                    if (freeMessagesCount > 0) {
                      return <p className="text-sm text-green-400 mt-2">Turite {freeMessagesCount} nemokam{freeMessagesCount === 1 ? 'ą' : freeMessagesCount < 5 ? 'as' : 'ų'} žinut{freeMessagesCount === 1 ? 'ę' : freeMessagesCount < 5 ? 'es' : 'ių'} šiam nariui!</p>;
                    }
                    if (!hasConversation) {
                      return <p className="text-sm text-gray-400 mt-2">Pirma žinutė nemokama!</p>;
                    }
                    if (credits <= 0) {
                      return <p className="text-sm text-red-500 mt-2">Neturite žinučių kreditų. Spauskite "Pirkti"!</p>;
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowRegisterModal(false)}>
          <div key={registerFormKey} className="bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Registracija</h2>
              <button onClick={() => setShowRegisterModal(false)} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">El. paštas <span className="text-red-400">(būtinas)</span></label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="pvz: vardas@example.com"
                  required
                  autoComplete="off"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slaptažodis</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Bent 6 simbolių"
                  autoComplete="new-password"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Patvirtinti slaptažodį</label>
                <input
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="Pakartokite slaptažodį"
                  autoComplete="new-password"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                />
              </div>
              <button
                onClick={handleRegister}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Registruotis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => { setShowVerification(false); setVerificationCode(''); }}>
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Patvirtinimo kodas</h2>
              <button onClick={() => { setShowVerification(false); setVerificationCode(''); }} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {isSendingEmail && verificationSentTo.includes('email') && (
                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 text-sm text-blue-300">
                  Siunčiamas email į {registerEmail}...
                </div>
              )}
              
              <p className="text-gray-300">
                Įveskite 6 skaitmenų patvirtinimo kodą, kuris buvo išsiųstas į el. paštą {registerEmail}
              </p>
              
              {registerEmail && (
                <p className="text-xs text-gray-400">
                  Patikrinkite el. paštą: {registerEmail}
                  {verificationSentTo.includes('email') && !isSendingEmail && (
                    <span className="text-green-400 ml-2">✓ Email siuntimas užbaigtas</span>
                  )}
                </p>
              )}
              
              <div>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-center text-xl sm:text-2xl tracking-widest"
                />
              </div>
              <button
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6}
                className={`w-full font-medium py-3 rounded-lg transition-colors ${
                  verificationCode.length === 6
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Patvirtinti
              </button>
              
              {process.env.NODE_ENV === 'development' && storedVerificationCode && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Development režimas: Kodas: {storedVerificationCode}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowLoginModal(false)}>
          <div key={loginFormKey} className="bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Prisijungti</h2>
              <button onClick={() => setShowLoginModal(false)} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
              className="space-y-3 sm:space-y-4"
              autoComplete="on"
            >
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium mb-2">El. paštas</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={loginEmailOrPhone}
                  onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  placeholder="pvz: vardas@example.com"
                  autoComplete="email"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium mb-2">Slaptažodis</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Įveskite slaptažodį"
                  autoComplete="current-password"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Prisijungti
              </button>
              <p className="text-sm text-gray-400 text-center">
                Neturite paskyros?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    openRegistrationModal();
                  }}
                  className="text-orange-500 hover:text-orange-400"
                >
                  Registruotis
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowPayment(false)}>
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Pirkti žinutes</h2>
              <button onClick={() => setShowPayment(false)} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div 
                onClick={() => buyCredits(100, 1)}
                className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 sm:p-6 cursor-pointer border-2 border-transparent hover:border-orange-500 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg sm:text-2xl font-bold">100 žinučių</span>
                  <span className="text-xl sm:text-3xl font-bold text-orange-500">1€</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">0.01€ už žinutę</p>
              </div>

              <div 
                onClick={() => buyCredits(1000, 7)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg p-4 sm:p-6 cursor-pointer border-2 border-transparent hover:border-white transition-all relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">
                  POPULIARIAUSIAS
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg sm:text-2xl font-bold text-white">1000 žinučių</span>
                  <span className="text-xl sm:text-3xl font-bold text-white">7€</span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm">0.007€ už žinutę • Sutaupote 30%</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <Shield size={14} className="sm:w-4 sm:h-4" />
              <span>Saugus mokėjimas per Stripe</span>
            </div>
          </div>
        </div>
      )}

      {/* Photo Editor Modal */}
      {showPhotoEditor && photoEditorData.originalImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowPhotoEditor(false)}>
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-3 sm:p-6 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-2xl font-bold">Redaguoti nuotrauką</h2>
              <button onClick={() => setShowPhotoEditor(false)} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Preview */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-3 sm:mb-4 h-[300px] sm:h-[500px]">
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `scale(${photoEditorData.zoom}) translate(${photoEditorData.offsetX}px, ${photoEditorData.offsetY}px)`
                }}
              >
                <img 
                  src={photoEditorData.originalImage} 
                  alt="Edit" 
                  className="max-w-full max-h-full object-contain"
                  draggable={false}
                />
              </div>
              {/* Crop frame overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="border-2 border-orange-500 bg-transparent w-[240px] h-[300px] sm:w-[320px] sm:h-[400px]"
                  >
                    <div className="absolute inset-0 border-4 border-white/20"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Zoom */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Priartinimas: {photoEditorData.zoom.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={photoEditorData.zoom}
                  onChange={(e) => setPhotoEditorData({
                    ...photoEditorData,
                    zoom: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
              </div>

              {/* Position X */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Horizontalus poslinkis: {Math.round(photoEditorData.offsetX)}px
                </label>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="5"
                  value={photoEditorData.offsetX}
                  onChange={(e) => setPhotoEditorData({
                    ...photoEditorData,
                    offsetX: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>

              {/* Position Y */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vertikalus poslinkis: {Math.round(photoEditorData.offsetY)}px
                </label>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="5"
                  value={photoEditorData.offsetY}
                  onChange={(e) => setPhotoEditorData({
                    ...photoEditorData,
                    offsetY: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  onClick={() => setPhotoEditorData({ ...photoEditorData, zoom: 1, offsetX: 0, offsetY: 0 })}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  Atstatyti
                </button>
                <button
                  onClick={saveEditedPhoto}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base"
                >
                  Išsaugoti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Lightbox */}
      {expandedImage && selectedProfile && expandedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4"
          onClick={() => {
            setExpandedImage(null);
            setExpandedImageIndex(null);
          }}
        >
          <button 
            onClick={() => {
              setExpandedImage(null);
              setExpandedImageIndex(null);
            }}
            className="absolute top-4 right-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-full z-10 transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
          
          {/* Previous Button */}
          {expandedImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const prevIndex = expandedImageIndex - 1;
                setExpandedImageIndex(prevIndex);
                setExpandedImage(selectedProfile.photos[prevIndex]);
              }}
              className="absolute left-4 p-3 bg-gray-800/80 hover:bg-gray-700/90 rounded-full z-10 transition-colors"
            >
              <ChevronLeft size={32} className="text-white" />
            </button>
          )}
          
          {/* Next Button */}
          {expandedImageIndex < selectedProfile.photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextIndex = expandedImageIndex + 1;
                setExpandedImageIndex(nextIndex);
                setExpandedImage(selectedProfile.photos[nextIndex]);
              }}
              className="absolute right-4 p-3 bg-gray-800/80 hover:bg-gray-700/90 rounded-full z-10 transition-colors"
            >
              <ChevronRight size={32} className="text-white" />
            </button>
          )}
          
          {/* Image Counter */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-gray-800/80 rounded-full text-white text-sm font-medium z-10">
            {expandedImageIndex + 1} / {selectedProfile.photos.length}
          </div>
          
          <img 
            src={expandedImage} 
            alt={`Expanded photo ${expandedImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 sm:py-4 mt-auto">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <button className="text-gray-300 hover:text-orange-500 transition-colors text-sm sm:text-base font-medium">
            Apie svetainę
          </button>
          <span className="hidden sm:inline text-gray-600">|</span>
          <button className="text-gray-300 hover:text-orange-500 transition-colors text-sm sm:text-base font-medium">
            Taisyklės
          </button>
          <span className="hidden sm:inline text-gray-600">|</span>
          <button className="text-gray-300 hover:text-orange-500 transition-colors text-sm sm:text-base font-medium">
            Kontaktai
          </button>
        </div>
      </div>
    </div>
  );
};

export default PazintysPlatforma;

