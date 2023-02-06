<script setup lang="ts">
import {
  NCard,
  NText,
  NH2,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NP,
} from "naive-ui";
import { ref, Ref } from "vue";
// import { useInfiniteScroll } from "@vueuse/core";
import { defineAsyncComponent } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { Exam } from "../utils/struct";
import { DateTime } from "luxon";
import { useRouter } from "vue-router";
import { HTTP } from "../utils/http";

var router = useRouter();

const AsyncImage = defineAsyncComponent(
  () => import("../components/AsyncImage.vue")
);

const data: Ref<Exam[]> = ref([]);
const avatarSrc = localStorage.getItem("user_avatar") || "";
const name = localStorage.getItem("user_name") || "";
const loginName = localStorage.getItem("user_loginName") || "";

async function fetchExamList(pageIndex: number) {
  const responseJson = await HTTP.getJson(
    "https://www.zhixue.com/zhixuebao/report/exam/getUserExamList",
    {
      headersMap: {
        xtoken: localStorage.getItem("xToken") || "",
      },
      query: {
        pageIndex: pageIndex,
      },
    }
  );
  return responseJson;
}

async function fetchAllExam() {
  var examList: Exam[] = [];
  var currentPage = 1;
  var result = await fetchExamList(currentPage);
  var currList = result.result.examList;
  var hasNextPage: boolean = result.result.hasNextPage;
  currList.forEach((element: Exam) => {
    examList.push(element);
  });
  currentPage += 1;
  while (currList.length == 10 && hasNextPage) {
    result = await fetchExamList(currentPage);
    currList = result.result.examList;
    hasNextPage = result.result.hasNextPage;

    currList.forEach((element: Exam) => {
      examList.push(element);
    });
    currentPage += 1;
  }

  return examList;
}

fetchAllExam().then((response) => {
  data.value = response;
});

function transformExamTypeClass(type: string) {
  switch (type) {
    case "terminalExam":
      return "terminal-exam";
    case "midtermExam":
      return "midterm-exam";
    case "monthlyExam":
      return "monthly-exam";
    case "weeklyExam":
      return "weekly-exam";
    case "unifiedExam":
      return "unified-exam";
    default:
      return "unknown-exam";
  }
}

function getExamTypeClass(type: string) {
  return ["exam-card-title", transformExamTypeClass(type)];
}

function onCardClick(selected: string) {
  console.log(selected);
  router.push("/exam/" + selected);
}

// useInfiniteScroll(
//   window,
//   () => {
//     // load more
//     if (data.value.length < 15) {
//       data.value.push(...[1, 3, 5, 1, 1]);
//     }
//   },
//   { distance: 10 }
// );
</script>

<template>
  <div class="container" ref="dcontainer">
    <n-layout has-sider>
      <n-layout-sider content-style="padding: 24px;">
        <n-card class="affix">
          <Suspense>
            <async-image
              class="avatar"
              :src="avatarSrc"
              placeholder="/src/assets/akarin.webp"
            />
          </Suspense>
          <n-h2>
            <n-text>
              {{ name }}
            </n-text>
          </n-h2>
          <n-p>
            {{ loginName }}
          </n-p>
        </n-card>
      </n-layout-sider>
      <n-layout>
        <n-layout-content
          content-style="padding: 24px;"
          :native-scrollbar="false"
        >
          <div class="cards">
            <div v-for="item in data">
              <n-card @click="onCardClick(item.examId)">
                <n-h2 :class="getExamTypeClass(item.examType)">
                  <n-text>
                    {{ item.examName }}
                  </n-text>
                </n-h2>
                <n-p>考试ID：{{ item.examId }}</n-p>
                <n-p
                  >创建时间：{{
                    DateTime.fromMillis(item.examCreateDateTime).toFormat(
                      "yyyy-MM-dd"
                    )
                  }}</n-p
                >
              </n-card>
            </div>
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>
</template>

<style scoped>
.container {
  margin: 0;
  justify-content: center;
  align-items: center;
}

.cards {
  display: grid;
  flex-wrap: wrap;
  gap: 24px;
}

.affix {
  position: sticky;
  position: -webkit-sticky;
  justify-content: center;
  align-items: center;
  top: 12px;
}

.avatar {
  border-radius: 50%;
  max-width: 100%;
}

.affix .n-h2,
.affix .n-p {
  margin: 0;
  padding: 0;
}

.container .n-layout-sider,
.container .n-layout,
.container .n-scrollbar,
.container .n-scrollbar-container,
.container .n-scrollbar-content,
.container .n-layout-sider-scroll-container,
.container .n-layout-scroll-container {
  overflow: clip !important;
}

.container .n-layout-sider {
  --n-color: unset !important;
}
</style>
