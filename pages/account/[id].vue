<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const client = useSupabaseClient();
const account = ref(null);
const route = useRoute();

const fetchAccount = async () => {
    const {id} = route.params;
    const {data} = await client
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();
        
        account.value = data;
}

onMounted(() => {
    //console.log("ola");
    fetchAccount();
    //console.log("Conta: ", account.value.name);
});
</script>

<template>
    <div v-if="account">
        <p> Conta : {{ account.name }}
        </p>
        <p>
            Balance: {{ account.balance }}
        </p>
        <div>
            <el-card>
                <RouterLink to="/transfer">
                    <div class="flex flex-row items-center justify-items-center space-x-2">
                        <p class="text-lg"> Transfers</p>
                    </div>
                </RouterLink>
                <RouterLink to="/transaction">
                    <div class="flex flex-row items-center justify-items-center space-x-2">
                        <p class="text-lg"> Transaction</p>
                    </div>
                </RouterLink>
                <RouterLink to="/history">
                    <div class="flex flex-row items-center justify-items-center space-x-2">
                        <p class="text-lg"> History</p>
                    </div>
                </RouterLink>
            </el-card>
        </div>
    </div>
</template>