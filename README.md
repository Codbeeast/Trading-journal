# Trading Journal Application

A comprehensive trading journal application built with Next.js, featuring real-time data synchronization, session management, and advanced analytics.

## Features

### 🚀 Core Features
- **Real-time Trade Journal**: Track and manage your trading activities with comprehensive data entry
- **Session Management**: Organize trades by trading sessions with custom metadata
- **Psychology Analysis**: Rate your trading psychology and emotional state
- **Image Upload**: Attach charts and screenshots to your trades
- **Advanced Analytics**: Win rate, PnL tracking, and risk management metrics
- **Data Export/Import**: Backup and restore your trading data

### 🔄 Data Flow Architecture

#### Frontend (React/Next.js)
- **Trade Journal Page**: Main interface for trade management
- **Custom Hooks**: `useTradeData` for centralized data management
- **Real-time Sync**: Automatic data synchronization every 5 minutes
- **Error Handling**: Comprehensive error handling with user feedback

#### Backend (Node.js/Next.js API Routes)
- **Authentication**: Clerk-based user authentication
- **Database**: MongoDB with Mongoose ODM
- **API Endpoints**:
  - `/api/trades` - CRUD operations for trades
  - `/api/sessions` - CRUD operations for trading sessions
  - `/api/health` - Backend health check

#### Data Models
- **Trade Model**: Comprehensive trade data with psychology ratings
- **Session Model**: Trading session organization
- **User Model**: User authentication and preferences

## Data Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │    │   (Next.js API) │    │   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. User Action        │                       │
         │ (Add/Edit Trade)      │                       │
         ├──────────────────────►│                       │
         │                       │ 2. Validate Data      │
         │                       │ & Authenticate        │
         │                       ├──────────────────────►│
         │                       │                       │ 3. Store Data
         │                       │                       │
         │ 4. Success Response   │                       │
         │◄──────────────────────│                       │
         │                       │                       │
         │ 5. Update UI State    │                       │
         │ & Show Feedback       │                       │
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Trading-journal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Trades API
- `GET /api/trades` - Fetch all trades for authenticated user
- `POST /api/trades` - Create new trades (supports batch creation)
- `PUT /api/trades/[id]` - Update existing trade
- `DELETE /api/trades/[id]` - Delete trade

### Sessions API
- `GET /api/sessions` - Fetch all sessions for authenticated user
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/[id]` - Update session
- `DELETE /api/sessions/[id]` - Delete session

### Health Check
- `GET /api/health` - Backend connection status

## Data Validation

The application includes comprehensive data validation:

### Frontend Validation
- Numeric field validation (entry, exit, risk, PnL)
- Required field validation
- Business logic validation (entry ≠ exit, positive risk values)

### Backend Validation
- Authentication checks
- Data type validation
- Database constraint validation

## Real-time Features

### Auto-sync
- Automatic data synchronization every 5 minutes
- Manual refresh capability
- Connection status indicators

### Error Handling
- Network error recovery
- Authentication error handling
- User-friendly error messages

## Security

- **Authentication**: Clerk-based user authentication
- **Authorization**: User-specific data access
- **Data Validation**: Input sanitization and validation
- **API Protection**: Middleware-based route protection

## Performance

- **Optimistic Updates**: Immediate UI feedback
- **Batch Operations**: Efficient bulk data operations
- **Caching**: Intelligent data caching strategies
- **Lazy Loading**: Component and data lazy loading

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
