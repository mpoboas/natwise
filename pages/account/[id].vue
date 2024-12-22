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
  ElSelect,
  ElOption,
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
  type: '',
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
    await fetchAccount(); // Atualiza o saldo
  }
};
// Transaction function
const submitTransaction = async () => {
  const {type, amount} = transactionForm.value;

  // Validação básica
  if (amount <= 0) {
    console.error("Valor inválido.");
    return;
  }
  const { error } = await client.from("transactions").insert([
    {
      account: account.value.id,
      type,
      amount,
    },
  ]);

  if (error) {
    console.error("Error submitting transaction:", error);
  } else {
    showTransactionModal.value = false; // Fecha o modal
    transactionForm.value = { type: "", amount: 0, description: "" }; // Reseta o formulário
    await fetchHistoryWithAmounts(); // Atualiza o histórico
    await fetchAccount(); // Atualiza o saldo
  }
}

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

  return data;
};

const historyWithAmounts = ref([]);

const fetchHistoryWithAmounts = async () => {
  await getAccountHistory();

  historyWithAmounts.value = await Promise.all(
      accountHistory.value.map(async (row) => {
        const amount = await getAmount(row.type, row.type_id);
        return { ...row, amount };
      })
  );
};

const movementType = (row) => {
  if (row.type === 'transfer') {
    return row.origin_account === account.id ? 'outgoing' : 'incoming';
  } else if (row.type === 'transaction') {
    // TODO: Check if transaction is a deposit or withdraw based on the transaction type
    return row.transaction_type === 'withdraw' ? 'withdraw' : 'deposit';
  }
  return 'unknown';
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

      <el-dialog
          v-model="showTransactionModal"
          title="Transaction"
          width="30%"
          center
      >
        <el-form :model="transactionForm" class="w-full">
          <el-form-item label="Type">
            <!-- deposit or withdraw -->
            <el-select v-model="transactionForm.type" placeholder="Select">
              <el-option label="Deposit" value="deposit" />
              <el-option label="Withdraw" value="withdraw" />
            </el-select>
          </el-form-item>
          <el-form-item label="Amount">
            <el-input-number v-model="transactionForm.amount" :min="0">
              <template #prefix>
                <span>€</span>
              </template>
            </el-input-number>
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="transactionForm.description" placeholder="Description" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showTransactionModal = false">Cancel</el-button>
            <el-button type="primary" @click="submitTransaction">Submit</el-button>
          </span>
        </template>
      </el-dialog>


      <div class="w-[70%]">
        <div class="flex flex-row space-x-3 mb-4">
          <el-button type="primary" @click="showTransactionModal = true">New Transaction</el-button>
          <el-button type="success" @click="showTransferModal = true">New Transfer</el-button>
        </div>

        <el-table :data="historyWithAmounts" style="width: 100%">
          <el-table-column prop="date" label="Date" width="">
            <template #default="scope">
              {{ formatDate(scope.row.date) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="Type" width=""></el-table-column>
          <el-table-column prop="amount" label="Amount" width="">
            <template #default="scope">
              <span>
                {{ formatCurrency(scope.row.amount) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>