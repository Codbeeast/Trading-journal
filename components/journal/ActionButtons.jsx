import React from 'react';
import { RefreshCw, Edit3, Save, Download, Upload, Check } from 'lucide-react';
import TimeFilterDropdown from './TimeFilterDropdown';

const ActionButtons = ({
  loading,
  sessionsLoading,
  strategiesLoading,
  editMode,
  saving,
  hasUnsavedChanges,
  hasIncompleteRequiredFields,
  showSaveIndicator,
  onRefresh,
  onToggleEdit,
  onSave,
  onTimeFilterChange,
}) => {
  return (
    <div className="sticky top-4 z-50 flex flex-row flex-wrap items-center justify-between gap-3 mt-4 p-4 bg-black/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
      {/* Time Filter - Left side */}
      <div className="flex items-center">
        <TimeFilterDropdown onFilterChange={onTimeFilterChange} />
      </div>
      
      {/* Action Buttons - Right side */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onRefresh}
          disabled={loading || sessionsLoading || strategiesLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 hover:text-white transition-all disabled:opacity-50 text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md"
        >
          <RefreshCw className={`w-5 h-5 ${loading || strategiesLoading || sessionsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        
        <button 
          onClick={onToggleEdit}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-green-700 ${editMode ? 'bg-green-600/70 text-white' : 'bg-green-900/40 text-green-300 hover:bg-green-600/80 hover:text-white'} transition-all text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md`}
        >
          <Edit3 className="w-5 h-5" />
          {editMode ? 'Cancel Edit' : 'Edit'}
        </button>
      
      </div>
    </div>
  );
};

export default ActionButtons;