interface UserProps {
    name: string;
    email: string;
    ngoId: number;
  }
  
  class User {
    id!: string;
    name!: string;
    email!: string;
    ngoId!: number;
  
    constructor(props: UserProps, id?: string) {
      Object.assign(this, props);
      if (id) {
        this.id = id;
      }
    }
  }
  
  export { User, UserProps };