<template>
  <Head>
    <Title>Natwise</Title>
  </Head>
  <header class="flex items-center justify-center min-h-screen ">
    <div class="card p-6 shadow-lg rounded-lg text-center max-w-sm">
      <h1 class="text-2xl font-bold mb-4">Welcome to Natwise</h1>
      <router-link to="/login">
        <Button label="Login" class="p-button p-button-secondary w-full mb-2" />
      </router-link>
      <router-link to="/signup">
        <Button label="Signup" class="p-button p-button-primary w-full" />
      </router-link>
    </div>
  </header>
</template>

<script setup>
import Button from 'primevue/button';
</script>
