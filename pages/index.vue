<script setup lang="ts">
import { ElButton } from 'element-plus';
</script>

<template>
  <Head>
    <Title>Natwise</Title>
  </Head>
  <header class="flex items-center justify-center min-h-screen ">
    <div class="card p-6 shadow-lg rounded-lg text-center max-w-sm">
      <h1 class="text-2xl font-bold mb-4">Welcome to Natwise</h1>
      <router-link to="/login">
        <ElButton class="w-full mb-2">Login</ElButton>
      </router-link>
      <router-link to="/signup">
        <ElButton type="primary" class="w-full">Signup</ElButton>
      </router-link>
    </div>
  </header>
</template>
