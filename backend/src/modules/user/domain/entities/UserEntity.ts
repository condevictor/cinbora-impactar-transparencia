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
    profileUrl!: string | null; // Alterado para aceitar null
  
    constructor(props: UserProps, id?: string) {
        Object.assign(this, props);
        if (id) {
            this.id = id;
        }
    }
}
  
export { User, UserProps };