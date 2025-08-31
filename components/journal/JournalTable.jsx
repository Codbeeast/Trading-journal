import React from 'react';
import { Calendar, Brain, Trash2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { CiImageOn } from "react-icons/ci";
import CloudinaryImageUpload from '@/components/CloudinaryImageUpload';

const JournalTable = ({
  rows,
  columns,
  sessions,
  strategies,
  editingRows,
  handleChange,
  handleNewsImpactChange,
  removeRow,
  openModelPage,
  openImageViewer,
  getHeaderName,
  getCellType,
  getDropdownOptions,
   shouldShowNewsField,
  weeklyData = null,
  formatWeekRange = null
}) => {
  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';

    try {
      // Handle both ISO strings and Date objects
      let date;
      if (typeof dateValue === 'string') {
        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        date = new Date(dateValue);
      } else {
        date = new Date(dateValue);
      }

      if (isNaN(date.getTime())) return '';

      // Format as YYYY-MM-DD for HTML date input
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

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

  // Handle time change and auto-update session - Updated to use row ID
  const handleTimeChange = (rowId, value) => {
    handleChange(rowId, 'time', value);
    // Auto-update session based on time
    const session = getSessionFromTime(value);
    if (session) {
      handleChange(rowId, 'session', session);
    }
  };

  // Helper function to get trade result status
  const getTradeStatus = (row) => {
    if (row.pnl > 0) return { status: 'profit', color: 'text-green-400', icon: TrendingUp };
    if (row.pnl < 0) return { status: 'loss', color: 'text-red-400', icon: TrendingDown };
    return { status: 'neutral', color: 'text-gray-400', icon: null };
  };

  // Helper function to format PnL display
  const formatPnL = (pnl) => {
    if (pnl === null || pnl === undefined) return '-';
    const formatted = parseFloat(pnl).toFixed(2);
    return pnl >= 0 ? `+${formatted}` : `-${Math.abs(formatted)}`;
  };

  // Helper function to get psychology rating color
  const getPsychologyColor = (rating) => {
    if (!rating || rating === 0) return 'text-gray-500';
    if (rating <= 3) return 'text-red-400';
    if (rating <= 6) return 'text-yellow-400';
    return 'text-green-400';
  };

  // Helper function to render cell content based on type - Updated to use row ID
  const renderCellContent = (row, col, isEditable) => {
    const cellType = getCellType(col);
    const rowId = row.id || row._id;

    // Debug logging for strategy selection
    if (col === 'strategy') {
      console.log('Strategy dropdown for row:', {
        rowId,
        currentStrategy: row.strategy,
        strategyName: row.strategyName,
        availableStrategies: strategies?.length || 0
      });
    }

    switch (cellType) {
      case 'psychology':
        return (
          <div className="w-20 text-center">
            {row[col] ? (
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${row[col] <= 3 ? 'bg-red-900/70 text-red-300' :
                  row[col] <= 6 ? 'bg-yellow-900/70 text-yellow-300' :
                    'bg-green-900/70 text-green-300'
                }`}>
                {row[col]}/10
              </span>
            ) : (
              <span className="text-gray-500 text-xs">-</span>
            )}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={formatDateForInput(row[col])}
            onChange={e => handleChange(rowId, col, e.target.value)}
            disabled={!isEditable}
            className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-gray-800 text-white border-gray-600 [color-scheme:dark]' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed [color-scheme:dark]'
              }`}
            placeholder="Select date"
          />
        );

      case 'dropdown':
        if (col === 'session') {
          const currentSession = row.session || getSessionFromTime(row.time);
          return (
            <select
              value={currentSession || ''}
              onChange={e => handleChange(rowId, 'session', e.target.value)}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                  'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
            >
              <option value="">{currentSession ? currentSession : 'Select Session'}</option>
              {getDropdownOptions('session').map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        }

        if (col === 'strategy') {
          console.log('Strategy dropdown debug:', {
            rowId,
            rowStrategy: row.strategy,
            rowStrategyName: row.strategyName,
            isEditable,
            strategiesLength: strategies?.length,
            strategiesArray: strategies
          });

          // For display-only mode, show the strategy name
          if (!isEditable && row.strategyName) {
            return (
              <div className="w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 bg-gray-700/40 text-gray-300 border border-gray-600/40">
                {row.strategyName}
              </div>
            );
          }

          // For editable mode, show dropdown
          return (
            <select
              value={row.strategy || ''} // Use the strategy ID
              onChange={e => {
                const selectedStrategyId = e.target.value;
                console.log('Strategy selection changed:', {
                  rowId,
                  oldValue: row.strategy,
                  newValue: selectedStrategyId,
                  selectedStrategy: strategies?.find(s => s._id === selectedStrategyId)
                });

                // Update both strategy ID and name for consistency
                handleChange(rowId, 'strategy', selectedStrategyId);

                // Optionally also update the strategy name for display purposes
                const selectedStrategy = strategies?.find(s => s._id === selectedStrategyId);
                if (selectedStrategy) {
                  handleChange(rowId, 'strategyName', selectedStrategy.strategyName);
                }
              }}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                  'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
            >
              <option value="">Select Strategy</option>
              {strategies && strategies.length > 0 ? (
                strategies.map(strategy => {
                  console.log('Rendering strategy option:', strategy);
                  return (
                    <option key={strategy._id} value={strategy._id}>
                      {strategy.strategyName}
                    </option>
                  );
                })
              ) : (
                <option disabled>No strategies available</option>
              )}
            </select>
          );
        }


        if (col === 'pair' || col === 'pairs') {
          return (
            <select
              value={row[col] ?? (row.strategy && strategies ? strategies.find(s => s._id === row.strategy)?.tradingPairs?.[0] || '' : '')}
              onChange={e => handleChange(rowId, col, e.target.value)}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                  'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
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
          );
        }

        if (col === 'news') {
  // Only show news input if this specific row has news impact
  if (shouldShowNewsField(row.affectedByNews)) {
    return (
      <select
        value={row[col] ?? ''}
        onChange={e => handleChange(rowId, col, e.target.value)}
        disabled={!isEditable}
        className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
            'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
          }`}
      >
        <option value="">Select News</option>
        {getDropdownOptions('news').map((option, optIdx) => (
          <option key={option || optIdx} value={option}>{option}</option>
        ))}
      </select>
    );
  } else {
    // Show empty cell or placeholder when no news impact
    return (
      <div className="w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 bg-gray-700/40 text-gray-500 border border-gray-600/40 text-center text-sm">
        -
      </div>
    );
  }
}

        // Generic dropdown for all other fields
        return (
          <select
            value={Array.isArray(row[col]) ? row[col].join(', ') : (row[col] ?? '')}
            onChange={e => handleChange(rowId, col, e.target.value)}
            disabled={!isEditable}
            className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
              }`}
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
        );

      case 'number':
        if (col === 'risk') {
          return (
            <div className="relative">
              <input
                type="number"
                step="1"
                value={row[col] ?? ''}
                onChange={e => handleChange(rowId, col, e.target.value === '' ? null : Number(e.target.value))}
                disabled={!isEditable}
                className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                    'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                  }`}
                placeholder="0"
              />
              {row[col] && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                  %
                </span>
              )}
            </div>
          );
        }

        if (col === 'pnl') {
          return (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="1"
                value={row[col] ?? ''}
                onChange={e => handleChange(rowId, col, e.target.value === '' ? null : Number(e.target.value))}
                disabled={!isEditable}
                className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                    'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                  }`}
                placeholder="0"
              />
              {!isEditable && row[col] && (
                <span className={getTradeStatus(row).color}>
                  {React.createElement(getTradeStatus(row).icon, { className: "w-4 h-4" })}
                </span>
              )}
            </div>
          );
        }

        return (
          <input
            type="number"
            step="1"
            value={row[col] ?? ''}
            onChange={e => handleChange(rowId, col, e.target.value === '' ? null : Number(e.target.value))}
            disabled={!isEditable}
            className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
              }`}
            placeholder="Enter value"
          />
        );

      default:
        if (col === 'time') {
          return (
            <input
              type="time"
              value={row[col] ?? ''}
              onChange={e => handleTimeChange(rowId, e.target.value)}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                  'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
              placeholder="Select time"
            />
          );
        }

        if (col === 'notes') {
          return (
            <textarea
              value={row[col] ?? ''}
              onChange={e => handleChange(rowId, col, e.target.value)}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border resize-none ${isEditable ? 'bg-black/30 text-white border-white/10' :
                  'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
              placeholder="Enter notes"
              rows="2"
            />
          );
        }

        if (col === 'image' || col === 'images') {
          // Get all images for this trade (combining image and images fields)
          const allTradeImages = [];
          if (row.image) allTradeImages.push(row.image);
          if (row.images && Array.isArray(row.images)) {
            row.images.forEach(img => {
              if (img && !allTradeImages.includes(img)) {
                allTradeImages.push(img);
              }
            });
          }

          return (
            <div className="flex items-center space-x-2">
              <CloudinaryImageUpload
                onImageUpload={(imageData) => {
                  // Handle both single image and array of images
                  if (Array.isArray(imageData)) {
                    handleChange(rowId, 'images', imageData);
                    // Set first image as primary for backward compatibility
                    if (imageData.length > 0) {
                      handleChange(rowId, 'image', imageData[0]);
                    } else {
                      handleChange(rowId, 'image', '');
                    }
                  } else if (imageData) {
                    // Single image - add to images array and set as primary
                    const newImages = allTradeImages.includes(imageData) ? allTradeImages : [...allTradeImages, imageData];
                    handleChange(rowId, 'images', newImages);
                    handleChange(rowId, 'image', imageData);
                  } else {
                    // Clear images
                    handleChange(rowId, 'images', []);
                    handleChange(rowId, 'image', '');
                  }
                }}
                currentImages={allTradeImages}
                disabled={!isEditable}
                maxImages={10}
              />
              {allTradeImages.length > 0 && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openImageViewer(allTradeImages, row, 0)}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                    title={`View ${allTradeImages.length} image${allTradeImages.length > 1 ? 's' : ''}`}
                  >
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">{allTradeImages.length}</span>
                  </button>
                </div>
              )}
            </div>
          );
        }

        return (
          <input
            type="text"
            value={row[col] ?? ''}
            onChange={e => handleChange(rowId, col, e.target.value)}
            disabled={!isEditable}
            className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
              }`}
            placeholder={`Enter ${col}`}
          />
        );
    }
  };

  // Early return for empty state - prevent any rendering of dummy data
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="overflow-x-auto rounded-2xl shadow-lg border border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="py-12 text-center text-gray-400">
          <div className="flex flex-col items-center space-y-4">
            <Calendar className="w-12 h-12 text-gray-500" />
            <p>No trades yet. Click "Add Trade" to create your first entry.</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter out any invalid trades that might be dummy data
  const validRows = rows.filter(row => {
    // Ensure row has required properties and is not dummy data
    return row &&
      typeof row === 'object' &&
      (row.id || row._id) &&
      (!row.userId || row.userId !== 'default-user'); // Filter out default user trades
  });

  // If no valid rows after filtering, show empty state
  if (validRows.length === 0) {
    return (
      <div className="overflow-x-auto rounded-2xl shadow-lg border border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="py-12 text-center text-gray-400">
          <div className="flex flex-col items-center space-y-4">
            <Calendar className="w-12 h-12 text-gray-500" />
            <p>No valid trades found. Click "Add Trade" to create your first entry.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if we should use weekly grouping
  const shouldUseWeeklyGrouping = weeklyData && Object.keys(weeklyData).length > 0;

  return (
    <div className="overflow-x-auto rounded-2xl shadow-lg border border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="min-w-full">
        <table className="min-w-full text-xs md:text-sm lg:text-base">
          <thead>
            <tr className="bg-gradient-to-r from-gray-900/80 to-gray-700/60 text-white">
              {columns.filter(col => col !== "pipsGain" && col !== "images").map(col => (
                <th key={col} className="py-3 px-4 font-semibold border-b border-white/10 whitespace-nowrap text-center">
                  {getHeaderName(col)}
                </th>
              ))}
              <th className="py-3 px-4 font-semibold border-b border-blue-500/30 whitespace-nowrap text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {shouldUseWeeklyGrouping ? (
              // Render weekly grouped data
              Object.entries(weeklyData).map(([weekKey, weekData]) => (
                <React.Fragment key={weekKey}>
                  {/* Week header row */}
                  <tr className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-b border-blue-500/30">
                    <td colSpan={columns.filter(col => col !== "pipsGain" && col !== "images").length + 1} className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-300" />
                        <span className="text-blue-300 font-semibold">
                          {formatWeekRange ? formatWeekRange(weekData.weekStart) : `Week of ${weekData.weekStart.toLocaleDateString()}`}
                        </span>
                        <span className="text-blue-400/70 text-sm">
                          ({weekData.trades.length} trade{weekData.trades.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Trades for this week */}
                  {weekData.trades.map((row, idx) => {
                    const isEditable = true;
                    const isBeingEdited = editingRows.has(row.id);
                    const isNewRow = !row.id || row.id.toString().startsWith('temp_');
                    const tradeStatus = getTradeStatus(row);

                    return (
                      <tr
                        key={row.id || idx}
                        className={`hover:bg-gray-900/30 transition-all border-l-4 ${isBeingEdited ? 'bg-gray-900/30 border-l-gray-500/60' :
                            isNewRow ? 'bg-green-900/20 border-l-green-500/60' :
                              tradeStatus.status === 'profit' ? 'border-l-green-500/30' :
                                tradeStatus.status === 'loss' ? 'border-l-red-500/30' :
                                  'border-l-gray-500/30'
                          }`}
                      >
                        {columns.filter(col => col !== "pipsGain" && col !== "images").map(col => (
                          <td key={col} className="py-3 px-4 border-b border-white/10 border-r">
                            {renderCellContent(row, col, isEditable)}
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
                              onClick={() => removeRow(row.id || row._id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                              title="Delete Trade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            ) : (
              // Render flat list (original behavior)
              validRows.map((row, idx) => {
                const isEditable = true;
                const isBeingEdited = editingRows.has(row.id);
                const isNewRow = !row.id || row.id.toString().startsWith('temp_');
                const tradeStatus = getTradeStatus(row);

                return (
                  <tr
                    key={row.id || idx}
                    className={`hover:bg-gray-900/30 transition-all border-l-4 ${isBeingEdited ? 'bg-gray-900/30 border-l-gray-500/60' :
                        isNewRow ? 'bg-green-900/20 border-l-green-500/60' :
                          tradeStatus.status === 'profit' ? 'border-l-green-500/30' :
                            tradeStatus.status === 'loss' ? 'border-l-red-500/30' :
                              'border-l-gray-500/30'
                      }`}
                  >
                    {columns.filter(col => col !== "pipsGain" && col !== "images").map(col => (
                      <td key={col} className="py-3 px-4 border-b border-white/10 border-r">
                        {renderCellContent(row, col, isEditable)}
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
                          onClick={() => removeRow(row.id || row._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                          title="Delete Trade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalTable;