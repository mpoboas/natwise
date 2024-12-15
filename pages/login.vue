<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import {ElButton, ElInput, ElMessage, ElText} from 'element-plus';
const router = useRouter();
const user = useSupabaseUser()
const { auth } = useSupabaseClient()

watchEffect(() => {
  if (user.value) {
    navigateTo('/')
  }
})

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);

const signIn = async () => {
  error.value = ''; // Reset error message before sign-in attempt

  const { data, error: signInError } = await auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (signInError) {
    ElMessage({
      message: 'An error occurred. ' + signInError.message,
      type: 'error',
    });
  } else if (data?.user) {
    ElMessage({
      message: 'Sign in successful.',
      type: 'success',
    });
    router.push('/'); // Redirect to home if login is successful
  } else {
    ElMessage({
      message: 'An error occurred. Please try again.',
      type: 'error',
    });
  }
};

// function to compute 16px from the bottom of the viewport
const getOffset = () => {
  const offset = window.innerHeight - 100;
  return offset;
};
</script>

<template>
  <Head>
    <Title>Login - Natwise</Title>
  </Head>
  <header class="flex items-center justify-center min-h-screen">
    <div class="card p-6 shadow-lg rounded-lg text-center max-w-sm w-full">
      <h1 class="text-2xl font-bold mb-4">Login</h1>

      <!-- Form with email and password fields -->
      <div class="mb-4">
        <el-input
            v-model="email"
            type="text"
            placeholder="Enter your email"
            class="w-full"
            required
        />
      </div>

      <div class="mb-4">
        <el-input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full"
            show-password
            required
        />
      </div>

      <!-- Sign In Button -->
      <el-button type="primary" class="w-full" @click="signIn">Sign In</el-button>

      <p class="mt-4">
        Don't have an account?
        <router-link to="/signup">
          <el-button link>Sign Up</el-button>
        </router-link>
      </p>
    </div>
  </header>
</template>
