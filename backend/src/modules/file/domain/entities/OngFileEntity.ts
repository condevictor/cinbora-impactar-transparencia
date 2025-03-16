interface OngFileProps {
  name: string;
  aws_name: string;
  category: string;
  aws_url: string;
  ngoId: number;
  mime_type: string;
  size: number;
}

class OngFileEntity {
  id!: string;
  name!: string;
  aws_name!: string;
  category!: string;
  aws_url!: string;
  ngoId!: number;
  mime_type!: string;
  size!: number;

  constructor(props: OngFileProps, id?: string) {
    Object.assign(this, props);
    if (id) {
      this.id = id;
    }
  }
}

export { OngFileEntity, OngFileProps };