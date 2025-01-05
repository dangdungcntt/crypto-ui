<script setup lang="ts">
import CollapsibeButton                                                        from '@/components/CollapsibeButton.vue';
import Markdown                                                                from '@/components/Markdown.vue';
import {Button}                                                                from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle}                              from '@/components/ui/card';
import {Collapsible, CollapsibleContent, CollapsibleTrigger}                   from '@/components/ui/collapsible';
import {Input}                                                                 from '@/components/ui/input';
import {Label}                                                                 from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue}         from '@/components/ui/select';
import {Textarea}                                                              from '@/components/ui/textarea';
import type {ECItem}                                                           from '@/types.ts';
import {useLocalStorage}                                                       from '@vueuse/core';
import {CheckCircle2Icon, EraserIcon, Loader2Icon, RefreshCwIcon, XCircleIcon} from 'lucide-vue-next';
import {computed, onMounted, reactive, ref, watch}                             from 'vue';

const isLocal = import.meta.env.VITE_ENV == 'local';
const apiURL = isLocal ? 'http://localhost:8011' : 'https://crypto-api.nddapp.com';

const message = useLocalStorage('message', 'Hello ECDSA!');
const curves = useLocalStorage<ECItem[]>('curves', []);
const selectedCurveName = useLocalStorage<string>('selectedCurveName', '');
const selectedCurve = computed(() => curves.value.find(it => it.name == selectedCurveName.value));
const loading = reactive({
  curves            : false,
  generateKey       : false,
  calculatePublicKey: false,
  sign              : false,
  verify            : false,
});

const collapse = reactive({
  generateKey: false,
  sign       : false,
  verify     : false,
});

const ecdsaPrivateKey = useLocalStorage('privateKey', {
  __trace  : '',
  d        : '',
  publicKey: {
    q: {
      x: '',
      y: '',
    },
  },
});

const signature = ref({
  __trace: '',
  r      : '',
  s      : '',
});

const verifyStatus = ref({
  __trace: '',
  isValid: false,
});

onMounted(() => {
  if (!curves.value.length) {
    return fetchCurves();
  }
});

watch(selectedCurve, () => {
  clearPrivateKey();
});

function clearPrivateKey() {
  ecdsaPrivateKey.value = {
    __trace  : '',
    d        : '',
    publicKey: {
      q: {
        x: '',
        y: '',
      },
    },
  };
  clearSignature();
}

function clearSignature() {
  signature.value = {
    __trace: '',
    r      : '',
    s      : '',
  };
  clearVerifyStatus();
}

function clearVerifyStatus() {
  verifyStatus.value = {
    __trace: '',
    isValid: false,
  };
}

async function fetchCurves() {
  try {
    loading.curves = true;
    const response = await fetch(`${apiURL}/v1/ecdsa/curves`);
    const {data} = await response.json();
    curves.value = data;
  } catch (error) {
    console.error('Error fetching curves:', error);
  } finally {
    loading.curves = false;
  }
}

const generatePrivateKey = async () => {
  try {
    loading.generateKey = true;
    const response = await fetch(`${apiURL}/v1/ecdsa/generate-private-key`, {
      method: 'POST',
      body  : JSON.stringify(selectedCurve.value?.params),
    });
    const {data} = await response.json();
    ecdsaPrivateKey.value = data;
    clearSignature();
  } catch (error) {
    console.error('Error generating private key:', error);
  } finally {
    loading.generateKey = false;
  }
};

const calculatePublicKey = async () => {
  try {
    loading.calculatePublicKey = true;
    const response = await fetch(`${apiURL}/v1/ecdsa/calculate-public-key`, {
      method: 'POST',
      body  : JSON.stringify({
        ...selectedCurve.value?.params,
        privateKey: {
          d: ecdsaPrivateKey.value.d,
        },
      }),
    });
    const {data} = await response.json();
    ecdsaPrivateKey.value.publicKey = data.publicKey;
    clearVerifyStatus();
  } catch (error) {
    console.error('Error calculate public key:', error);
  } finally {
    loading.calculatePublicKey = false;
  }
};

const sign = async () => {
  try {
    loading.sign = true;
    const response = await fetch(`${apiURL}/v1/ecdsa/sign`, {
      method: 'POST',
      body  : JSON.stringify({
        ...selectedCurve.value?.params,
        privateKey: {
          d: ecdsaPrivateKey.value.d,
        },
        message   : message.value,
      }),
    });
    const {data} = await response.json();
    signature.value = data;
    clearVerifyStatus();
  } catch (error) {
    console.error('Error sign:', error);
  } finally {
    loading.sign = false;
  }
};

