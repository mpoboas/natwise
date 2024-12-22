<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  ElButton,
  ElDivider,
  ElTable,
  ElTableColumn,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElDialog,
} from "element-plus";

const client = useSupabaseClient();
const account = ref(null);
const accountHistory = ref([]);
const route = useRoute();
const showModal = ref(false);
const transferAmount = ref({
  iban: '',
  amount: 0,
  description: '',
});

const transactionForm = ref({
  type: 'deposit',
  amount: 0,
  description: '',
});
const toAccount = ref('');
const showTransferModal = ref(false);
const showTransactionModal = ref(false);

// Transfer function
const submitTransfer = async () => {
  const { iban, amount, description } = transferAmount.value;

  // Validação básica
  if (!iban || amount <= 0) {
    console.error("IBAN ou valor inválido.");
    return;
  }

  const dest_account = await getAccountIdByIban(iban);
  console.log(dest_account);
  console.log(account.value.id);
  // Geração da transação
  const { error } = await client.from("transfers").insert([
    {
      origin_account: account.value.id,
      destination_account: dest_account,
      amount,
      description,
      date: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Error submitting transfer:", error);
  } else {
    showTransferModal.value = false; // Fecha o modal
    transferAmount.value = { iban: "", amount: 0, description: "" }; // Reseta o formulário
    await fetchHistoryWithAmounts(); // Atualiza o histórico
  }
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

const getAccountIdByIban = async (iban : string) => {
    const { data } = await client
        .rpc('get_account_id_by_iban', { input_iban: iban })
    console.log(data);
  return data;
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

      <el-dialog
          v-model="showTransferModal"
          title="Transfer"
          width="30%"
          center
      >
        <el-form :model="transferAmount" class="w-full">
          <el-form-item label="Account IBAN">
            <el-input v-model="transferAmount.iban" placeholder="IBAN" />
          </el-form-item>
          <el-form-item label="Amount">
            <el-input-number v-model="transferAmount.amount" :min="0">
              <template #prefix>
                <span>€</span>
              </template>
            </el-input-number>
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="transferAmount.description" placeholder="Description" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showTransferModal = false">Cancel</el-button>
            <el-button type="primary" @click="submitTransfer">Transfer</el-button>
          </span>
        </template>
      </el-dialog>

      <div class="w-[70%]">
        <div class="flex flex-row space-x-3 mb-4">
          <el-button type="primary" @click="newTransaction">New Transaction</el-button>
          <el-button type="success" @click="showTransferModal = true">New Transfer</el-button>
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