<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.token) {
    authStore.fetchUser();
  }
});
</script>

<template>
  <RouterView />
</template>


<style>
/* Los estilos globales ahora están en assets/base.css */
</style>
