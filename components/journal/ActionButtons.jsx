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
  onExportExcel,
  onImportExcel
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
        
        <button 
          onClick={onSave}
          disabled={saving || (!hasUnsavedChanges && !hasIncompleteRequiredFields())}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-bold border transition-all duration-300 text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md
            ${saving 
              ? 'border-yellow-400 bg-gradient-to-r from-yellow-500 to-amber-500 text-black animate-pulse shadow-yellow-500/50'
              : showSaveIndicator 
                ? 'border-green-400 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/50'
                : hasUnsavedChanges || hasIncompleteRequiredFields()
                  ? 'border-yellow-400 bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 shadow-yellow-500/50 hover:shadow-yellow-400/60'
                  : 'border-gray-500 bg-gray-900/40 text-gray-300 disabled:opacity-50'
            }
          `}
          title={hasIncompleteRequiredFields() ? 'Warning: Some required fields are incomplete' : ''}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
              <span>Saving...</span>
            </>
          ) : showSaveIndicator ? (
            <>
              <Check className="w-5 h-5" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{hasIncompleteRequiredFields() ? 'Save*' : 'Save'}</span>
            </>
          )}
        </button>
        
        {/* Excel Import/Export Buttons */}
        <input
          type="file"
          id="excel-import"
          accept=".xlsx,.xls"
          onChange={onImportExcel}
          className="hidden"
        />
        <button 
          onClick={() => document.getElementById('excel-import').click()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-blue-700 bg-blue-900/40 text-blue-300 hover:bg-blue-600/80 hover:text-white transition-all disabled:opacity-50 text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md"
        >
          <Upload className="w-5 h-5" />
          Import
        </button>
        
        <button 
          onClick={onExportExcel}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-emerald-700 bg-emerald-900/40 text-emerald-300 hover:bg-emerald-600/80 hover:text-white transition-all disabled:opacity-50 text-sm shadow-lg min-w-[120px] justify-center backdrop-blur-md"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;