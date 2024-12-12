<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';

const supabase = useSupabaseClient();
const name = ref('');
const email = ref('');
const phone = ref('');
const address = ref('');
const password = ref('');
const error = ref<string | null>(null);

const signUp = async () => {
  try {
    // Sign up with Supabase auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (signUpError) throw signUpError;

    // Ensure user object is retrieved
    const user = data.user;
    if (!user) throw new Error('User signup failed, no user data returned');

    // Insert user data into `public.users` table
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: user.id,    // Use user ID (UUID) from Supabase auth
        name: name.value,
        email: email.value,
        phone: phone.value,
        address: address.value,
      },
    ]);

    if (insertError) throw insertError;

    // Success message or redirect
    alert('Sign-up successful!');
    router.push('/login');
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<template>
  <header class="flex items-center justify-center min-h-screen">
    <div class="card p-6 shadow-lg rounded-lg text-center max-w-sm w-full">
      <h2 class="text-2xl font-bold mb-4">Sign Up</h2>
      <form @submit.prevent="signUp">
        <!-- Name Input -->
        <div class="mb-4">
          <InputText
              v-model="name"
              type="text"
              placeholder="Enter your name"
              class="w-full"
              required
          />
        </div>

        <!-- Email Input -->
        <div class="mb-4">
          <InputText
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full"
              required
          />
        </div>

        <!-- Phone Input -->
        <div class="mb-4">
          <InputMask
              v-model="phone"
              mask="(999) 999-9999"
              placeholder="Enter your phone"
              class="w-full"
              required
          />
        </div>

        <!-- Address Input -->
        <div class="mb-4">
          <InputText
              v-model="address"
              placeholder="Enter your address"
              class="w-full"
              required
          />
        </div>

        <!-- Password Input -->
        <div class="mb-4">
          <InputText
              v-model="password"
              type="password"
              placeholder="Enter your password"
              class="w-full"
              required
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4">
          <Message severity="error" text="error" />
        </div>

        <!-- Submit Button -->
        <Button type="submit" label="Sign Up" class="w-full" />
      </form>
    </div>
  </header>
</template>
