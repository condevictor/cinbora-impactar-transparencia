export interface Log {
    userId: string;
    userName: string;
    action: string;
    model: string;
    modelId: string;
    changes: any;
    description: string;
    timestamp: Date;
  }