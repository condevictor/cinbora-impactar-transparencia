export interface Log {
    ngoId: number;
    userId: string;
    userName: string;
    action: string;
    model: string;
    modelId: string;
    changes: any;
    description: string;
    timestamp: Date;
  }