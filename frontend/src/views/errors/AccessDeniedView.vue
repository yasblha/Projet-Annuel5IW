<template>
  <div class="access-denied">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-body text-center p-5">
              <div class="mb-4">
                <i class="fas fa-lock text-danger" style="font-size: 4rem;"></i>
              </div>
              <h1 class="mb-3">Accès refusé</h1>
              <p class="mb-4">
                Vous n'avez pas les droits nécessaires pour accéder à cette ressource. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur.
              </p>
              <div class="d-flex justify-content-center gap-3">
                <router-link to="/" class="btn btn-outline-secondary">
                  <i class="fas fa-home me-2"></i>Retour à l'accueil
                </router-link>
                <router-link to="/dashboard" class="btn btn-primary">
                  <i class="fas fa-tachometer-alt me-2"></i>Tableau de bord
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pas besoin de logique JavaScript pour cette vue
</script>

<style scoped>
.access-denied {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
}
</style>
