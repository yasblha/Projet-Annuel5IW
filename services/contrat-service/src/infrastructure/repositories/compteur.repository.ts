import { Injectable } from '@nestjs/common';
import { CompteurRepository as BaseCompteurRepository } from '@Database/repositories/compteur.repository';

@Injectable()
export class CompteurRepository extends BaseCompteurRepository {}
