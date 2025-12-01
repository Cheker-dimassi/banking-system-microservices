export interface ICompteBancaire {
  _id: string;
  numeroCompte: string;
  typeCompte: 'COURANT' | 'EPARGNE';
  solde: number;
  devise: string;
  dateCreation: Date;
  dateModification: Date;
  clientId: string;
  estActif: boolean;
  email: string;
  estGele: boolean;
  raison_gel: string | null;
  limiteMoyenne: number | null;
  listeBlanche: string[];
}

export interface IMouvementCompte {
  _id: string;
  compteId: string;
  typeMouvement: 'CREDIT' | 'DEBIT';
  montant: number;
  soldeApresMouvement: number;
  dateMouvement: Date;
  description: string;
  referenceTransaction?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
