interface ActionFileProps {
    name: string;
    category: string;
    aws_url: string;
    actionId: string;
    mime_type: string;
    size: number;
  }
  
  class ActionFileEntity {
    id!: string;
    name!: string;
    category!: string;
    aws_url!: string;
    actionId!: string;
    mime_type!: string;
    size!: number;
  
    constructor(props: ActionFileProps, id?: string) {
      Object.assign(this, props);
      if (id) {
        this.id = id;
      }
    }
  }
  
  export { ActionFileEntity, ActionFileProps };