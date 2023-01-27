<script setup lang="ts">
import { ref } from "vue";
import {
  lightTheme,
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
} from "naive-ui";

var theme = ref(lightTheme);
</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <router-view />
    </n-message-provider>
    <n-global-style />
  </n-config-provider>
</template>

<style scoped></style>
