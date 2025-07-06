export class ContractCosigner {
    constructor(
        public id: string | undefined,
        public contratId: string,
        public cosignataireId: string,
        public typeCosignataire: 'UTILISATEUR' | 'ENTREPRISE',
        public roleType: 'PRINCIPAL' | 'SECONDARY',
        public pourcentageParts: number | null,
        public statutInvitation: 'ENVOYE' | 'ACCEPTE' | 'REFUSE',
        public dateInvitation: Date,
        public dateReponse: Date | null,
        public signatureElectronique: boolean,
        public signatureDate: Date | null
    ) {}
}
