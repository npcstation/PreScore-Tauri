<script setup lang="ts">
import { NButton, useMessage } from "naive-ui";
import { h } from "vue";

// Dashboard, for future use.

console.log(localStorage);

var message = useMessage();

function click() {
  message.info(
    () => h("div", {}, [h("div", {}, "Hello"), h("div", {}, "World")]),
    { duration: 10000000 }
  );
}
</script>

<template>
  <n-button @click="click">Dashboard</n-button>
</template>

<style scoped></style>
