import React, { useState } from 'react';
import { behaviors } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { Behavior, BehaviorType, BehaviorTypeInfo } from '../types';

interface BehaviorFeedProps {
  behaviors: Behavior[];
  onUpdate: () => void;
}

interface NewBehaviorForm {
  type: BehaviorType;
  description: string;
  date?: string;
}

const BehaviorFeed: React.FC<BehaviorFeedProps> = ({ behaviors: behaviorList, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBehavior, setNewBehavior] = useState<NewBehaviorForm>({
    type: 'payment_on_time',
    description: '',
    date: new Date().toISOString().slice(0, 16)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(behaviorList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBehaviors = behaviorList.slice(startIndex, endIndex);
  
  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const delta = 2; // Pages to show on each side of current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const behaviorTypes: Record<BehaviorType, BehaviorTypeInfo> = {
    payment_on_time: { label: 'On-time Payment', karma: '+10' },
    payment_late: { label: 'Late Payment', karma: '-15' },
    credit_utilization_low: { label: 'Low Credit Utilization', karma: '+5' },
    credit_utilization_high: { label: 'High Credit Utilization', karma: '-5' },
    new_credit_account: { label: 'New Credit Account', karma: '+3' },
    credit_check: { label: 'Credit Check', karma: '-2' }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await behaviors.create({
        ...newBehavior,
        date: newBehavior.date ? new Date(newBehavior.date).toISOString() : undefined
      });
      toast.success('Behavior added successfully!');
      setShowAddForm(false);
      setNewBehavior({ 
        type: 'payment_on_time', 
        description: '',
        date: new Date().toISOString().slice(0, 16)
      });
      setCurrentPage(1); // Reset to first page to see new behavior
      onUpdate();
    } catch (error) {
      toast.error('Failed to add behavior');
      console.error('Error adding behavior:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewBehavior({ ...newBehavior, type: e.target.value as BehaviorType });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBehavior({ ...newBehavior, description: e.target.value });
  };


  return (
    <div className="behavior-feed">
      <div className="feed-header">
        <div className="feed-title-section">
          <h2>Recent Activity</h2>
          <p className="feed-subtitle">
            Track your credit behaviors and build better habits
          </p>
        </div>
        <button 
          className="add-behavior-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <>
              <i className="btn-icon fas fa-times"></i>
              Cancel
            </>
          ) : (
            <>
              <i className="btn-icon fas fa-plus"></i>
              Add Behavior
            </>
          )}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-behavior-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="behavior-type">Behavior Type</label>
              <div className="select-wrapper">
                <select
                  id="behavior-type"
                  value={newBehavior.type}
                  onChange={handleTypeChange}
                  className="behavior-select"
                >
                  {(Object.entries(behaviorTypes) as [BehaviorType, BehaviorTypeInfo][]).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label} ({value.karma} karma)
                    </option>
                  ))}
                </select>
                <i className="select-icon fas fa-chevron-down"></i>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="behavior-desc">Description</label>
              <input
                id="behavior-desc"
                type="text"
                placeholder="Add details about this behavior"
                value={newBehavior.description}
                onChange={handleDescriptionChange}
                className="behavior-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="behavior-date">Date & Time (Optional)</label>
              <input
                id="behavior-date"
                type="datetime-local"
                value={newBehavior.date || ''}
                onChange={(e) => setNewBehavior({ ...newBehavior, date: e.target.value })}
                className="behavior-input"
                max={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-behavior-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <ClipLoader size={16} color="#fff" />
              ) : (
                <>
                  <i className="btn-icon fas fa-check"></i>
                  Add Behavior
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="behavior-table-container">
        {behaviorList.length === 0 ? (
          <div className="empty-state">
            <i className="empty-icon fas fa-calendar-alt"></i>
            <h3>No behaviors recorded yet</h3>
            <p>Start tracking your credit behavior to see your progress!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="behavior-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Karma Points</th>
                </tr>
              </thead>
              <tbody>
                {currentBehaviors.map((behavior) => (
                  <tr key={behavior._id}>
                    <td data-label="Type">
                      <div className="type-cell">
                        <div className={`type-icon ${behavior.karmaPoints > 0 ? 'positive' : 'negative'}`}>
                          {behavior.karmaPoints > 0 ? (
                            <i className="fas fa-star"></i>
                          ) : (
                            <i className="fas fa-exclamation-triangle"></i>
                          )}
                        </div>
                        <span className="type-name">{behaviorTypes[behavior.type]?.label || behavior.type}</span>
                      </div>
                    </td>
                    <td data-label="Description" className="description-cell">{behavior.description}</td>
                    <td data-label="Date" className="date-cell">{format(new Date(behavior.date), 'MMM dd, yyyy • h:mm a')}</td>
                    <td data-label="Karma Points">
                      <span className={`karma-points ${behavior.karmaPoints > 0 ? 'positive' : 'negative'}`}>
                        {behavior.karmaPoints > 0 ? '+' : ''}{behavior.karmaPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {startIndex + 1}-{Math.min(endIndex, behaviorList.length)} of {behaviorList.length} behaviors
                </div>
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                    Previous
                  </button>
                  
                  <div className="pagination-pages">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`dots-${index}`} className="pagination-dots">...</span>
                      ) : (
                        <button
                          key={page}
                          className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page as number)}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BehaviorFeed;