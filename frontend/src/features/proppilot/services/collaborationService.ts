import { ConversationState, Message, ProposalSection } from '../types';

// Collaboration types
export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  isOnline: boolean;
  lastSeen: Date;
  cursor?: {
    sectionId: string;
    position: number;
  };
}

export interface CollaborationEvent {
  id: string;
  type: 'message_added' | 'section_updated' | 'comment_added' | 'user_joined' | 'user_left' | 'cursor_moved';
  userId: string;
  timestamp: Date;
  data: any;
  conversationId: string;
}

export interface CollaborationComment {
  id: string;
  sectionId: string;
  userId: string;
  content: string;
  position?: {
    start: number;
    end: number;
  };
  replies: CollaborationComment[];
  resolved: boolean;
  timestamp: Date;
  mentions: string[];
}

export interface CollaborationSession {
  id: string;
  conversationId: string;
  users: CollaborationUser[];
  events: CollaborationEvent[];
  comments: CollaborationComment[];
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    canExport: boolean;
  };
  settings: {
    allowAnonymous: boolean;
    autoSave: boolean;
    trackChanges: boolean;
    requireApproval: boolean;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'join' | 'leave' | 'event' | 'sync' | 'heartbeat' | 'error';
  sessionId: string;
  userId: string;
  data?: any;
  timestamp: Date;
}

// Collaboration service class
export class CollaborationService {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private userId: string;
  private currentUser: CollaborationUser;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(userId: string, userInfo: Partial<CollaborationUser>) {
    this.userId = userId;
    this.currentUser = {
      id: userId,
      name: userInfo.name || 'Anonymous User',
      email: userInfo.email || '',
      avatar: userInfo.avatar,
      role: userInfo.role || 'editor',
      isOnline: true,
      lastSeen: new Date(),
    };
  }

  // Connection management
  async connect(conversationId: string): Promise<boolean> {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      this.ws = new WebSocket(`${wsUrl}/collaboration/${conversationId}`);

      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('WebSocket not initialized'));
          return;
        }

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          
          // Send join message
          this.send({
            type: 'join',
            sessionId: conversationId,
            userId: this.userId,
            data: this.currentUser,
            timestamp: new Date(),
          });

          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.stopHeartbeat();
          this.handleDisconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      });
    } catch (error) {
      console.error('Failed to connect to collaboration service:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.ws && this.isConnected) {
      this.send({
        type: 'leave',
        sessionId: this.sessionId || '',
        userId: this.userId,
        timestamp: new Date(),
      });
      
      this.ws.close();
    }
    
    this.stopHeartbeat();
    this.isConnected = false;
    this.ws = null;
  }

  // Event handling
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'event':
        this.emit('collaboration_event', message.data);
        break;
      case 'sync':
        this.emit('collaboration_sync', message.data);
        break;
      case 'heartbeat':
        // Respond to heartbeat
        this.send({
          type: 'heartbeat',
          sessionId: this.sessionId || '',
          userId: this.userId,
          timestamp: new Date(),
        });
        break;
      case 'error':
        this.emit('collaboration_error', message.data);
        break;
    }
  }

  private handleDisconnect(): void {
    this.emit('collaboration_disconnected');
    
    // Attempt reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.sessionId) {
          this.connect(this.sessionId);
        }
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'heartbeat',
          sessionId: this.sessionId || '',
          userId: this.userId,
          timestamp: new Date(),
        });
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Message sending
  private send(message: WebSocketMessage): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Public API methods
  sendEvent(event: Omit<CollaborationEvent, 'id' | 'timestamp' | 'userId'>): void {
    const fullEvent: CollaborationEvent = {
      ...event,
      id: crypto.randomUUID(),
      userId: this.userId,
      timestamp: new Date(),
    };

    this.send({
      type: 'event',
      sessionId: this.sessionId || '',
      userId: this.userId,
      data: fullEvent,
      timestamp: new Date(),
    });
  }

  // Message collaboration
  addMessage(message: Message): void {
    this.sendEvent({
      type: 'message_added',
      data: message,
      conversationId: this.sessionId || '',
    });
  }

  // Section collaboration
  updateSection(sectionId: string, updates: Partial<ProposalSection>): void {
    this.sendEvent({
      type: 'section_updated',
      data: { sectionId, updates },
      conversationId: this.sessionId || '',
    });
  }

  // Cursor tracking
  updateCursor(sectionId: string, position: number): void {
    this.currentUser.cursor = { sectionId, position };
    
    this.sendEvent({
      type: 'cursor_moved',
      data: { sectionId, position },
      conversationId: this.sessionId || '',
    });
  }

  // Comment system
  addComment(comment: Omit<CollaborationComment, 'id' | 'timestamp' | 'userId'>): void {
    const fullComment: CollaborationComment = {
      ...comment,
      id: crypto.randomUUID(),
      userId: this.userId,
      timestamp: new Date(),
    };

    this.sendEvent({
      type: 'comment_added',
      data: fullComment,
      conversationId: this.sessionId || '',
    });
  }

  // Event listeners
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Status getters
  getConnectionStatus(): {
    isConnected: boolean;
    reconnectAttempts: number;
    sessionId: string | null;
  } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      sessionId: this.sessionId,
    };
  }

  getCurrentUser(): CollaborationUser {
    return this.currentUser;
  }
}

// Singleton instance
let collaborationService: CollaborationService | null = null;

export const getCollaborationService = (
  userId?: string, 
  userInfo?: Partial<CollaborationUser>
): CollaborationService => {
  if (!collaborationService && userId) {
    collaborationService = new CollaborationService(userId, userInfo || {});
  }
  
  if (!collaborationService) {
    throw new Error('Collaboration service not initialized. Please provide userId and userInfo.');
  }
  
  return collaborationService;
};

// React hook for collaboration
export const useCollaboration = (conversationId: string) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [users, setUsers] = React.useState<CollaborationUser[]>([]);
  const [events, setEvents] = React.useState<CollaborationEvent[]>([]);
  const [comments, setComments] = React.useState<CollaborationComment[]>([]);
  
  React.useEffect(() => {
    // Initialize collaboration service
    const service = getCollaborationService();
    
    const handleEvent = (event: CollaborationEvent) => {
      setEvents(prev => [...prev, event]);
      
      // Handle specific event types
      switch (event.type) {
        case 'user_joined':
          setUsers(prev => [...prev.filter(u => u.id !== event.data.id), event.data]);
          break;
        case 'user_left':
          setUsers(prev => prev.filter(u => u.id !== event.userId));
          break;
        case 'comment_added':
          setComments(prev => [...prev, event.data]);
          break;
      }
    };

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    // Set up event listeners
    service.on('collaboration_event', handleEvent);
    service.on('collaboration_connected', handleConnected);
    service.on('collaboration_disconnected', handleDisconnected);

    // Connect to conversation
    service.connect(conversationId);

    return () => {
      service.off('collaboration_event', handleEvent);
      service.off('collaboration_connected', handleConnected);
      service.off('collaboration_disconnected', handleDisconnected);
      service.disconnect();
    };
  }, [conversationId]);

  return {
    isConnected,
    users,
    events,
    comments,
    service: getCollaborationService(),
  };
};

// Types for React components
export interface CollaborationIndicatorProps {
  users: CollaborationUser[];
  currentUserId: string;
  maxVisible?: number;
}

export interface CommentThreadProps {
  comments: CollaborationComment[];
  sectionId: string;
  onAddComment: (content: string) => void;
  onResolveComment: (commentId: string) => void;
}

export interface CursorOverlayProps {
  users: CollaborationUser[];
  sectionId: string;
}