<template>
  <div>
    <form @submit.prevent="createAccount">
      <el-input v-model="account.accountName" placeholder="Account Name" />
      <el-input v-model="account.balance" type="number" placeholder="Balance" />
      <el-input v-model="account.openDate" type="date" placeholder="Open Date" />
      <el-select v-model="account.type" placeholder="Select Account Type">
        <el-option label="Savings" value="savings" />
        <el-option label="Checking" value="checking" />
      </el-select>
      <el-select v-model="account.status" placeholder="Select Status">
        <el-option label="Active" value="active" />
        <el-option label="Inactive" value="inactive" />
      </el-select>
      <el-button type="primary" native-type="submit">Create Account</el-button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import {ElButton, ElInput, ElMessage, ElText} from 'element-plus';
const useRouter = useRouter();
const user = useSupabaseUser()
const { auth } = useSupabaseClient()

import axios from "axios";

export default {
  data() {
    return {
      account: {
        accountName: '',
        user: null,
        balance: null,
        type: 'savings',
        openDate: '',
        status: 'active',
      },
      message: '',
    };
  },
  setup() {
    const router = useRouter(); // Definir o router

    return { router };
  },
  methods: {
    async createAccount() {
      try {
        this.message = 'Account created successfully!';
        //this.router.push('/createAccount'); // Usando o Vue Router para navegar
        this.resetForm();
      } catch (error) {
        console.error(error);
        this.message = 'Error creating account.';
      }
    },
    resetForm() {
      this.account = {
        accountName: '',
        user: null,
        balance: null,
        type: 'savings',
        openDate: '',
        status: 'active',
      };
    },
  },
};
</script>

<style scoped>
/* Estilo simples para o formulário */
form div {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: bold;
}

input, select, button {
  margin-top: 0.5rem;
}
</style>