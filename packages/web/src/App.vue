<script setup lang="ts">
import { ref } from "vue";
import {
  lightTheme,
  darkTheme,
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
  NDialogProvider,
  NIcon,
  NButton,
  NLayout,
  NLayoutContent,
  NLayoutFooter,
} from "naive-ui";
import SunRegular from "@vicons/fa/SunRegular";
import MoonRegular from "@vicons/fa/MoonRegular";

var theme = ref(lightTheme);
var isLight = ref(true);
var themeIndicator = ref("暗黑");
if (localStorage.getItem("theme") === "dark") {
  theme.value = darkTheme;
  isLight.value = false;
  themeIndicator.value = "明亮";
}

function toggleTheme() {
  if (isLight.value) {
    theme.value = darkTheme;
    isLight.value = false;
    themeIndicator.value = "明亮";
    localStorage.setItem("theme", "dark");
  } else {
    theme.value = lightTheme;
    isLight.value = true;
    themeIndicator.value = "暗黑";
    localStorage.setItem("theme", "light");
  }
}
</script>

<template>
  <n-config-provider :theme="theme">
    <n-dialog-provider>
      <n-message-provider>
        <n-layout>
          <n-layout-content>
            <router-view />
          </n-layout-content>
          <n-layout-footer>
            <div class="horizontal-center footer-words">
              <p class="inline">© 2023 GoForceX.</p>
              <p class="inline" style="margin: 0 8px">|</p>
              <n-button text @click="toggleTheme">
                <template #icon>
                  <n-icon v-if="!isLight">
                    <sun-regular />
                  </n-icon>
                  <n-icon v-if="isLight">
                    <moon-regular />
                  </n-icon>
                </template>
                切换{{ themeIndicator }}主题
              </n-button>
            </div>
          </n-layout-footer>
        </n-layout>
      </n-message-provider>
    </n-dialog-provider>
    <n-global-style />
  </n-config-provider>
</template>

<style scoped>
.inline {
  display: inline;
}

.footer-words {
  display: flex !important;
  justify-content: center;
  align-items: center;
}

.n-layout-footer {
  background: rgba(128, 128, 128, 0.2);
  padding: 24px;
}

.n-layout-content {
  padding: 16px;
}

.n-layout-sider,
.n-layout,
.n-scrollbar,
.n-scrollbar-container,
.n-scrollbar-content,
.n-layout-sider-scroll-container,
.n-layout-scroll-container {
  overflow: clip !important;
  overflow-x: clip !important;
}
</style>
