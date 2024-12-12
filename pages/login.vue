<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";

const supabase = useSupabaseClient();

const email = ref('');
const password = ref('');
const error = ref('');

const router = useRouter();

const signIn = async () => {
  error.value = ''; // Reset error message
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (signInError) {
    error.value = signInError.message;
  } else if (data?.user) {
    router.push('/'); // Redirect to /admin
  } else {
    // Handle the case where there's no error but also no user data
    error.value = 'Login failed: No user data received.';
  }
};

const handleSubmit = async (event: Event) => {
  event.preventDefault();
  await signIn();
};
</script>

<template>
  <header class="flex items-center justify-center min-h-screen">
    <div class="card p-6 shadow-lg rounded-lg text-center max-w-sm w-full">
      <h1 class="text-2xl font-bold mb-4">Login</h1>

      <!-- Form with email and password fields -->
      <form @submit="handleSubmit">
        <!-- Email Input -->
        <div class="mb-4">
          <InputText
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full"
          />
        </div>

        <!-- Password Input -->
        <div class="mb-4">
          <InputText
              v-model="password"
              type="password"
              placeholder="Enter your password"
              class="w-full"
          />
        </div>

        <!-- Error Message Display -->
        <div v-if="error" class="mb-4">
          <Message severity="error" text="error" />
        </div>

        <!-- Submit Button -->
        <Button type="submit" label="Sign In" class="w-full" />
        <p class="mt-4">
          Don't have an account? <router-link to="/signup">Sign Up</router-link>
        </p>
      </form>

    </div>
  </header>
</template>

