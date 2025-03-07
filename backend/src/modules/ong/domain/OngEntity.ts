interface OngProps {
  id: number;
  name: string;
  description: string;
  is_formalized: boolean;
  start_year: number | null;
  contact_phone: string;
  instagram_link: string;
  x_link: string;
  facebook_link: string;
  pix_qr_code_link: string;
  site: string | null;
  gallery_images_url: string[];
  skills: any;
  causes: any;
  sustainable_development_goals: any;
}

class Ong {
  id!: number;
  name!: string;
  description!: string;
  is_formalized!: boolean;
  start_year!: number | null;
  contact_phone!: string;
  instagram_link!: string;
  x_link!: string;
  facebook_link!: string;
  pix_qr_code_link!: string;
  site!: string | null;
  gallery_images_url!: string[];
  skills!: any;
  causes!: any;
  sustainable_development_goals!: any;

  constructor(props: OngProps, id?: number) {
    Object.assign(this, props);
    if (id) {
      this.id = id;
    }
  }
}

export { Ong, OngProps };