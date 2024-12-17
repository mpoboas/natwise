<template>
  <div class="container mx-auto py-5 max-h-60">
    <span class="text-lg font-600">Dashboard</span>
    <el-divider></el-divider>
    <span class="text-xl font-medium">My Accounts</span>

    <div class="grid grid-cols-5 gap-3">
      <!-- Existing Accounts -->
      <div v-for="account in accounts" :key="account.id" class="mt-5 max-w-80">
        <el-card>
          <template #header>
            <div class="card-header">
              <p class="text-sm font-normal">{{ account.name }}</p>
            </div>
          </template>
          <div class="flex items-center flex-row space-x-2">
            <svg class="w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" ><path fill="currentColor" d="M256 640v192h640V384H768v-64h150.976c14.272 0 19.456 1.472 24.64 4.288a29.056 29.056 0 0 1 12.16 12.096c2.752 5.184 4.224 10.368 4.224 24.64v493.952c0 14.272-1.472 19.456-4.288 24.64a29.056 29.056 0 0 1-12.096 12.16c-5.184 2.752-10.368 4.224-24.64 4.224H233.024c-14.272 0-19.456-1.472-24.64-4.288a29.056 29.056 0 0 1-12.16-12.096c-2.688-5.184-4.224-10.368-4.224-24.576V640z"></path><path fill="currentColor" d="M768 192H128v448h640zm64-22.976v493.952c0 14.272-1.472 19.456-4.288 24.64a29.056 29.056 0 0 1-12.096 12.16c-5.184 2.752-10.368 4.224-24.64 4.224H105.024c-14.272 0-19.456-1.472-24.64-4.288a29.056 29.056 0 0 1-12.16-12.096C65.536 682.432 64 677.248 64 663.04V169.024c0-14.272 1.472-19.456 4.288-24.64a29.056 29.056 0 0 1 12.096-12.16C85.568 129.536 90.752 128 104.96 128h685.952c14.272 0 19.456 1.472 24.64 4.288a29.056 29.056 0 0 1 12.16 12.096c2.752 5.184 4.224 10.368 4.224 24.64z"></path><path fill="currentColor" d="M448 576a160 160 0 1 1 0-320 160 160 0 0 1 0 320m0-64a96 96 0 1 0 0-192 96 96 0 0 0 0 192"></path></svg>
            <p class="text-xl font-semibold truncate-text">{{ formatCurrency(account.balance) }}</p>
          </div>
          <template #footer>
            <div class="flex items-center justify-between">
              <p class="text-sm font-light">{{ account.type }}</p>
              <el-button class="w-6" @click="deleteAccount(account.id)">
                <svg class="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32zm448-64v-64H416v64zM224 896h576V256H224zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32m192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32"></path></svg>
              </el-button>
            </div>
          </template>
        </el-card>
      </div>

      <!-- "Create New Account" Card -->
      <div class="mt-5 max-w-80">
        <el-card @click="showCreateAccountModal = true" class="cursor-pointer">
          <div class="flex flex-row items-center justify-items-center space-x-2">
            <p class="text-lg">Create New Account</p>
            <svg class="w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path fill="currentColor" d="M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 0 1 0-64z"></path>
            </svg>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Create Account Modal -->
    <el-dialog
        v-model="showCreateAccountModal"
        title="Create New Account"
        width="30%"
        center
    >
      <el-form :model="newAccountForm" class="w-full">
        <el-form-item label="Account Name">
          <el-input v-model="newAccountForm.name" placeholder="Ex: My Account" />
        </el-form-item>
       <el-form-item label="Account Type">
          <el-radio-group v-model="newAccountForm.type">
            <el-radio label="Savings">Savings</el-radio>
            <el-radio label="Current">Current</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Initial Balance">
          <el-input-number v-model="newAccountForm.balance" :min="0">
            <template #prefix>
              <span>€</span>
            </template>
          </el-input-number>
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateAccountModal = false">Cancel</el-button>
          <el-button type="primary" @click="createAccount">Create</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import {
  ElDivider,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadio,
  ElRadioGroup,
  ElInputNumber,
  ElButton,
  ElMessageBox,
  ElMessage,
  ElIcon
} from "element-plus";
import { ref, onMounted } from "vue";

definePageMeta({
  middleware: 'auth'
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const userInfo = ref(null);
const accounts = ref([]);
const showCreateAccountModal = ref(false); // Modal state

// New account form data
const newAccountForm = ref({
  name: "",
  type: "savings",
  balance: 0
});

const getUser = async () => {
  if (!user.value) return;

  const { data, error } = await client
      .from("users")
      .select("*")
      .eq("id", user.value.id)
      .single();

  if (error) {
    console.error("Error fetching user:", error);
  } else {
    userInfo.value = data;
  }
};

const getAccounts = async () => {
  if (!user.value) return;

  const { data, error } = await client
      .from("accounts")
      .select("*")
      .eq("user", user.value.id);

  if (error) {
    console.error("Error fetching accounts:", error);
  } else {
    accounts.value = data;
  }
};

// Create new account function
const createAccount = async () => {
  const { name, type, balance } = newAccountForm.value;
  if (!name || balance < 0) return;

  const { error } = await client.from("accounts").insert([
    {
      user: user.value.id,
      name,
      type,
      balance
    }
  ]);

  if (error) {
    console.error("Error creating account:", error);
  } else {
    showCreateAccountModal.value = false;
    newAccountForm.value = { name: "", type: "savings", balance: 0 };
    getAccounts();
  }
};

const deleteAccount = async (accountId: string) => {
  console.log("Deleting account:", accountId);

  try {
    // Wait for the confirmation dialog to resolve (user clicks "confirm")
    await ElMessageBox.confirm(
        "Are you sure you want to delete this account?",
        "Warning",
        {
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          type: "warning",
        }
    );

    // Proceed to delete the account if confirmed
    const { error } = await client
        .from("accounts")
        .delete()
        .eq("id", accountId);

    if (error) {
      ElMessage({
        message: "Error deleting account.",
        type: "error",
      });
      console.error("Error deleting account:", error);
    } else {
      ElMessage({
        message: "Account was deleted successfully.",
        type: "success",
      });
      getAccounts(); // Refresh the accounts list
    }
  } catch (error) {
    // This block runs if the user cancels the confirmation
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



onMounted(() => {
  getUser();
  getAccounts();
});
</script>
<style>
.truncate-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
