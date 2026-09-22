import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserStatsView from './components/UserStatsView';
import RunLogModal from './components/RunLogModal';
import LineSettingsModal from './components/LineSettingsModal';
import FlexPreviewModal from './components/FlexPreviewModal';
import {
  fetchUsers,
  createUser,
  fetchRuns,
  createRun,
  fetchSettings,
  updateSettings
} from './services/api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [period, setPeriod] = useState('week'); // Default to 'week' (當週)
  const [runs, setRuns] = useState([]);
  const [settings, setSettings] = useState(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewRun, setPreviewRun] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [usersData, settingsData] = await Promise.all([
          fetchUsers(),
          fetchSettings()
        ]);
        setUsers(usersData);
        if (usersData.length > 0) {
          setCurrentUser(usersData[0]);
        }
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    init();
  }, []);

  // Fetch runs whenever currentUser or period changes
  useEffect(() => {
    if (!currentUser) return;
    async function loadUserRuns() {
      try {
        const data = await fetchRuns({
          user_id: currentUser.id,
          period: period
        });
        setRuns(data);
      } catch (err) {
        console.error('Failed to load user runs:', err);
      }
    }
    loadUserRuns();
  }, [currentUser, period]);

  // Handle create user
  const handleAddUser = async (name) => {
    try {
      const newUser = await createUser({ name });
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      showToast(`已新增跑者「${name}」！`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle submit run
  const handleRunSubmit = async (runData) => {
    const res = await createRun(runData);
    showToast('🎉 打卡成功！已發布戰報！');

    // Reload runs for the current user and period
    if (currentUser) {
      const updatedRuns = await fetchRuns({
        user_id: currentUser.id,
        period: period
      });
      setRuns(updatedRuns);
    }

    // Pop up the Flex preview
    if (res.run) {
      setPreviewRun(res.run);
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettings) => {
    await updateSettings(newSettings);
    const updated = await fetchSettings();
    setSettings(updated);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        users={users}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasLineToken={Boolean(settings?.hasToken)}
        onAddUser={handleAddUser}
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

        {/* Focused Single User Stats View (Day / Week / Month) */}
        <UserStatsView
          currentUser={currentUser}
          users={users}
          onSelectUser={setCurrentUser}
          period={period}
          onChangePeriod={setPeriod}
          runs={runs}
          onOpenLogModal={() => setIsLogModalOpen(true)}
          onViewFlex={(run) => setPreviewRun(run)}
        />
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
        users={users}
        currentUser={currentUser}
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
