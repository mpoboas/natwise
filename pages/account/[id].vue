<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElDialog, ElButton, ElCard } from 'element-plus';

const client = useSupabaseClient();
const account = ref(null);
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

    account.value = data;
}

const test = async () => {
    const { data } = await client
        .rpc('get_account_id_by_iban', { input_iban: 'PT503197403148062616' })
    console.log(data);


}
onMounted(() => {
    fetchAccount();
    test();
});
</script>

<template>
    <div v-if="account">
        <p> Conta : {{ account.name }} </p>
        <p> Balance: {{ account.balance }} </p>
        <p> IBAN: {{ account.iban }} </p>
    </div>
    <el-card>
        <div class="flex flex-row items-center justify-items-center space-x-2">
            <el-button class="text-lg" @click="openTransferModal"> Transfers</el-button>
        </div>
    </el-card>
    <!-- Transfer Modal -->
    <el-dialog :visible.sync="showModal" title="Create a Transfer" width="400px" @close="closeTransferModal">
        <template #default>
            <!-- Transfer Form -->
            <form @submit.prevent="submitTransfer">
                <div class="mb-4">
                    <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
                    <input type="number" id="amount" v-model="transferAmount" required
                        class="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div class="mb-4">
                    <label for="toAccount" class="block text-sm font-medium text-gray-700">To
                        Account</label>
                    <input type="text" id="toAccount" v-model="toAccount" required
                        class="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div class="flex justify-between">
                    <button type="submit"
                        class="bg-green-500 text-white p-2 rounded hover:bg-green-700 transition duration-300">
                        Confirm Transfer
                    </button>
                    <button type="button" @click="closeTransferModal"
                        class="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition duration-300">
                        Cancel
                    </button>
                </div>
            </form>
        </template>
    </el-dialog>
</template>