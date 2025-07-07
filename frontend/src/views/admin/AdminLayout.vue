<template>
  <div class="flex min-h-screen">
    <aside class="w-64 bg-gray-900 text-white flex flex-col">
      <div class="p-6 font-bold text-xl border-b border-gray-800">Administration</div>
      <nav class="flex-1 p-4 space-y-2">
        <router-link to="/admin/users" class="block py-2 px-3 rounded hover:bg-gray-800">Utilisateurs</router-link>
        <router-link to="/admin/roles" class="block py-2 px-3 rounded hover:bg-gray-800">Rôles</router-link>
        <router-link to="/admin/pages" class="block py-2 px-3 rounded hover:bg-gray-800">Pages & Habilitations</router-link>
        <router-link to="/admin/tarifs" class="block py-2 px-3 rounded hover:bg-gray-800">Tarifs</router-link>
        <router-link to="/admin/caisses" class="block py-2 px-3 rounded hover:bg-gray-800">Caisses</router-link>
      </nav>
    </aside>
    <main class="flex-1 bg-gray-50">
      <router-view />
    </main>
  </div>
</template> 