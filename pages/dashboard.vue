<template>
  <div class="container mx-auto py-5 max-h-60">
    <span class="text-lg font-600">Dashboard</span>
    <el-divider></el-divider>
    <span class="text-xl font-medium">My Accounts</span>
    <div class="flex flex-row space-x-3">
      <div v-for="account in accounts" :key="account.id" class="mt-5 max-w-80">
        <el-card>
          <template #header>
            <div class="card-header">
              <p class="text-sm font-normal">{{ account.name }}</p>
            </div>
          </template>
          <div class="flex items-center flex-row space-x-2">
            <svg class="w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path fill="currentColor" d="M256 640v192h640V384H768v-64h150.976c14.272 0 19.456 1.472 24.64 4.288a29.056 29.056 0 0 1 12.16 12.096c2.752 5.184 4.224 10.368 4.224 24.64v493.952c0 14.272-1.472 19.456-4.288 24.64a29.056 29.056 0 0 1-12.096 12.16c-5.184 2.752-10.368 4.224-24.64 4.224H233.024c-14.272 0-19.456-1.472-24.64-4.288a29.056 29.056 0 0 1-12.16-12.096c-2.688-5.184-4.224-10.368-4.224-24.576V640z"></path>
              <path fill="currentColor" d="M768 192H128v448h640zm64-22.976v493.952c0 14.272-1.472 19.456-4.288 24.64a29.056 29.056 0 0 1-12.096 12.16c-5.184 2.752-10.368 4.224-24.64 4.224H105.024c-14.272 0-19.456-1.472-24.64-4.288a29.056 29.056 0 0 1-12.16-12.096C65.536 682.432 64 677.248 64 663.04V169.024c0-14.272 1.472-19.456 4.288-24.64a29.056 29.056 0 0 1 12.096-12.16C85.568 129.536 90.752 128 104.96 128h685.952c14.272 0 19.456 1.472 24.64 4.288a29.056 29.056 0 0 1 12.16 12.096c2.752 5.184 4.224 10.368 4.224 24.64z"></path>
              <path fill="currentColor" d="M448 576a160 160 0 1 1 0-320 160 160 0 0 1 0 320m0-64a96 96 0 1 0 0-192 96 96 0 0 0 0 192"></path>
            </svg>
            <p class="text-xl font-semibold">{{ formatCurrency(account.balance) }}</p>
          </div>
          <template #footer>
            <p class="text-sm font-light">{{ account.type }}</p>
          </template>
        </el-card>
      </div>
      <div class="mt-5 max-w-80">
        <el-card>
          <div class="flex flex-row items-center justify-items-center space-x-2">
            <p class="text-lg">Create New Account</p>
            <svg class="w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 0 1 0-64z"></path></svg>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDivider, ElCard } from "element-plus";
import { ref, onMounted } from "vue";
definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient();
const user = useSupabaseUser();
const userInfo = ref(null);
const accounts = ref([]);

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

const getAccounts = async () => {
  if (!user.value) return;

  const { data, error } = await client
      .from('accounts')
      .select('*')
      .eq('user', user.value.id);

  if (error) {
    console.error('Error fetching accounts:', error);
  } else {
    accounts.value = data;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

onMounted(() => {
  getUser();
  getAccounts();
  console.log(userInfo);
  console.log(accounts);
});
</script>