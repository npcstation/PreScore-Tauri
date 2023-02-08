<script setup lang="ts">
import { ref } from "vue";
import { HTTP } from "../utils/http";

const props = defineProps([
  "src",
  "placeholder",
]);

// fetch image from props url
const placeholder = ref(props.placeholder);
const image = ref(placeholder.value);
try {
  const fileURL = await HTTP.getBlob(props.src, "image/jpeg");
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
