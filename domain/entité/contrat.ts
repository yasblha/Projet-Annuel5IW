export  class Contrat {
  constructor(
    public id: string,
    public proprietaireId: string,
    public typeProprietaire: string,
    public numero: string,
    public dateDebut: Date,
    public dateFin: Date,
    public statut: string,
    public dateCreation: Date,
    public dateMaj: Date

  ) {}
}