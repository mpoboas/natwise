<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { ElButton, ElInput, ElMessage, ElSkeleton } from 'element-plus';

const client = useSupabaseClient();
const user = useSupabaseUser();
const userInfo = ref(null);

const router = useRouter();

const getUser = async () => {
  if (!user.value) return;

  const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', user.value.id)
      .single();

  if (error) {
    console.error('Error fetching user:', error);
  } else {
    userInfo.value = data;
  }
};

watchEffect(() => {
  if (user.value) {
    getUser();
  } else {
    userInfo.value = null;
  }
});

const logout = async () => {
  await client.auth.signOut();
  router.push('/');
};
</script>

<template>
  <nav class="flex items-center justify-between p-4 mx-auto bg-purple-800 text-white">
    <div class="flex space-x-10">
      <router-link v-if="userInfo" to="/dashboard">
        <p class="text-2xl font-bold">Natwise</p>
      </router-link>
      <router-link v-else to="/">
        <p class="text-2xl font-bold">Natwise</p>
      </router-link>
      <p v-if="userInfo" class="text-2xl">Welcome, {{ userInfo.name || 'User' }}!</p>
    </div>
    <div>
      <el-button v-if="!user" class="p-button" @click="router.push('/login')">Login</el-button>
      <el-button v-if="!user" type="primary" class="p-button" @click="router.push('/signup')">Signup</el-button>
      <el-button v-if="user" class="p-button" @click="logout">Sign Out</el-button>
    </div>
  </nav>
</template>