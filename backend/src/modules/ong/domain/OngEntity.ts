interface Skill {
  id: number;
  name: string;
}

interface Cause {
  id: number;
  name: string;
  description: string;
}

interface SustainableDevelopmentGoal {
  id: number;
  name: string;
  url_ods: string;
  logo_url: string;
}

class Ong {
  id!: number;
  name!: string;
  description?: string;
  is_formalized?: boolean;
  start_year?: number;
  contact_phone?: string;
  instagram_link?: string;
  x_link?: string;
  facebook_link?: string;
  pix_qr_code_link?: string;
  site?: string;
  gallery_images_url?: string[];
  skills?: Skill[];
  causes?: Cause[];
  sustainable_development_goals?: SustainableDevelopmentGoal[];

  constructor(props: Omit<Ong, 'id'>, id?: number) {
    Object.assign(this, props);
    if (id) {
      this.id = id;
    }
  }
}

export { Ong, Skill, Cause, SustainableDevelopmentGoal };