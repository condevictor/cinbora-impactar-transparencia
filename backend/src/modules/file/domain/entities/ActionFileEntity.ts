interface ActionFileProps {
    name: string;
    aws_name: string;
    category: string;
    aws_url: string;
    actionId: string;
    ngoId: number;
    mime_type: string;
    size: number;
  }
  
  class ActionFileEntity {
    id!: string;
    name!: string;
    aws_name!: string;
    category!: string;
    aws_url!: string;
    actionId!: string;
    ngoId!: number;
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