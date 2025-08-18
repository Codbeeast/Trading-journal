import React from 'react';
import { RefreshCw, Edit3, Save, Upload, Download } from 'lucide-react';

const ActionButtons = ({
  loading,
  sessionsLoading,
  strategiesLoading,
  editMode,
  saving,
  hasUnsavedChanges,
  hasIncompleteRequiredFields,
  onRefresh,
  onToggleEdit,
  onSave,
  onImport,
  onExport
}) => {
  return (
    <div className="flex flex-row flex-wrap items-center justify-end gap-3 mt-4">
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
          <Edit3 className="w-5 h-5" /> Edit
        </button>
        
        <button 
          onClick={onSave} 
          disabled={saving || !hasUnsavedChanges} 
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border transition-all disabled:opacity-50 text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md ${
            hasUnsavedChanges 
              ? hasIncompleteRequiredFields()
                ? 'border-yellow-500 bg-yellow-600/70 text-white'
                : 'border-gray-500 bg-gray-600/70 text-white'
              : 'border-gray-500 bg-gray-900/40 text-gray-300'
          }`}
          title={hasIncompleteRequiredFields() ? 'Warning: Some required fields are incomplete' : ''}
        >
          <Save className="w-5 h-5" /> 
          {hasIncompleteRequiredFields() ? 'Save*' : 'Save'}
        </button>
        
        <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl font-bold border border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 hover:text-white text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md">
          <Upload className="w-5 h-5" /> Import
          <input type="file" accept=".json,.csv" onChange={onImport} className="hidden" />
        </label>
        
        <button 
          onClick={onExport} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 hover:text-white text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md"
        >
          <Download className="w-5 h-5" /> Export
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
