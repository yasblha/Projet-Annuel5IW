<template>
  <v-card class="mb-4" outlined>
    <v-card-title class="d-flex align-center">
      <span>Recherche avancée</span>
      <v-spacer></v-spacer>
      <v-btn 
        color="primary"
        icon
        small
        @click="showFilters = !showFilters"
      >
        <v-icon>{{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-title>

    <v-expand-transition>
      <div v-show="showFilters">
        <v-card-text>
          <v-form ref="searchForm">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filters.numeroBusiness"
                  label="Numéro de contrat"
                  outlined
                  dense
                  clearable
                  hide-details="auto"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.statut"
                  :items="statutItems"
                  label="Statut"
                  outlined
                  dense
                  clearable
                  hide-details="auto"
                  multiple
                  chips
                  small-chips
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.typeContrat"
                  :items="typeContratItems"
                  label="Type de contrat"
                  outlined
                  dense
                  clearable
                  hide-details="auto"
                ></v-select>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filters.proprietaireNom"
                  label="Nom du propriétaire"
                  outlined
                  dense
                  clearable
                  hide-details="auto"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-menu
                  ref="dateDebutMenu"
                  v-model="dateDebutMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="filters.dateDebutFrom"
                      label="Date de début - Du"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      outlined
                      dense
                      clearable
                      @click:clear="filters.dateDebutFrom = ''"
                      hide-details="auto"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="filters.dateDebutFrom"
                    @input="dateDebutMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" md="4">
                <v-menu
                  ref="dateDebutToMenu"
                  v-model="dateDebutToMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="filters.dateDebutTo"
                      label="Date de début - Au"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      outlined
                      dense
                      clearable
                      @click:clear="filters.dateDebutTo = ''"
                      hide-details="auto"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="filters.dateDebutTo"
                    @input="dateDebutToMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.zone"
                  :items="zoneItems"
                  label="Zone"
                  outlined
                  dense
                  clearable
                  hide-details="auto"
                ></v-select>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filters.adresse"
                  label="Adresse"
                  outlined
                  dense
                  clearable
                  hide-details="auto"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filters.compteurNumero"
                  label="Numéro de compteur"
                  outlined
                  dense
                  clearable
                  hide-details="auto"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-4"></v-divider>

          <v-row class="mb-0">
            <v-col cols="12" class="d-flex justify-end mb-0 pb-0">
              <v-btn
                outlined
                color="grey darken-1"
                class="mr-2"
                @click="resetFilters"
              >
                <v-icon left>mdi-refresh</v-icon>
                Réinitialiser
              </v-btn>
              <v-btn
                color="primary"
                @click="search"
                :loading="isSearching"
              >
                <v-icon left>mdi-magnify</v-icon>
                Rechercher
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
  
  <!-- Résultats de recherche -->
  <v-card v-if="hasSearched" outlined>
    <v-card-title class="d-flex align-center">
      <span>{{ searchResults.length }} résultats trouvés</span>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        icon
        @click="exportResults"
        :disabled="searchResults.length === 0"
        small
      >
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="searchResults"
      :loading="isSearching"
      :server-items-length="searchTotal"
      :options.sync="pagination"
      :footer-props="{
        'items-per-page-options': [10, 25, 50, 100],
        'show-first-last-page': true
      }"
      @update:options="handleTableOptions"
      class="elevation-0"
    >
      <template v-slot:item.numeroBusiness="{ item }">
        <router-link 
          :to="{ name: 'contrat-details', params: { id: item.id } }"
          class="text-decoration-none font-weight-bold"
        >
          {{ item.numeroBusiness || 'N/A' }}
        </router-link>
      </template>

      <template v-slot:item.dateDebut="{ item }">
        {{ formatDate(item.dateDebut) }}
      </template>

      <template v-slot:item.dateFin="{ item }">
        {{ item.dateFin ? formatDate(item.dateFin) : 'N/A' }}
      </template>

      <template v-slot:item.statut="{ item }">
        <v-chip
          :color="getStatusColor(item.statut)"
          small
          label
          text-color="white"
        >
          {{ item.statut }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          small
          :to="{ name: 'contrat-details', params: { id: item.id } }"
          color="primary"
        >
          <v-icon small>mdi-eye</v-icon>
        </v-btn>
      </template>

      <template v-slot:no-data>
        <v-alert
          type="info"
          dense
          outlined
          text
        >
          Aucun contrat trouvé.
        </v-alert>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { ref, reactive, toRefs, computed, onMounted } from 'vue';
import { useContractStore } from '@/stores/contract.store';
import { storeToRefs } from 'pinia';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default {
  name: 'ContractAdvancedSearch',
  
  setup() {
    const contractStore = useContractStore();
    const { searchResults, searchTotal, isSearching } = storeToRefs(contractStore);
    
    const searchForm = ref(null);
    
    const state = reactive({
      showFilters: true,
      hasSearched: false,
      dateDebutMenu: false,
      dateDebutToMenu: false,
      filters: {
        numeroBusiness: '',
        statut: [],
        typeContrat: null,
        proprietaireNom: '',
        dateDebutFrom: '',
        dateDebutTo: '',
        zone: null,
        adresse: '',
        compteurNumero: ''
      },
      pagination: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['dateDebut'],
        sortDesc: [true]
      },
      headers: [
        { text: 'N° contrat', value: 'numeroBusiness', sortable: true },
        { text: 'Type', value: 'typeContrat', sortable: true },
        { text: 'Propriétaire', value: 'proprietaire.nomComplet', sortable: true },
        { text: 'Date début', value: 'dateDebut', sortable: true },
        { text: 'Date fin', value: 'dateFin', sortable: true },
        { text: 'Statut', value: 'statut', sortable: true },
        { text: 'Zone', value: 'zone', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' }
      ],
      statutItems: [
        { text: 'Brouillon', value: 'BROUILLON' },
        { text: 'En attente', value: 'EN_ATTENTE' },
        { text: 'Actif', value: 'ACTIF' },
        { text: 'Résilié', value: 'RESILIE' },
        { text: 'Suspendu', value: 'SUSPENDU' },
        { text: 'Expiré', value: 'EXPIRE' }
      ],
      typeContratItems: [
        { text: 'Individuel', value: 'I' },
        { text: 'Professionnel', value: 'P' },
        { text: 'Collectif', value: 'C' },
        { text: 'Administratif', value: 'A' }
      ],
      zoneItems: [
        { text: 'Zone 1', value: 'ZONE_1' },
        { text: 'Zone 2', value: 'ZONE_2' },
        { text: 'Zone 3', value: 'ZONE_3' }
      ]
    });

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
      } catch (error) {
        return dateString;
      }
    };

    const getStatusColor = (status) => {
      const colorMap = {
        'BROUILLON': 'grey',
        'EN_ATTENTE': 'amber darken-2',
        'ACTIF': 'success',
        'RESILIE': 'error',
        'SUSPENDU': 'warning',
        'EXPIRE': 'grey darken-3'
      };

      return colorMap[status] || 'grey';
    };

    const search = async () => {
      // Préparer les filtres à envoyer à l'API
      const apiFilters = {
        page: state.pagination.page,
        limit: state.pagination.itemsPerPage,
        sort: state.pagination.sortBy.length ? state.pagination.sortBy[0] : 'dateDebut',
        order: state.pagination.sortDesc[0] ? 'DESC' : 'ASC'
      };

      // Ajouter les filtres non-vides
      if (state.filters.numeroBusiness) apiFilters.numeroBusiness = state.filters.numeroBusiness;
      if (state.filters.statut && state.filters.statut.length) apiFilters.statut = state.filters.statut;
      if (state.filters.typeContrat) apiFilters.typeContrat = state.filters.typeContrat;
      if (state.filters.proprietaireNom) apiFilters.proprietaireNom = state.filters.proprietaireNom;
      if (state.filters.dateDebutFrom) apiFilters.dateDebutFrom = state.filters.dateDebutFrom;
      if (state.filters.dateDebutTo) apiFilters.dateDebutTo = state.filters.dateDebutTo;
      if (state.filters.zone) apiFilters.zone = state.filters.zone;
      if (state.filters.adresse) apiFilters.adresse = state.filters.adresse;
      if (state.filters.compteurNumero) apiFilters.compteurNumero = state.filters.compteurNumero;

      try {
        await contractStore.searchContracts(apiFilters);
        state.hasSearched = true;
      } catch (error) {
        console.error('Erreur de recherche:', error);
      }
    };

    const resetFilters = () => {
      // Réinitialisation des filtres
      state.filters = {
        numeroBusiness: '',
        statut: [],
        typeContrat: null,
        proprietaireNom: '',
        dateDebutFrom: '',
        dateDebutTo: '',
        zone: null,
        adresse: '',
        compteurNumero: ''
      };

      // Réinitialisation de la pagination
      state.pagination = {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['dateDebut'],
        sortDesc: [true]
      };
    };

    const handleTableOptions = (options) => {
      state.pagination = options;
      search();
    };

    const exportResults = () => {
      // Préparation des données pour l'export CSV
      const csvContent = [
        // En-tête
        ['N° contrat', 'Type', 'Propriétaire', 'Date début', 'Date fin', 'Statut', 'Zone'].join(','),
        // Données
        ...searchResults.value.map(item => [
          item.numeroBusiness || '',
          item.typeContrat || '',
          item.proprietaire?.nomComplet || '',
          formatDate(item.dateDebut),
          item.dateFin ? formatDate(item.dateFin) : 'N/A',
          item.statut || '',
          item.zone || ''
        ].join(','))
      ].join('\n');

      // Création du blob et téléchargement
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contrats_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
    };

    onMounted(() => {
      // Initialiser la liste des zones depuis une API si nécessaire
    });

    return {
      ...toRefs(state),
      searchResults,
      searchTotal,
      isSearching,
      searchForm,
      search,
      resetFilters,
      formatDate,
      getStatusColor,
      handleTableOptions,
      exportResults
    };
  }
};
</script>
