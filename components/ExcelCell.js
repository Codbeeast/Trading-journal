import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * @typedef {Object} ExcelCellProps
 * @property {string|number|null} value
 * @property {(value: string|number|null) => void} onChange
 * @property {'text'|'number'|'dropdown'} [type]
 * @property {string[]} [options]
 * @property {boolean} isSelected
 * @property {boolean} isEditing
 * @property {() => void} onSelect
 * @property {() => void} onStartEdit
 * @property {() => void} onStopEdit
 * @property {(direction: 'up'|'down'|'left'|'right'|'tab'|'enter') => void} onNavigate
 * @property {string} [className]
 * @property {string} [placeholder]
 */

/**
 * @param {ExcelCellProps} props
 */
export const ExcelCell = ({
  value,
  onChange,
  type = 'text',
  options = [],
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onStopEdit,
  onNavigate,
  className = '',
  placeholder = ''
}) => {
  const [tempValue, setTempValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const cellRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type !== 'dropdown') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  useEffect(() => {
    if (isEditing) {
      setTempValue(value?.toString() || '');
      if (type === 'dropdown') {
        setShowDropdown(true);
        updateDropdownPosition();
      }
    } else {
      setShowDropdown(false);
    }
  }, [isEditing, value, type]);

  useEffect(() => {
    if (showDropdown) {
      updateDropdownPosition();
    }
  }, [showDropdown]);

  const updateDropdownPosition = () => {
    if (cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!isEditing) {
      // Navigation when not editing
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
          // Start editing with any printable character
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            onStartEdit();
            setTempValue(e.key);
          }
          break;
      }
    } else {
      // Editing mode
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
    if (type === 'number') {
      const numValue = tempValue === '' ? null : Number(tempValue);
      onChange(isNaN(numValue) ? null : numValue);
    } else {
      onChange(tempValue || null);
    }
    onStopEdit();
  };

  const handleClick = () => {
    onSelect();
    if (type === 'date' && !isEditing) {
      onStartEdit();
    }
  };

  const handleDoubleClick = () => {
    onStartEdit();
  };

  const handleDropdownSelect = (selectedValue) => {
    onChange(selectedValue);
    onStopEdit();
  };

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(tempValue.toLowerCase())
  );

  const displayValue = value?.toString() || '';

  return (
    <>
      <div
        ref={cellRef}
        className={`
          relative h-5 border cursor-cell select-none excel-cell-content
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
            type={type === 'number' ? 'number' : 'text'}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSubmit}
            className="w-full h-full px-1 text-xs border-none outline-none bg-white"
            placeholder={placeholder}
            step={type === 'number' ? 'any' : undefined}
          />
        ) : (
          <div className={`w-full h-full flex items-center px-1 text-xs relative ${displayValue ? 'text-gray-200' : 'text-gray-500'}`}>
            {displayValue || placeholder}
            {type === 'dropdown' && (
              <ChevronDown className="w-3 h-3 absolute right-1 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Portal-style dropdown that appears above everything */}
      {showDropdown && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="dropdown-menu"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${Math.max(dropdownPosition.width, 150)}px`,
            zIndex: 10000
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filteredOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleDropdownSelect(option)}
              className="dropdown-item"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </>
  );
}; 