export interface Legislator {
  type: "representative" | "senator";
  bio: {
    last_name: string;
    first_name: string;
    birthday?: string;
    gender?: string;
    party: string;
  };
  contact: {
    url?: string;
    address?: string;
    phone?: string;
    contact_form?: string;
  };
  social?: {
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  references?: {
    bioguide_id?: string;
    govtrack_id?: string;
    opensecrets_id?: string;
  };
  source?: string;
}

export interface CongressionalDistrict {
  name: string;
  district_number: number;
  congress_number: number;
  current_legislators: Legislator[];
}

export interface StateLegislativeDistrict {
  name: string;
  district_number: number;
  current_legislators: Legislator[];
}

export interface GeocodioResult {
  address_components: {
    state: string;
    zip: string;
  };
  fields: {
    congressional_districts: CongressionalDistrict[];
    state_legislative_districts: {
      house?: StateLegislativeDistrict;
      senate?: StateLegislativeDistrict;
    };
  };
}

export interface FECCandidate {
  candidate_id: string;
  name: string;
  party: string;
  party_full: string;
  state: string;
  district: string;
  office: string;
  office_full: string;
  election_years: number[];
  incumbent_challenge: string;
  incumbent_challenge_full: string;
}

export interface PacContribution {
  pac_name: string;
  parent_company: string;
  amount: number;
  fec_id: string;
}

export interface PacRecipient {
  candidate_name: string;
  candidate_id?: string;
  contributions: PacContribution[];
  total_amount: number;
}

export interface RepresentativeCard {
  name: string;
  firstName: string;
  lastName: string;
  party: string;
  title: string;
  level: "federal" | "state";
  chamber: string;
  district?: string;
  state: string;
  photoUrl?: string;
  phone?: string;
  website?: string;
  contactForm?: string;
  social?: {
    twitter?: string;
    facebook?: string;
  };
  upForElection2026: boolean;
  pacMoney?: PacContribution[];
  totalPacMoney?: number;
}

export interface Race {
  name: string;
  level: "federal" | "state";
  chamber: string;
  state: string;
  district?: string;
  candidates: CandidateInfo[];
}

export interface CandidateInfo {
  name: string;
  party: string;
  incumbentChallenge?: string;
  fecId?: string;
  pacMoney?: PacContribution[];
  totalPacMoney?: number;
}

export interface LookupResponse {
  representatives: RepresentativeCard[];
  races: Race[];
  aiSpendingSummary: {
    totalAmount: number;
    pacs: { name: string; amount: number }[];
  };
  multipleDistricts: boolean;
  state: string;
}
