import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Hourglass } from 'lucide-react';
import Navbar from './components/Navbar';
import UserStatsView from './components/UserStatsView';
import RunLogModal from './components/RunLogModal';
import LineSettingsModal from './components/LineSettingsModal';
import FlexPreviewModal from './components/FlexPreviewModal';
import ProfilePage from './components/ProfilePage';
import MembersPage from './components/MembersPage';
import RacesPage from './components/RacesPage';
import RaceCountdown from './components/RaceCountdown';
import { initLiff, reloginLiff, clearReloginFlag } from './services/liff';
import {
  fetchConfig,
  setIdToken,
  fetchMe,
  fetchMembers,
  fetchRuns,
  fetchRaces,
  createRun,
  fetchSettings,
  updateSettings
} from './services/api';

// Simple hash routing: #/ (home), #/profile, #/members, #/races
function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '') || 'home';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const navigate = useCallback((to) => {
    window.location.hash = to === 'home' ? '/' : `/${to}`;
  }, []);
  return [route, navigate];
}

export default function App() {
  const [route, navigate] = useHashRoute();
  const [me, setMe] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [members, setMembers] = useState([]);
  const [viewingId, setViewingId] = useState(null); // 目前查看成績的成員 (預設自己)
  const [period, setPeriod] = useState('week'); // Default to 'week' (當週)
  const [runs, setRuns] = useState([]);
  const [settings, setSettings] = useState(null);
  const [races, setRaces] = useState([]);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewRun, setPreviewRun] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const isAdmin = me?.position === 'admin';
  const viewingMember = members.find((m) => m.id === viewingId) || me;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const reloadMembers = useCallback(async () => {
    setMembers(await fetchMembers());
  }, []);

  const reloadRaces = useCallback(async () => {
    setRaces(await fetchRaces());
  }, []);

  // Initial load: log in (LIFF or dev), then identify the logged-in member
  useEffect(() => {
    async function init() {
      let authMode = 'dev';
      try {
        const config = await fetchConfig();
        authMode = config.authMode;
        if (authMode === 'liff') {
          setIdToken(await initLiff(config.liffId));
        }
        const meData = await fetchMe();
        clearReloginFlag();
        setMe(meData);
        setViewingId(meData.id);
        const [membersData, settingsData, racesData] = await Promise.all([fetchMembers(), fetchSettings(), fetchRaces()]);
        setMembers(membersData);
        setSettings(settingsData);
        setRaces(racesData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        // Expired / invalid LINE ID Token: log in again once
        if (authMode === 'liff' && err.code === 'UNAUTHENTICATED' && (await reloginLiff())) return;
        setAuthError(err);
      }
    }
    init();
  }, []);

  const loadRuns = useCallback(async () => {
    if (!viewingId) return;
    try {
      setRuns(await fetchRuns({ member_id: viewingId, period }));
    } catch (err) {
      console.error('Failed to load runs:', err);
    }
  }, [viewingId, period]);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  // Handle submit run (always recorded under the logged-in member)
  const handleRunSubmit = async (runData) => {
    const res = await createRun(runData);
    showToast('🎉 打卡成功！已發布戰報！');
    setViewingId(me.id);
    if (viewingId === me.id) {
      await loadRuns();
    }
    await reloadMembers();
    if (res.run) {
      setPreviewRun(res.run);
    }
  };

  const handleProfileUpdated = async (updated) => {
    setMe(updated);
    await reloadMembers();
    showToast('✅ 個人資料已更新');
  };

  // Save Settings
  const handleSaveSettings = async (newSettings) => {
    await updateSettings(newSettings);
    setSettings(await fetchSettings());
  };

  if (authError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div className="glass-card" style={{ maxWidth: '420px', padding: '32px', textAlign: 'center' }}>
          {authError.code === 'PENDING_APPROVAL'
            ? <Hourglass size={36} color="#10B981" style={{ marginBottom: '12px' }} />
            : <Lock size={36} color="#F59E0B" style={{ marginBottom: '12px' }} />}
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
            {authError.code === 'PENDING_APPROVAL' ? `嗨 ${authError.data?.name || ''}，歡迎加入跑友圈！` : '無法登入'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{authError.message}</p>
          {authError.code === 'PENDING_APPROVAL' && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>核准後重新開啟此頁面即可開始打卡</p>
          )}
        </div>
      </div>
    );
  }

  if (!me) return null;

  let page;
  if (route === 'profile') {
    page = <ProfilePage me={me} onUpdated={handleProfileUpdated} onBack={() => navigate('home')} />;
  } else if (route === 'members' && isAdmin) {
    page = <MembersPage me={me} members={members} onChanged={reloadMembers} onBack={() => navigate('home')} />;
  } else if (route === 'races' && isAdmin) {
    page = <RacesPage races={races} onChanged={reloadRaces} onBack={() => navigate('home')} />;
  } else {
    page = (
      <>
        <RaceCountdown races={races} />
        <UserStatsView
          currentUser={viewingMember}
          isSelf={viewingMember?.id === me.id}
          period={period}
          onChangePeriod={setPeriod}
          runs={runs}
          onOpenLogModal={() => setIsLogModalOpen(true)}
          onViewFlex={(run) => setPreviewRun(run)}
        />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        me={me}
        members={members}
        viewingMember={viewingMember}
        onSelectMember={(m) => {
          setViewingId(m.id);
          navigate('home');
        }}
        onNavigate={navigate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasLineToken={Boolean(settings?.hasToken)}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, paddingTop: '10px' }}>
        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#052E16',
            fontWeight: 700,
            padding: '10px 24px',
            borderRadius: '999px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {toastMessage}
          </div>
        )}

        {page}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 16px',
        color: '#64748B',
        fontSize: '0.8rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: '40px'
      }}>
        RunSync 跑友圈 · 跑步打卡與 LINE 戰報推播
      </footer>

      {/* Modals */}
      <RunLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        me={me}
        onSubmitRun={handleRunSubmit}
        hasLineToken={Boolean(settings?.hasToken)}
      />

      <LineSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <FlexPreviewModal
        isOpen={Boolean(previewRun)}
        onClose={() => setPreviewRun(null)}
        run={previewRun}
      />
    </div>
  );
}
