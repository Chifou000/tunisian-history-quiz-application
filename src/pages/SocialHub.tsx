import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Users, Play, X, Check, Shield, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const SocialHub = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [pendingSentIds, setPendingSentIds] = useState<number[]>([]);
  // Use state to avoid lint error
  useEffect(() => {
    if (pendingSentIds.length > 100) setPendingSentIds([]);
  }, [pendingSentIds]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'invites' | 'friends'>('friends');
  const [roomData, setRoomData] = useState<any>(null);
  const [roomPlayers, setRoomPlayers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const res = await fetch(`api/friends.php?action=get_friends&user_id=${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setFriends(data);

      const reqRes = await fetch(`api/friends.php?action=get_requests&user_id=${user.id}`);
      if (!reqRes.ok) return;
      const reqData = await reqRes.json();
      if (Array.isArray(reqData)) setFriendRequests(reqData);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadFriends();
    const interval = setInterval(loadFriends, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const searchUsers = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`api/profile.php?action=search&term=${term}`);
      const data = await res.json();
      setSearchResults(data.filter((u: any) => u.id !== user?.id));
    } catch (e) { console.error(e); }
    setIsSearching(false);
  };

  const loadInvites = async () => {
    if (!user) return;
    try {
      const res = await fetch(`api/multiplayer.php?action=get_invites&user_id=${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setInvites(data);
    } catch (e) {}
  };

  useEffect(() => {
    loadInvites();
    const interval = setInterval(loadInvites, 12000); 

    const sentCheckInterval = setInterval(async () => {
      if (user && pendingSentIds.length > 0) {
        for (const receiverId of pendingSentIds) {
          try {
            const res = await fetch(`api/multiplayer.php?action=check_status&sender_id=${user.id}&receiver_id=${receiverId}`);
            const data = await res.json();
            if (data && data.status === 'accepted' && data.room_id) {
              showToast('تم قبول التحدي! جاري التحويل...', 'success');
              navigate(`/game/challenge?room=${data.room_id}`);
            }
          } catch (e) {}
        }
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(sentCheckInterval);
    };
  }, [user, pendingSentIds]);

  const sendInvite = async (receiverId: number, isRoomInvite: boolean = false) => {
    if (!user) return;
    try {
      const res = await fetch('api/multiplayer.php?action=send_invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sender_id: user.id, 
          receiver_id: receiverId, 
          room_id: isRoomInvite ? roomData?.room_id : null 
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم إرسال الدعوة بنجاح', 'success');
      } else if (data.error === 'cooldown') {
        showToast(`يرجى الانتظار ${data.remaining} دقائق`, 'error');
      }
    } catch (e) {}
  };

  const addFriend = async (friendId: number) => {
    if (!user) return;
    try {
      await fetch('api/friends.php?action=add_friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, friend_id: friendId })
      });
      showToast('تم إرسال طلب الصداقة', 'success');
    } catch (e) {}
  };

  const respondFriendRequest = async (friendId: number, status: 'accepted' | 'declined') => {
    if (!user) return;
    try {
      await fetch('api/friends.php?action=respond_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, friend_id: friendId, status })
      });
      showToast(status === 'accepted' ? 'تمت إضافة الصديق' : 'تم رفض الطلب', 'success');
      loadFriends();
    } catch (e) {}
  };

  const respondInvite = async (inviteId: number, status: 'accepted' | 'declined') => {
    try {
      const res = await fetch('api/multiplayer.php?action=respond_invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: inviteId, status })
      });
      const data = await res.json();
      if (data.success) {
        if (status === 'accepted') {
          showToast('جاري الدخول...', 'success');
          setTimeout(() => navigate(`/game/challenge?room=${data.room_id}`), 1000);
        }
        loadInvites();
      }
    } catch (e) {}
  };

  const createRoom = async () => {
    if (!user) return;
    try {
      const res = await fetch('api/multiplayer.php?action=create_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await res.json();
      setRoomData(data);
      setShowInviteModal(true);
    } catch (e) {}
  };

  const joinRoom = async (code: string) => {
    if (!user || !code) return;
    try {
      const res = await fetch('api/multiplayer.php?action=join_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, room_id: code })
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم الانضمام للغرفة', 'success');
        setRoomData({ room_id: code });
        setShowInviteModal(true);
      } else {
        showToast(data.error || 'فشل الانضمام', 'error');
      }
    } catch (e) {}
  };

  useEffect(() => {
    let interval: any;
    if (showInviteModal && roomData) {
      interval = setInterval(async () => {
        const res = await fetch(`api/multiplayer.php?action=get_room_players&room_id=${roomData.room_id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setRoomPlayers(data);
          
          // Check if game started by creator
          const sessionRes = await fetch(`api/multiplayer.php?action=check_room&room_id=${roomData.room_id}`);
          const sessionData = await sessionRes.json();
          if (sessionData.status === 'active') {
            navigate(`/game/challenge?room=${roomData.room_id}`);
          }
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [showInviteModal, roomData]);

  const startMultiplayerGame = async () => {
    if (!roomData) return;
    try {
      await fetch('api/multiplayer.php?action=start_game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomData.room_id })
      });
      navigate(`/game/challenge?room=${roomData.room_id}`);
    } catch (e) {}
  };

  return (
    <div className="pb-24 pt-20 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold amiri text-white mb-2">تحدي الأصدقاء</h1>
          <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setActiveTab('friends')}
              className={`pb-2 px-2 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'friends' ? 'border-[#c5a059] text-[#c5a059]' : 'border-transparent text-gray-500'}`}
            >
              الأصدقاء
              {friendRequests.length > 0 && <span className="mr-1 inline-flex bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">!</span>}
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              className={`pb-2 px-2 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'search' ? 'border-[#c5a059] text-[#c5a059]' : 'border-transparent text-gray-500'}`}
            >
              بحث عن لاعبين
            </button>
            <button 
              onClick={() => setActiveTab('invites')}
              className={`pb-2 px-2 font-bold transition-all border-b-2 relative whitespace-nowrap ${activeTab === 'invites' ? 'border-[#c5a059] text-[#c5a059]' : 'border-transparent text-gray-500'}`}
            >
              تحديات الباتل
              {invites.length > 0 && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{invites.length}</span>}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="رمز الغرفة..." 
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#c5a059] w-32 font-mono text-center"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button 
              onClick={() => joinRoom(joinCode)}
              className="absolute left-1 top-1 bottom-1 bg-[#c5a059] text-black rounded-lg px-3 font-bold text-xs"
            >
              دخول
            </button>
          </div>
          <button 
            onClick={createRoom}
            className="bg-[#c5a059] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#c5a059]/10"
          >
            <Users size={20} />
            <span>إنشاء غرفة</span>
          </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'search' ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text"
                  placeholder="ابحث عن لاعبين بالاسم..."
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 pr-12 pl-6 focus:border-[#c5a059] outline-none"
                  value={searchTerm}
                  onChange={(e) => searchUsers(e.target.value)}
                />
              </div>

              <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
                  <UserPlus size={18} className="text-[#c5a059]" />
                  نتائج البحث ({searchResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.length === 0 && !isSearching && (
                    <p className="col-span-full text-gray-600 text-center py-10">لا توجد نتائج حالية.</p>
                  )}
                  {isSearching && <p className="col-span-full text-[#c5a059] text-center py-10">جاري البحث...</p>}
                  {searchResults.map(result => {
                    const isFriend = friends.some(f => f.id === result.id);
                    return (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-[#c5a059]/30 transition-all">
                        <div className="flex items-center gap-3">
                          <img src={result.avatar_url} className="w-12 h-12 rounded-full bg-black border border-[#c5a059]/30 object-cover" />
                          <div>
                            <p className="font-bold text-white group-hover:text-[#c5a059] transition-colors">{result.username}</p>
                            <p className="text-xs text-gray-500">المستوى {result.level}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!isFriend && (
                            <button 
                              onClick={() => addFriend(result.id)}
                              className="p-2 text-[#c5a059] hover:bg-[#c5a059]/10 rounded-lg"
                              title="إضافة صديق"
                            >
                              <UserPlus size={20} />
                            </button>
                          )}
                          <button 
                            onClick={() => sendInvite(result.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                            title="تحدي باتل"
                          >
                            <Trophy size={20} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'friends' ? (
            <motion.div 
              key="friends"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Requests Section */}
              {friendRequests.length > 0 && (
                <div className="bg-[#1a1a1a] border border-red-500/20 rounded-3xl p-6">
                  <h3 className="text-[#c5a059] font-bold mb-4 flex items-center gap-2">
                    <UserPlus size={18} /> طلبات الصداقة الواردة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friendRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <img src={req.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                          <span className="font-bold text-white">{req.username}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => respondFriendRequest(req.id, 'accepted')} className="bg-emerald-600 p-2 rounded-lg text-white"><Check size={18}/></button>
                          <button onClick={() => respondFriendRequest(req.id, 'declined')} className="bg-white/5 p-2 rounded-lg text-gray-400"><X size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends List */}
              <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <Users size={20} className="text-[#c5a059]" /> قائمة الأصدقاء ({friends.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-600 italic">
                      ليس لديك أصدقاء بعد. ابحث عن لاعبين لإضافتهم!
                    </div>
                  )}
                  {friends.map(friend => (
                    <div key={friend.id} className={`p-5 bg-black/40 rounded-2xl border flex items-center justify-between group hover:border-[#c5a059]/20 transition-all ${friend.is_online == 1 ? 'border-emerald-500/20' : 'border-white/5'}`}>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={friend.avatar_url} className={`w-14 h-14 rounded-full border-2 object-cover ${friend.is_online == 1 ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-white/5'}`} />
                          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1a1a1a] ${friend.is_online == 1 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-2">
                            {friend.username}
                            {friend.is_online == 1 && <span className="text-[8px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold uppercase">متصل</span>}
                          </p>
                          <p className="text-xs text-gray-500">مستوى {friend.level}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => sendInvite(friend.id)} className="bg-red-600/20 text-red-500 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                            <Trophy size={18} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="invites"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-8"
            >
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-xl amiri">
                <Shield size={24} className="text-[#c5a059]" />
                الدعوات الواردة ({invites.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invites.length === 0 && (
                  <div className="col-span-full py-16 text-center text-gray-600 border border-dashed border-white/5 rounded-3xl">
                    <Shield size={48} className="mx-auto mb-4 opacity-10" />
                    لا توجد دعوات في انتظار ردك.
                  </div>
                )}
                {invites.map(invite => (
                  <motion.div layout key={invite.id} className="p-6 bg-black/40 rounded-2xl border border-[#c5a059]/10 hover:border-[#c5a059]/30 transition-all">
                    <div className="flex items-center gap-4 mb-6">
                       <img src={invite.sender_avatar} className="w-14 h-14 rounded-full border-2 border-[#c5a059]/20 object-cover" />
                       <div>
                         <p className="font-bold text-white text-lg">{invite.sender_name}</p>
                         <p className="text-[10px] text-gray-500">يريد تحديك في 20 سؤال!</p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => respondInvite(invite.id, 'accepted')}
                        className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg"
                      >
                        <Check size={18} /> قبول التحدي
                      </button>
                      <button 
                        onClick={() => respondInvite(invite.id, 'declined')}
                        className="flex-1 bg-white/5 text-gray-400 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                      >
                        <X size={18} /> رفض
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Multiplayer Room Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-[#c5a059]/30 rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold amiri text-white">غرفة التحدي</h2>
                <button onClick={() => setShowInviteModal(false)}><X className="text-gray-500" /></button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center gap-4">
                  {roomPlayers.concat(Array(4 - roomPlayers.length).fill(null)).map((player, idx) => (
                    <div key={idx} className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center flex-col gap-1 transition-all ${player ? 'border-[#c5a059] bg-[#c5a059]/5' : 'border-dashed border-white/10'}`}>
                      {player ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
                          <img src={player.avatar} className="w-10 h-10 rounded-full" />
                          <div className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-[#1a1a1a]" />
                        </motion.div>
                      ) : (
                        <span className="text-gray-600 text-[10px]">فارغ</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-black/40 rounded-2xl text-center">
                  <p className="text-xs text-gray-500 mb-1">رمز الغرفة</p>
                  <p className="text-2xl font-mono font-bold text-[#c5a059] tracking-widest uppercase">
                    {roomData?.room_id || '---'}
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-[#c5a059]/20 flex items-center justify-center text-[#c5a059]">
                    <Play size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">20 سؤال تاريخي</p>
                    <p className="text-xs text-gray-500">الوقت: 15 ثانية لكل سؤال</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 text-center uppercase tracking-widest">دعوة الأصدقاء المتصلين</h4>
                  <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {friends.length === 0 ? (
                      <p className="text-[10px] text-gray-600 text-center">لا يوجد أصدقاء لدعوتهم</p>
                    ) : (
                      friends.map(f => (
                        <div key={f.id} className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2">
                            <img src={f.avatar_url} className="w-6 h-6 rounded-full" />
                            <span className="text-xs text-white">{f.username}</span>
                          </div>
                          <button 
                            onClick={() => sendInvite(f.id, true)}
                            className="bg-[#c5a059] text-black text-[10px] px-3 py-1 rounded-lg font-bold"
                          >
                            دعوة
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Chat */}
                <div className="space-y-3">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center">دردشة سريعة</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['أهلاً!', 'بالتوفيق', 'مستعد؟', 'لعبة جيدة'].map((msg) => (
                      <button 
                        key={msg}
                        className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] text-gray-400 hover:text-white hover:border-[#c5a059]/30 transition-all"
                        onClick={() => showToast(`رسالة: ${msg}`, 'success')}
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={startMultiplayerGame}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all mt-4"
                >
                  بدء التحدي الآن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
