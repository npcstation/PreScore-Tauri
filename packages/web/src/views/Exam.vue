<script setup lang="ts">
import {
  NPageHeader,
  useMessage,
  NCard,
  NStatistic,
  NH2,
  NDivider,
  NSpace,
  NText,
  NGrid,
  NGridItem,
  NInputNumber,
  NP,
} from "naive-ui";
import { computed, h, Ref, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { HTTP } from "../utils/http";
import { Diagnosis, Paper } from "../utils/struct";
import ExamHeader from "../components/ExamHeader.vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, RadarChart } from "echarts/charts";
import {
  GridComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { round } from "lodash";

use([
  CanvasRenderer,
  BarChart,
  RadarChart,
  GridComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
]);

var router = useRouter();
const message = useMessage();

const props = defineProps(["examId"]);

function handleBack() {
  router.back();
}

const loading = ref(true);

const classCount = ref(45);
if (localStorage.getItem("classCount")) {
  classCount.value = parseInt(localStorage.getItem("classCount") || "45");
}

watchEffect(() => {
  localStorage.setItem("classCount", classCount.value.toString());
});

const examType = ref("");
const processedPaperList: Ref<Paper[]> = ref([]);
async function fetchExamData(examId: string) {
  const response = await HTTP.getJson(
    "https://www.zhixue.com/zhixuebao/report/exam/getReportMain",
    {
      query: { examId },
      headersMap: { xToken: localStorage.getItem("xToken") || "" },
    }
  );

  if (response.errorCode != 0) {
    message.error(() =>
      h("div", {}, [
        h("div", "数据获取失败，错误代码：Ex" + response.errorCode),
        h("div", "附加信息：" + response.errorInfo),
        h("div", "退出再试一次说不定就可以了……"),
      ])
    );
    return Promise.reject({ code: 3001, message: "考试数据获取失败" });
  }
  console.log(response);

  examType.value = response.result.examTypeCode;
  const paperList: Paper[] = response.result.paperList;
  paperList.forEach(async (paper) => {
    var tempPaper = paper;
    if (typeof paper.userScore == "undefined") {
      const tempResponse = await HTTP.getJson(
        "https://www.zhixue.com/zhixuebao/report/checksheet",
        {
          query: { examId: examId, paperId: paper.paperId },
          headersMap: { xToken: localStorage.getItem("xToken") || "" },
        }
      );
      if (tempResponse.errorCode != 0) {
        message.error(() =>
          h("div", {}, [
            h("div", "数据获取失败，错误代码：Ex" + tempResponse.errorCode),
            h("div", "附加信息：" + tempResponse.errorInfo),
            h("div", "退出再试一次说不定就可以了……"),
          ])
        );
        return Promise.reject({ code: 3001, message: "考试数据获取失败" });
      }
      tempPaper.preAssignScore = tempResponse.result.score;
      tempPaper.userScore = tempResponse.result.score;
      tempPaper.hasAssignScore = false;
      tempPaper.standardScore = tempResponse.result.standardScore;

      processedPaperList.value.push(tempPaper);
    } else {
      if (typeof paper.preAssignScore == "undefined") {
        paper.preAssignScore = paper.userScore;
      }

      processedPaperList.value.push(paper);
    }
  });
  loading.value = false;
}

const diagList: Ref<Diagnosis[]> = ref([]);
const hasDiag = ref(false);
async function fetchExamDiagnosis(examId: string) {
  const response = await HTTP.getJson(
    "https://www.zhixue.com/zhixuebao/report/exam/getSubjectDiagnosis",
    {
      query: { examId },
      headersMap: { xToken: localStorage.getItem("xToken") || "" },
    }
  );

  if (response.errorCode == 0) {
    diagList.value = response.result.list;
    hasDiag.value = true;
  } else {
    hasDiag.value = false;
  }
  console.log(response);
}

const radarOption = computed(() => {
  if (!hasDiag.value) {
    return {};
  }
  return {
    title: {
      text: "雷达图",
    },

    radar: {
      indicator: diagList.value.map((diag) => {
        return {
          name: diag.subjectName,
          max: 100,
        };
      }),
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: diagList.value.map((diag) => {
              return diag.myRank;
            }),
          },
        ],
      },
    ],
  };
});

const barOption = computed(() => {
  if (!hasDiag.value) {
    return {};
  }
  return {
    title: {
      text: "预测班排",
    },
    dataset: [
      {
        dimensions: ["subject", "rank"],
        source: diagList.value.map((diag) => {
          return [
            diag.subjectName,
            round((diag.myRank / 100) * classCount.value),
          ];
        }),
      },
      {
        transform: {
          type: "sort",
          config: { dimension: "rank", order: "asc" },
        },
      },
    ],
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "bar",
        encode: { x: "subject", y: "rank" },
        datasetIndex: 1,
        label: {
          show: true,
          position: "top",
        },
      },
    ],
  };
});

fetchExamData(props.examId);
fetchExamDiagnosis(props.examId);
</script>

<template>
  <div class="container" ref="dcontainer">
    <n-page-header subtitle="加油，下次会考的更好！" @back="handleBack">
      <Suspense>
        <ExamHeader
          :loading="loading"
          :paper-list="processedPaperList"
          :exam-type="examType"
        ></ExamHeader>
      </Suspense>
      <template #title> 考试详情 </template>
    </n-page-header>
    <n-divider> 各科情况 </n-divider>
    <n-grid :cols="hasDiag ? 10 : 6" :x-gap="16" item-responsive>
      <n-grid-item span="10 800:4" v-if="hasDiag">
        <n-space vertical :size="[8, 16]" style="margin-bottom: 16px">
          <n-card>
            <n-space vertical :size="[8, 16]">
              <n-space justify="center" align="center">
                <n-p>班级人数：</n-p>
                <n-input-number
                  v-model:value="classCount"
                  button-placement="both"
                  placeholder="班级人数？"
                  :min="1"
                />
              </n-space>
              <v-chart class="chart" :option="barOption" autoresize />
            </n-space>
          </n-card>
          <n-card>
            <v-chart class="chart" :option="radarOption" autoresize />
          </n-card>
        </n-space>
      </n-grid-item>
      <n-grid-item span="10 800:6">
        <n-space vertical :size="[8, 16]">
          <div v-for="item in processedPaperList">
            <n-card>
              <n-h2>
                <n-text
                  >[ {{ item.subjectCode }} ] {{ item.subjectName }}
                </n-text>
              </n-h2>
              <n-grid :cols="3">
                <n-grid-item>
                  <n-statistic label="得分" :value="item.preAssignScore">
                    <template #suffix> / {{ item.standardScore }} </template>
                  </n-statistic>
                </n-grid-item>
                <n-grid-item>
                  <n-statistic
                    label="赋分总分"
                    :value="item.userScore"
                    v-if="item.hasAssignScore"
                  >
                    <template #suffix>
                      / {{ item.assignStandardScore }}
                    </template>
                  </n-statistic>
                </n-grid-item>
                <n-grid-item>
                  <n-statistic
                    label="预测班排"
                    v-if="
                      typeof diagList.find(
                        (el) => el.subjectCode == item.subjectCode
                      ) != 'undefined'
                    "
                    :value="round(diagList.find((el) => el.subjectCode == item.subjectCode)?.myRank! / 100 * classCount)"
                  >
                    <template #suffix> / {{ 41 }} </template>
                  </n-statistic>
                </n-grid-item>
              </n-grid>
            </n-card>
          </div>
        </n-space>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.container {
  margin: 0;
  justify-content: center;
  align-items: center;
}

.chart {
  height: 300px;
}
</style>