const verify = async () => {
  try {
    loading.verify = true;
    const response = await fetch(`${apiURL}/v1/ecdsa/verify`, {
      method: 'POST',
      body  : JSON.stringify({
        ...selectedCurve.value?.params,
        publicKey: ecdsaPrivateKey.value.publicKey,
        sig      : signature.value,
        message  : message.value,
      }),
    });
    const {data} = await response.json();
    verifyStatus.value = data;
  } catch (error) {
    console.error('Error verifying signature:', error);
  } finally {
    loading.verify = false;
  }
};
</script>
<template>
  <div class="min-h-screen bg-background p-8">
    <Card class="max-w-6xl mx-auto">
      <CardHeader class="flex-row justify-between">
        <div></div>
        <CardTitle class="text-3xl font-bold text-center">ECDSA Signature Demo</CardTitle>
        <Button size="sm" variant="outline" @click="fetchCurves">
          <RefreshCwIcon class="h-4 w-4"/>
        </Button>
      </CardHeader>

      <CardContent class="grid grid-cols-1 gap-6">
        <div v-if="loading.curves" class="flex items-center justify-center">
          <Loader2Icon class="mr-2 h-4 w-4 animate-spin"/>
          Đang tải...
        </div>
        <div v-else class="space-y-2">
          <Label for="curve">Elliptic Curve</Label>
          <Select v-model="selectedCurveName">
            <SelectTrigger id="curve">
              <SelectValue placeholder="Select EC"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="curve in curves" :key="curve.name" :value="curve.name">
                {{ curve.name }} - {{ curve.bits }} bits
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <template v-if="selectedCurve">
          <div class="space-y-2">
            <Label>Parameters</Label>
            <Markdown :content="selectedCurve.__trace"/>
          </div>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Private Key

            </h3>
            <div class="space-y-2">
              <Label for="key-x">d</Label>
              <Input
                id="key-x"
                v-model="ecdsaPrivateKey.d"
                :disabled="loading.generateKey || loading.calculatePublicKey || loading.sign"
              />
            </div>

            <h3 class="text-lg font-semibold flex gap-2">Public Key - Q(x, y) = d * G
              <Button v-if="ecdsaPrivateKey.d" @click="calculatePublicKey" variant="outline" size="sm" :disabled="loading.calculatePublicKey">
                <Loader2Icon v-if="loading.calculatePublicKey" class="size-4 animate-spin"/>
                Calculate
              </Button>
            </h3>
            <div class="space-y-2">
              <div class="space-y-2">
                <Label for="key-x">Q<sub>x</sub></Label>
                <Input
                  id="key-x"
                  v-model="ecdsaPrivateKey.publicKey.q.x"
                  :disabled="loading.generateKey || loading.calculatePublicKey || loading.verify"
                />
              </div>
              <div class="space-y-2">
                <Label for="key-y">Q<sub>y</sub></Label>
                <Input
                  id="key-y"
                  v-model="ecdsaPrivateKey.publicKey.q.y"
                  :disabled="loading.generateKey || loading.calculatePublicKey || loading.verify"
                />
              </div>
            </div>

            <Collapsible v-model:open="collapse.generateKey" class="space-y-2">
              <div class="flex justify-between">
                <div class="flex space-x-2">
                  <Button @click="generatePrivateKey" variant="default" :disabled="loading.generateKey">
                    <Loader2Icon v-if="loading.generateKey" class="size-4 animate-spin"/>
                    Generate Key
                  </Button>
                  <Button v-if="ecdsaPrivateKey.d" variant="outline" @click="clearPrivateKey">
                    <EraserIcon/>
                    Clear
                  </Button>
                </div>
                <CollapsibleTrigger v-if="ecdsaPrivateKey.__trace" as-child>
                  <CollapsibeButton :is-collapsed="collapse.generateKey"/>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent v-if="ecdsaPrivateKey.__trace">
                <Markdown :content="ecdsaPrivateKey.__trace"/>
              </CollapsibleContent>
            </Collapsible>

            <div class="space-y-2">
              <h3 class="text-lg font-semibold">Signature</h3>
              <div class="space-y-2">
                <Label for="message">Message:</Label>
                <Textarea
                  id="message"
                  v-model="message"
                  rows="3"
                  :disabled="loading.sign || loading.verify"
                  placeholder="Enter your message here..."
                />
              </div>

              <Collapsible v-model:open="collapse.sign" class="space-y-2">
                <div class="flex justify-between">
                  <div class="flex space-x-2">
                    <Button @click="sign" variant="default" :disabled="loading.sign || !ecdsaPrivateKey.d || !message">
                      <Loader2Icon v-if="loading.sign" class="size-4 animate-spin"/>
                      Sign
                    </Button>
                    <Button v-if="signature.r || signature.s" variant="outline" @click="clearSignature">
                      <EraserIcon/>
                      Clear
                    </Button>
                  </div>
                  <CollapsibleTrigger v-if="signature.__trace" as-child>
                    <CollapsibeButton :is-collapsed="collapse.sign"/>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent v-if="signature.__trace">
                  <Markdown :content="signature.__trace"/>
                </CollapsibleContent>
              </Collapsible>

              <div class="space-y-2">
                <div class="space-y-2">
                  <Label for="sig-r">R:</Label>
                  <Input
                    id="sig-r"
                    v-model="signature.r"
                    :disabled="loading.sign || loading.verify"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="sig-s">S:</Label>
                  <Input
                    id="sig-s"
                    v-model="signature.s"
                    :disabled="loading.sign || loading.verify"
                  />
                </div>
              </div>

              <Collapsible v-model:open="collapse.verify" class="space-y-2">
                <div class="flex justify-between">
                  <div class="flex space-x-2 items-center">
                    <Button @click="verify" variant="default"
                            :disabled="loading.verify || !ecdsaPrivateKey.publicKey.q.x || !ecdsaPrivateKey.publicKey.q.x || !signature.r || !signature.s || !message">
                      Verify
                    </Button>
                    <template v-if="verifyStatus.__trace">
                      <div v-if="verifyStatus.isValid" class="text-green-500 flex">
                        <CheckCircle2Icon class="mr-2"/>
                        Valid signature
                      </div>
                      <div v-else class="text-red-600 flex">
                        <XCircleIcon class="mr-2"/>
                        Invalid signature
                      </div>
                    </template>
                  </div>
                  <CollapsibleTrigger v-if="verifyStatus.__trace" as-child>
                    <CollapsibeButton :is-collapsed="collapse.verify"/>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent v-if="verifyStatus.__trace">
                  <Markdown :content="verifyStatus.__trace"/>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
