# Blink 2.0 - Shared Link Vault

A minimalist, web-based link storage and collaboration app built with React.js, TypeScript, and Firebase.

## Features

### Core Functionality
- 🔐 **User Authentication** - Secure login and signup with Firebase Auth
- 📁 **Vault Management** - Create, edit, and delete vaults (link containers)
- 🔗 **Link Management** - Add, edit, and delete links within vaults
- ⚡ **Real-time Sync** - Live data synchronization with Firebase Firestore
- 🎨 **Theme System** - Light/dark mode with persistent storage

### Collaboration Features
- 📧 **Email Invitations** - Send vault invitations to users by email
- 🔑 **Permission Management** - View, comment, and edit permissions
- 👥 **Collaborator Management** - Add, remove, and manage vault collaborators
- 🔗 **Share Links** - Generate shareable links with expiration and usage limits
- 🔔 **Notifications** - Real-time notification system for invitations and updates

### User Experience
- 🔍 **Search Functionality** - Search across vaults, links, titles, descriptions, and URLs
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- ⏳ **Loading States** - Skeleton loaders and loading indicators
- 🛡️ **Error Handling** - Error boundaries and user-friendly error messages
- 📋 **Copy to Clipboard** - Quick copy functionality for links

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Classic CSS (transitioned from Tailwind CSS)
- **Backend**: Firebase (Authentication + Firestore)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blink-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Copy your Firebase config and update `src/firebase/config.ts`

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AddLinkModal.tsx
│   ├── CollaboratorsModal.tsx
│   ├── CreateVaultModal.tsx
│   ├── DeleteConfirmModal.tsx
│   ├── EditLinkModal.tsx
│   ├── EditVaultModal.tsx
│   ├── ErrorBoundary.tsx
│   ├── LoadingSkeleton.tsx
│   ├── NotificationsPanel.tsx
│   ├── ProtectedRoute.tsx
│   └── ShareLinkModal.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx      # Authentication state
│   ├── ThemeContext.tsx     # Theme management
│   └── VaultContext.tsx     # Vault state management
├── firebase/           # Firebase configuration
│   └── config.ts
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── Settings.tsx
│   ├── ShareVault.tsx
│   ├── SignupPage.tsx
│   └── VaultDetails.tsx
├── services/           # Business logic services
│   ├── notificationService.ts
│   ├── shareLinkService.ts
│   ├── sharingService.ts
│   └── vaultService.ts
├── types/              # TypeScript type definitions
│   ├── index.ts
│   └── notification.ts
├── utils/              # Utility functions
│   └── firebaseTest.ts
├── App.tsx             # Main app component
├── index.css           # Global styles
└── main.tsx            # App entry point
```

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - allow authenticated users to read and query
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Vaults - simplified rules for sharing to work
    match /vaults/{vaultId} {
      // Anyone authenticated can create a vault they own
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      
      // Can read if owner or in authorizedUsers
      allow read: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.authorizedUsers);
      
      // Only owner can delete
      allow delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
      
      // Can update if owner, authorized user, OR adding yourself to authorizedUsers
      allow update: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.authorizedUsers ||
         request.auth.uid in request.resource.data.authorizedUsers);
    }
    
    // Share invitations - open for authenticated users
    match /shareInvites/{inviteId} {
      allow read, write: if request.auth != null;
    }
    
    // Vault permissions
    match /vaultPermissions/{permissionId} {
      allow read, write: if request.auth != null;
    }
    
    // Share links
    match /shareLinks/{linkId} {
      allow read, write: if request.auth != null;
    }
    
    // Notifications - anyone can create, users can only read their own
    match /notifications/{notificationId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.