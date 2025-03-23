interface OngProps {
  id: number;
  name: string;
  description: string;
  is_formalized: boolean;
  start_year: number | null;
  contact_phone: string | null;
  instagram_link: string | null;
  x_link: string | null;
  facebook_link: string | null;
  pix_qr_code_link: string | null;
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
  contact_phone!: string | null;
  instagram_link!: string | null;
  x_link!: string | null;
  facebook_link!: string | null;
  pix_qr_code_link!: string | null;
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
