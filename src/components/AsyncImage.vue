<script setup lang="ts">
import { c, NImage } from "naive-ui";
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";

const props = defineProps([
  "src",
  "placeholder",
]);

// fetch image from props url
const placeholder = ref(props.placeholder);
const image = ref(placeholder.value);
try {
  const response: Array<number> = await invoke("http_get_binary", {
    url: props.src,
  });
  const response_u8 = new Uint8Array(response);
  console.log(response);
  let blob = new Blob([response_u8], { type: "image/jpeg" });
  let fileURL = URL.createObjectURL(blob);
  image.value = fileURL;
} catch (err) {
  console.log(err);
  image.value = placeholder.value;
}
</script>

<template>
  <img
    :src="image"
  />
</template>

<style scoped></style>
