import React from 'react';
import { RefreshCw, Edit3, Save, Download, Upload } from 'lucide-react';
import TimeFilterDropdown from './TimeFilterDropdown';

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
  onTimeFilterChange,
  onExportExcel,
  onImportExcel
}) => {
  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-3 mt-4">
      {/* Time Filter - Left side */}
      <div className="flex items-center relative z-50">
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
