<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  ElButton,
  ElDivider,
  ElTable,
  ElTableColumn
} from "element-plus";

const client = useSupabaseClient();
const account = ref(null);
const accountHistory = ref([]);
const route = useRoute();
const showModal = ref(false);
const transferAmount = ref(null);
const toAccount = ref('');

const openTransferModal = () => {
    showModal.value = true;
};

const closeTransferModal = () => {
    showModal.value = false;
    transferAmount.value = null;
    toAccount.value = '';
};

const submitTransfer = () => {
    console.log('Transfer Details:', {
        amount: transferAmount.value,
        toAccount: toAccount.value,
    });

    // Simulating transfer and closing the modal
    closeTransferModal();

    // Optionally, you can redirect or display a success message here
    alert(`Transfer of ${transferAmount.value} to account ${toAccount.value} confirmed!`);
};

const fetchAccount = async () => {
    const { id } = route.params;
    const { data } = await client
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();

    if (data) {
      account.value = data;
    } else {
      console.error('Account not found');
    }
}



const getAccountHistory = async () => {
  const {id} = route.params;
  const {data} = await client
      .from('history')
      .select('*')
      .eq('account', id)
      .order('date', {ascending: false});

  if (data) {
    accountHistory.value = data;
  } else {
    console.error('Error fetching account history');
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getAmount = async (type: string, type_id: string) => {
  const { data, error } = await client
    .rpc('get_amount_by_type_and_id', { type, type_id });

  if (error) {
    console.error('Error fetching amount:', error);
    return 0;
  }

  return data ? data.amount : 0;
};

const historyWithAmounts = ref([]);

const fetchHistoryWithAmounts = async () => {
  historyWithAmounts.value = await Promise.all(
      accountHistory.map(async (row) => {
        const amount = await getAmount(row.type, row.type_id);
        return { ...row, amount };
      })
  );
};


const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const test = async () => {
    const { data } = await client
        .rpc('get_account_id_by_iban', { input_iban: 'PT503197403148062616' })
    console.log(data);


}
onMounted(() => {
    fetchAccount();
    getAccountHistory();
    fetchHistoryWithAmounts();
});

</script>
<template>
  <div v-if="account" class="container mx-auto py-5 max-h-60">
    <!-- Breadcrumb Navigation -->
    <span class="text-lg font-600">Dashboard</span>
    <span class="text-lg font-600"> > Accounts</span>
    <el-divider></el-divider>

    <!-- Account Name -->

    <!-- 2-column Layout -->
    <div class="flex flex-row space-x-4 mt-5">

      <!-- Column 1: Account Info (30%) -->
      <div class="w-[30%]">
        <p class="text-2xl font-medium mb-3">{{ account.name }}</p>
        <p class="text-lg font-light">IBAN: {{ account.iban }}</p>
        <p class="text-lg font-light">Balance: {{ formatCurrency(account.balance) }}</p>
        <p class="text-lg font-light">Type: {{ account.type }}</p>
      </div>
        <el-divider direction="vertical" class="h-full" style="height: 100vh"/>

      <div class="w-[70%]">
        <div class="flex flex-row space-x-3 mb-4">
          <el-button type="primary" @click="newTransaction">New Transaction</el-button>
          <el-button type="success" @click="newTransfer">New Transfer</el-button>
        </div>

        <el-table :data="historyWithAmounts" style="width: 100%">
          <el-table-column prop="date" label="Date" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.date) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="Type" width="120"></el-table-column>
          <el-table-column prop="description" label="Description"></el-table-column>
          <el-table-column prop="amount" label="Amount" width="150">
            <template #default="scope">
              <span :class="scope.row.amount < 0 ? 'text-red-500' : 'text-green-500'">
                {{ formatCurrency(scope.row.amount) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>

</template>