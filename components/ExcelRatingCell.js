import React, { useState, useRef, useEffect } from 'react';

/**
 * @typedef {Object} ExcelRatingCellProps
 * @property {number} value
 * @property {(value: number) => void} onChange
 * @property {number} [min]
 * @property {number} [max]
 * @property {boolean} isSelected
 * @property {boolean} isEditing
 * @property {() => void} onSelect
 * @property {() => void} onStartEdit
 * @property {() => void} onStopEdit
 * @property {(direction: 'up'|'down'|'left'|'right'|'tab'|'enter') => void} onNavigate
 * @property {string} [className]
 */

/**
 * @param {ExcelRatingCellProps} props
 */
export const ExcelRatingCell = ({
  value,
  onChange,
  min = 1,
  max = 10,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onStopEdit,
  onNavigate,
  className = ''
}) => {
  const [tempValue, setTempValue] = useState(value.toString());
  const inputRef = useRef(null);
  const cellRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      setTempValue(value.toString());
    }
  }, [isEditing, value]);

  const handleKeyDown = (e) => {
    if (!isEditing) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigate('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onNavigate('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate('right');
          break;
        case 'Tab':
          e.preventDefault();
          onNavigate('tab');
          break;
        case 'Enter':
          e.preventDefault();
          onStartEdit();
          break;
        case 'F2':
          e.preventDefault();
          onStartEdit();
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            onStartEdit();
            setTempValue(e.key);
          }
          break;
      }
    } else {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          handleSubmit();
          onNavigate('enter');
          break;
        case 'Tab':
          e.preventDefault();
          handleSubmit();
          onNavigate('tab');
          break;
        case 'Escape':
          e.preventDefault();
          onStopEdit();
          break;
      }
    }
  };

  const handleSubmit = () => {
    const numValue = Number(tempValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
    onStopEdit();
  };

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    onStartEdit();
  };

  const handleSliderChange = (e) => {
    const newValue = Number(e.target.value);
    onChange(newValue);
  };

  return (
    <div
      ref={cellRef}
      className={`
        relative h-5 border cursor-cell select-none flex items-center px-1
        ${isSelected ? 'cell-selected' : 'border-gray-300 bg-white'}
        ${isEditing ? 'cell-editing' : ''}
        ${className}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min={min}
          max={max}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSubmit}
          className="w-full h-full text-xs border-none outline-none bg-transparent text-center"
        />
      ) : (
        <div className="flex items-center space-x-1 w-full">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={handleSliderChange}
            className="flex-1 h-1 slider"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs font-medium text-gray-700 min-w-[1rem] text-center">
            {value}
          </span>
        </div>
      )}
    </div>
  );
}; 