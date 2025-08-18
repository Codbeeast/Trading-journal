import React from 'react';
import { Calendar, Brain, Trash2 } from 'lucide-react';
import { CiImageOn } from "react-icons/ci";
import { ImageUpload } from '@/components/ImageUpload';

const JournalTable = ({
  rows,
  columns,
  sessions,
  strategies,
  editingRows,
  handleChange,
  removeRow,
  openModelPage,
  openImageViewer,
  getHeaderName,
  getCellType,
  getDropdownOptions
}) => {
  // Helper function to determine session based on time
  const getSessionFromTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      let hour;
      
      if (timeString.includes('AM') || timeString.includes('PM')) {
        // 12-hour format
        const [time, period] = timeString.split(' ');
        const [hourStr] = time.split(':');
        hour = parseInt(hourStr);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
      } else {
        // 24-hour format
        const [hourStr] = timeString.split(':');
        hour = parseInt(hourStr);
      }
      
      // Determine session based on hour (UTC time)
      if (hour >= 0 && hour < 4) {
        return 'Asian';
      } else if (hour >= 4 && hour < 12) {
        return 'London';
      } else if (hour >= 12 && hour < 20) {
        return 'New York';
      } else {
        return 'Asian'; // 20:00-24:00
      }
    } catch (error) {
      console.error('Error parsing time:', error);
      return '';
    }
  };

  // Handle time change and auto-update session
  const handleTimeChange = (idx, value) => {
    handleChange(idx, 'time', value);
    // Auto-update session based on time
    const session = getSessionFromTime(value);
    if (session) {
      handleChange(idx, 'session', session);
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl shadow-lg border border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="min-w-full">
        <table className="min-w-full text-xs md:text-sm lg:text-base">
          <thead>
            <tr className="bg-gradient-to-r from-gray-900/80 to-gray-700/60 text-white">
              {columns.filter(col => col !== "pipsGain").map(col => (
                <th key={col} className="py-3 px-4 font-semibold border-b border-white/10 whitespace-nowrap text-center">
                  {getHeaderName(col)}
                </th>
              ))}
              <th className="py-3 px-4 font-semibold border-b border-blue-500/30 whitespace-nowrap text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row, idx) => {
              const isEditable = true;
              const isBeingEdited = editingRows.has(row.id);
              const isNewRow = !row.id || row.id.toString().startsWith('temp_');
              
              // Get current session based on time if not already set
              const currentSession = row.session || getSessionFromTime(row.time);
              
              return (
                <tr key={row.id || idx} className={`hover:bg-gray-900/30 transition-all border-l-4 ${isBeingEdited ? 'bg-gray-900/30 border-l-gray-500/60' : isNewRow ? 'bg-green-900/20 border-l-green-500/60' : 'border-l-gray-500/30'}`}>
                  {columns.filter(col => col !== "pipsGain").map(col => (
                    <td key={col} className="py-3 px-4 border-b border-white/10 border-r">
                      {getCellType(col) === 'psychology' ? (
                        <div className="w-20 text-center">
                          {row[col] ? (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${row[col] <= 3 ? 'bg-red-900/70 text-red-300' : row[col] <= 6 ? 'bg-gray-900/70 text-gray-300' : 'bg-green-900/70 text-green-300'}`}>{row[col]}/10</span>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </div>
                      ) : getCellType(col) === 'date' ? (
                        <input 
                          type="date" 
                          value={row[col] ?? ''} 
                          onChange={e => handleChange(idx, col, e.target.value)} 
                          disabled={!isEditable} 
                          className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'}`} 
                          placeholder="Enter date"
                        />
                      ) : col === 'time' ? (
                        <input 
                          type="time" 
                          value={row[col] ?? ''} 
                          onChange={e => handleTimeChange(idx, e.target.value)} 
                          disabled={!isEditable} 
                          className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'}`} 
                          placeholder="Enter time"
                        />
                      ) : getCellType(col) === 'dropdown' ? (
                        col === 'session' ? (
                          <select 
                            value={currentSession || ''} 
                            onChange={e => handleChange(idx, 'session', e.target.value)} 
                            disabled={!isEditable} 
                            className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'}`}
                          >
                            <option value="">{currentSession ? currentSession : 'Select Session'}</option>
                            {getDropdownOptions('session').map(option => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : col === 'strategy' ? (
                          !isEditable && row.strategyName ? (
                            <div className="w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 bg-gray-700/40 text-gray-300 border border-gray-600/40">
                              {row.strategyName}
                            </div>
                          ) : (
                            <select 
                              value={row.strategy ?? ''} 
                              onChange={e => handleChange(idx, 'strategy', e.target.value)} 
                              disabled={!isEditable} 
                              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'}`}
                            >
                              <option value="">{row.strategy ? 'Change Strategy' : 'Select Strategy'}</option>
                              {strategies && strategies.map(strategy => (
                                <option key={strategy._id} value={strategy._id}>
                                  {strategy.strategyName}
                                </option>
                              ))}
                            </select>
                          )
                        ) : col === 'pair' || col === 'pairs' ? (
                          <select 
                            value={row[col] ?? (row.strategy && strategies ? strategies.find(s => s._id === row.strategy)?.tradingPairs?.[0] || '' : '')} 
                            onChange={e => handleChange(idx, col, e.target.value)} 
                            disabled={!isEditable} 
                            className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'}`}
                          >
                            <option value="">
                              {row[col] || (row.strategy && strategies ? strategies.find(s => s._id === row.strategy)?.tradingPairs?.[0] : 'Select Pair')}
                            </option>
                            {row.strategy && strategies ? 
                              strategies.find(s => s._id === row.strategy)?.tradingPairs?.map(pair => (
                                <option key={pair} value={pair}>{pair}</option>
                              ))
                              : getDropdownOptions(col, sessions).map((option, optIdx) => (
                                typeof option === 'object' ? (
                                  <option key={option.value || optIdx} value={option.value}>{option.label}</option>
                                ) : (
                                  <option key={option || optIdx} value={option}>{option}</option>
                                )
                              ))
                            }
                          </select>
                        ) : (
                          // Generic dropdown for all other fields (setupType, entryType, confluences, etc.)
                          <select 
                            value={row[col] ?? ''} 
                            onChange={e => handleChange(idx, col, e.target.value)} 
                            disabled={!isEditable} 
                            className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'}`}
                          >
                            <option value="">
                              {row[col] || `Select ${getHeaderName(col) || col}`}
                            </option>
                            {getDropdownOptions(col, sessions).map((option, optIdx) => (
                              typeof option === 'object' ? (
                                <option key={option.value || optIdx} value={option.value}>{option.label}</option>
                              ) : (
                                <option key={option || optIdx} value={option}>{option}</option>
                              )
                            ))}
                          </select>
                        )
                      ) : getCellType(col) === 'number' ? (
                        <input 
                          type="number" 
                          step="0.01" 
                          value={row[col] ?? ''} 
                          onChange={e => handleChange(idx, col, e.target.value === '' ? null : Number(e.target.value))} 
                          disabled={!isEditable} 
                          className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'}`} 
                          placeholder="Enter value"
                        />
                      ) : col === 'notes' ? (
                        <textarea 
                          value={row[col] ?? ''} 
                          onChange={e => handleChange(idx, col, e.target.value)} 
                          disabled={!isEditable} 
                          className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border resize-none ${isEditable ? 'bg-black/30 text-white border-white/10' : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'}`} 
                          placeholder="Enter notes"
                          rows="2"
                        />
                      ) : col === 'image' ? (
                        <div className="flex items-center space-x-2">
                          <ImageUpload
                            onImageUpload={(imageUrl) => handleChange(idx, 'image', imageUrl)}
                            currentImage={row.image}
                            disabled={!isEditable}
                          />
                          {row.image && (
                            <button
                              onClick={() => openImageViewer(row.image, `Trade ${idx + 1} Image`)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title="View Image"
                            >
                              <CiImageOn className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          value={row[col] ?? ''} 
                          onChange={e => handleChange(idx, col, e.target.value)} 
                          disabled={!isEditable} 
                          className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'}`} 
                          placeholder={`Enter ${col}`}
                        />
                      )}
                    </td>
                  ))}
                  <td className="py-3 px-4 border-b border-white/10 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openModelPage(row.id)}
                        className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-all"
                        title="Psychology Analysis"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeRow(idx)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete Trade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center space-y-4">
                    <Calendar className="w-12 h-12 text-gray-500" />
                    <p>No trades yet. Click "Add Trade" to create your first entry.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalTable;