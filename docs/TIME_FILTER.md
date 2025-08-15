# Time Filter Documentation

## Overview

The Time Filter component provides dynamic filtering capabilities for the trading journal table, allowing users to view trades by different time periods while maintaining the application's modern UI design.

## Features

### 🎯 **Core Functionality**
- **Current Month View**: Default view showing only the current month's trades
- **Specific Period Selection**: Choose any month/year combination
- **All Time View**: Show all available trading data
- **Show/Hide Toggle**: Easily switch between current month and all months
- **Real-time Statistics**: Live updates of trade counts, PnL, and win rates

### 🎨 **UI/UX Features**
- **Glass-morphism Design**: Matches the application's aesthetic
- **Expandable Interface**: Collapsible filter options to save space
- **Visual Indicators**: Clear status indicators and statistics
- **Responsive Design**: Works on all device sizes
- **Smooth Animations**: Smooth transitions and hover effects

## Component Structure

### TimeFilter Component

```jsx
<TimeFilter
  monthGroups={monthGroups}           // Array of month group data
  onFilterChange={handleFilterChange} // Callback for filter changes
  showAllMonths={showAllMonths}       // Boolean for show/hide state
  onToggleShowAll={handleToggleShowAll} // Callback for toggle
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `monthGroups` | Array | Array of month group objects with trade data |
| `onFilterChange` | Function | Callback when filter type/period changes |
| `showAllMonths` | Boolean | Whether to show all months or just current |
| `onToggleShowAll` | Function | Callback for show/hide all months toggle |

### Month Group Data Structure

```javascript
{
  year: 2024,                    // Year
  month: 12,                     // Month (1-12)
  monthKey: "2024-12",           // Unique key
  trades: [...],                 // Array of trades
  totalPnL: 150.50,              // Total PnL for month
  winCount: 8,                   // Number of winning trades
  totalTrades: 12                // Total number of trades
}
```

## Filter Types

### 1. Current Month Filter
- **Default Behavior**: Shows only the current month's trades
- **Auto-updating**: Automatically updates when month changes
- **Performance**: Fastest loading as it only processes current month data

### 2. Specific Period Filter
- **Year Selection**: Dropdown with all available years
- **Month Selection**: Dropdown with months for selected year
- **Quick Buttons**: Predefined options for common periods
  - Current Month
  - Last Year Same Month
  - Previous Month

### 3. All Time Filter
- **Complete Data**: Shows all available trading data
- **Performance Note**: May be slower with large datasets
- **Comprehensive View**: Best for overall analysis

## Integration with Trade Journal

### State Management

```javascript
// Add these state variables to your component
const [showAllMonths, setShowAllMonths] = useState(false);
const [timeFilter, setTimeFilter] = useState({ 
  type: 'current', 
  year: null, 
  month: null 
});
```

### Event Handlers

```javascript
// Handle filter changes
const handleTimeFilterChange = (filter) => {
  setTimeFilter(filter);
};

// Handle show/hide toggle
const handleToggleShowAll = () => {
  setShowAllMonths(!showAllMonths);
};
```

### Data Filtering Logic

```javascript
// Apply filters to month groups
const getFilteredAndSortedGroups = () => {
  const monthGroups = Object.values(groupedTrades.months);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  let filteredMonthGroups = monthGroups;
  
  if (!showAllMonths) {
    // Show only current month by default
    filteredMonthGroups = monthGroups.filter(group => 
      group.year === currentYear && group.month === currentMonth
    );
  } else {
    // Apply specific filter if set
    if (timeFilter.type === 'current') {
      filteredMonthGroups = monthGroups.filter(group => 
        group.year === currentYear && group.month === currentMonth
      );
    } else if (timeFilter.type === 'specific' && timeFilter.year && timeFilter.month) {
      filteredMonthGroups = monthGroups.filter(group => 
        group.year === timeFilter.year && group.month === timeFilter.month
      );
    }
    // 'all' type shows all months
  }
  
  return filteredMonthGroups.sort((a, b) => {
    const dateA = new Date(a.trades[0]?.date || 0);
    const dateB = new Date(b.trades[0]?.date || 0);
    return dateA - dateB;
  });
};
```

## Usage Examples

### Basic Implementation

```jsx
import TimeFilter from '@/components/TimeFilter';

function TradeJournal() {
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [timeFilter, setTimeFilter] = useState({ type: 'current' });
  
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
  };
  
  const handleToggleShowAll = () => {
    setShowAllMonths(!showAllMonths);
  };
  
  return (
    <div>
      <TimeFilter
        monthGroups={monthGroups}
        onFilterChange={handleTimeFilterChange}
        showAllMonths={showAllMonths}
        onToggleShowAll={handleToggleShowAll}
      />
      {/* Your table component */}
    </div>
  );
}
```

### Advanced Implementation with Custom Logic

```jsx
function TradeJournal() {
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [timeFilter, setTimeFilter] = useState({ type: 'current' });
  const [filteredData, setFilteredData] = useState([]);
  
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    
    // Apply custom filtering logic
    const filtered = applyCustomFilter(monthGroups, filter);
    setFilteredData(filtered);
  };
  
  const applyCustomFilter = (data, filter) => {
    switch (filter.type) {
      case 'current':
        return data.filter(group => 
          group.year === new Date().getFullYear() && 
          group.month === new Date().getMonth() + 1
        );
      case 'specific':
        return data.filter(group => 
          group.year === filter.year && group.month === filter.month
        );
      case 'all':
        return data;
      default:
        return data;
    }
  };
  
  return (
    <div>
      <TimeFilter
        monthGroups={monthGroups}
        onFilterChange={handleTimeFilterChange}
        showAllMonths={showAllMonths}
        onToggleShowAll={() => setShowAllMonths(!showAllMonths)}
      />
      
      {/* Display filtered data */}
      {filteredData.map(group => (
        <div key={group.monthKey}>
          {/* Your table rendering logic */}
        </div>
      ))}
    </div>
  );
}
```

## Styling and Customization

### CSS Classes

The component uses Tailwind CSS classes that match the application's design system:

- **Container**: `bg-gray-900/50 backdrop-blur-lg border border-white/10 rounded-2xl`
- **Active States**: `bg-blue-600/20 border-blue-500/30 text-blue-400`
- **Inactive States**: `bg-gray-700/50 border-gray-600/50 text-gray-300`
- **Hover Effects**: `hover:bg-gray-700/70 transition-all`

### Custom Styling

You can customize the appearance by modifying the component or wrapping it:

```jsx
// Custom wrapper with additional styling
<div className="custom-time-filter-wrapper">
  <TimeFilter
    monthGroups={monthGroups}
    onFilterChange={handleTimeFilterChange}
    showAllMonths={showAllMonths}
    onToggleShowAll={handleToggleShowAll}
  />
</div>
```

## Performance Considerations

### Optimization Tips

1. **Memoization**: Use `useMemo` for expensive filtering operations
2. **Virtualization**: For large datasets, consider virtual scrolling
3. **Debouncing**: Debounce filter changes for better performance
4. **Lazy Loading**: Load data on demand for better initial load times

### Example with Memoization

```jsx
import { useMemo } from 'react';

function TradeJournal() {
  const filteredData = useMemo(() => {
    return getFilteredAndSortedGroups(monthGroups, timeFilter, showAllMonths);
  }, [monthGroups, timeFilter, showAllMonths]);
  
  return (
    <div>
      <TimeFilter
        monthGroups={monthGroups}
        onFilterChange={handleTimeFilterChange}
        showAllMonths={showAllMonths}
        onToggleShowAll={handleToggleShowAll}
      />
      {/* Render filtered data */}
    </div>
  );
}
```

## Accessibility Features

### ARIA Labels and Roles

- **Expandable Sections**: Proper ARIA attributes for collapsible content
- **Button Labels**: Descriptive labels for all interactive elements
- **Screen Reader Support**: Semantic HTML structure for screen readers
- **Keyboard Navigation**: Full keyboard accessibility

### Example ARIA Implementation

```jsx
<button
  aria-expanded={isExpanded}
  aria-controls="filter-options"
  onClick={() => setIsExpanded(!isExpanded)}
>
  Filter Options
</button>
```

## Testing

### Unit Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import TimeFilter from './TimeFilter';

test('renders time filter with correct initial state', () => {
  const mockMonthGroups = [/* test data */];
  const mockOnFilterChange = jest.fn();
  
  render(
    <TimeFilter
      monthGroups={mockMonthGroups}
      onFilterChange={mockOnFilterChange}
      showAllMonths={false}
      onToggleShowAll={jest.fn()}
    />
  );
  
  expect(screen.getByText('Time Filter')).toBeInTheDocument();
  expect(screen.getByText('Current Month')).toBeInTheDocument();
});

test('calls onFilterChange when filter type changes', () => {
  const mockOnFilterChange = jest.fn();
  
  render(
    <TimeFilter
      monthGroups={[]}
      onFilterChange={mockOnFilterChange}
      showAllMonths={false}
      onToggleShowAll={jest.fn()}
    />
  );
  
  fireEvent.click(screen.getByText('All Time'));
  expect(mockOnFilterChange).toHaveBeenCalledWith({
    type: 'all',
    year: null,
    month: null
  });
});
```

## Troubleshooting

### Common Issues

1. **Filter Not Working**
   - Check that `monthGroups` data structure is correct
   - Verify `onFilterChange` callback is properly implemented
   - Ensure state management is set up correctly

2. **Performance Issues**
   - Implement memoization for filtering logic
   - Consider pagination for large datasets
   - Optimize data structure for filtering

3. **UI Not Updating**
   - Check that state updates are triggering re-renders
   - Verify component props are being passed correctly
   - Ensure no infinite loops in useEffect hooks

### Debug Mode

Enable debug logging to troubleshoot issues:

```javascript
const handleTimeFilterChange = (filter) => {
  console.log('Time filter changed:', filter);
  console.log('Current month groups:', monthGroups);
  setTimeFilter(filter);
};
```

## Future Enhancements

### Planned Features

1. **Date Range Picker**: Custom date range selection
2. **Advanced Filters**: Filter by trade type, pair, performance
3. **Saved Filters**: Save and reuse filter combinations
4. **Export Filtered Data**: Export filtered results
5. **Real-time Updates**: Live updates as new trades are added

### API Extensions

1. **Server-side Filtering**: Move filtering logic to backend
2. **Caching**: Cache filtered results for better performance
3. **Analytics**: Track filter usage patterns
4. **Personalization**: Remember user's preferred filters

## Support

For issues or questions regarding the Time Filter component:

1. Check this documentation
2. Review the component source code
3. Test with the demo component
4. Check browser console for errors
5. Verify data structure matches expected format
