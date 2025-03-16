interface ActionProps {
  name: string;
  type: string;
  ngoId: number;
  spent: number;
  goal: number;
  colected: number;
  aws_url: string;
}

class Action {
  id!: string;
  name!: string;
  type!: string;
  ngoId!: number;
  spent!: number;
  goal!: number;
  colected!: number;
  aws_url!: string;

  constructor(props: ActionProps, id?: string) {
    Object.assign(this, props);
    if (id) {
      this.id = id;
    }
  }
}

export { Action, ActionProps };
