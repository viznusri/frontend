import React, { useState } from 'react';
import { rewards } from '../services/api';
import toast from 'react-hot-toast';
import { User, RewardWithStatus, RewardCategory } from '../types';
import { AxiosError } from 'axios';

interface RewardsProps {
  rewards: RewardWithStatus[];
  userData: User | null;
  onUpdate: () => void;
}

const Rewards: React.FC<RewardsProps> = ({ rewards: rewardsList, userData, onUpdate }) => {
  const [seedingRewards, setSeedingRewards] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardWithStatus | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleUnlock = async (rewardId: string) => {
    try {
      await rewards.unlock(rewardId);
      toast.success('Reward unlocked successfully!');
      onUpdate();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Failed to unlock reward');
    }
  };

  const handleRewardClick = (reward: RewardWithStatus) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReward(null);
  };

  const seedRewards = async () => {
    setSeedingRewards(true);
    try {
      await rewards.seed();
      toast.success('Sample rewards added!');
      onUpdate();
    } catch (error) {
      toast.error('Failed to seed rewards');
      console.error('Error seeding rewards:', error);
    }
    setSeedingRewards(false);
  };

  const getCategoryIcon = (category: RewardCategory): string => {
    const icons: Record<RewardCategory, string> = {
      cashback: '💰',
      discount: '🏷️',
      feature: '⭐',
      badge: '🏆'
    };
    return icons[category] || '🎁';
  };

  if (rewardsList.length === 0) {
    return (
      <div className="rewards">
        <h2>Rewards</h2>
        <p>No rewards available yet.</p>
        <button onClick={seedRewards} disabled={seedingRewards}>
          {seedingRewards ? 'Seeding...' : 'Seed Sample Rewards'}
        </button>
      </div>
    );
  }

  return (
    <div className="rewards">
      <h2>Rewards</h2>
      <div className="rewards-grid">
        {rewardsList.map((reward) => (
          <div 
            key={reward._id} 
            className={`reward-card ${reward.isUnlocked ? 'unlocked' : ''} ${reward.canUnlock ? 'can-unlock' : ''}`}
            onClick={() => handleRewardClick(reward)}
            style={{ cursor: 'pointer' }}
          >
            <div className="reward-icon">{getCategoryIcon(reward.category)}</div>
            <h3>{reward.title}</h3>
            <p>{reward.description}</p>
            <div className="karma-requirement">
              {reward.karmaRequired} karma required
            </div>
            {reward.isUnlocked ? (
              <button className="unlocked-btn" disabled onClick={(e) => e.stopPropagation()}>Unlocked ✓</button>
            ) : reward.canUnlock ? (
              <button onClick={(e) => { e.stopPropagation(); handleUnlock(reward._id); }}>Unlock Now</button>
            ) : (
              <button disabled onClick={(e) => e.stopPropagation()}>
                Need {reward.karmaRequired - (userData?.karmaScore || 0)} more karma
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Reward Modal */}
      {showModal && selectedReward && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <div className="modal-icon">{getCategoryIcon(selectedReward.category)}</div>
              <h2>{selectedReward.isUnlocked ? '🎉 Congratulations!' : 'Reward Details'}</h2>
            </div>
            <div className="modal-body">
              {selectedReward.isUnlocked ? (
                <>
                  <p className="congrats-message">You have successfully unlocked this reward!</p>
                  <h3>{selectedReward.title}</h3>
                  <p>{selectedReward.description}</p>
                  <div className="reward-status unlocked">
                    <i className="fas fa-check-circle"></i> Reward Unlocked
                  </div>
                </>
              ) : (
                <>
                  <h3>{selectedReward.title}</h3>
                  <p>{selectedReward.description}</p>
                  <div className="karma-info-modal">
                    <p>Required Karma: <strong>{selectedReward.karmaRequired}</strong></p>
                    <p>Your Karma: <strong>{userData?.karmaScore || 0}</strong></p>
                    {selectedReward.canUnlock ? (
                      <p className="can-unlock-text">You have enough karma to unlock this reward!</p>
                    ) : (
                      <p className="need-more-text">You need <strong>{selectedReward.karmaRequired - (userData?.karmaScore || 0)}</strong> more karma</p>
                    )}
                  </div>
                  {selectedReward.canUnlock && (
                    <button 
                      className="unlock-btn-modal" 
                      onClick={() => {
                        handleUnlock(selectedReward._id);
                        closeModal();
                      }}
                    >
                      Unlock Now
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;