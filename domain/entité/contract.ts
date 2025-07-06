export class Contract {
  public constructor(
        public id: string | undefined,
        public proprietaireId: string,
        public typeProprietaire: 'UTILISATEUR' | 'ENTREPRISE',
        public numero: string,
        public dateDebut: Date,
        public dateFin: Date | null,
        public statut: 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'ANNULE' | 'TERMINE',
        public dateCreation: Date,
        public dateMaj: Date
    ) {}
}