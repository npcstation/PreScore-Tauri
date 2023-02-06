<script setup lang="ts">
import { NGrid, NGi, NStatistic, NIcon, NSpace, NSkeleton } from "naive-ui";
import { computed, watchEffect } from "vue";
import ChartLine from "@vicons/fa/ChartLine";
import { Paper } from "../utils/struct";

const props = defineProps({
  examType: {
    type: String,
    required: true,
  },
  paperList: {
    type: Array<Paper>,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

function getExamType(type: string) {
  switch (type) {
    case "terminalExam":
      return "期末考试";
    case "midtermExam":
      return "期中考试";
    case "monthlyExam":
      return "月考";
    case "weeklyExam":
      return "周测";
    case "unifiedExam":
      return "统考";
    default:
      return "未知类型";
  }
}

const userScore = computed(() => {
  console.log(props.paperList);
  return props.paperList.reduce((acc, paper) => {
    if (typeof paper.preAssignScore == "undefined") {
      return acc + paper.userScore;
    } else {
      return acc + paper.preAssignScore;
    }
  }, 0.0);
});
const fullScore = computed(() => {
  return props.paperList.reduce((acc, paper) => {
    return acc + paper.standardScore;
  }, 0.0);
});
const userAssignScore = computed(() => {
  return props.paperList.reduce((acc, paper) => {
    if (typeof paper.hasAssignScore == "undefined") {
      if (typeof paper.preAssignScore == "undefined") {
        return acc + paper.userScore;
      } else {
        return acc + paper.preAssignScore;
      }
    } else {
      if (paper.hasAssignScore) {
        return acc + paper.userScore;
      } else {
        return acc + paper.preAssignScore;
      }
    }
  }, 0.0);
});
const fullAssignScore = computed(() => {
  return props.paperList.reduce((acc, paper) => {
    if (typeof paper.hasAssignScore == "undefined") {
      return acc + paper.standardScore;
    } else {
      if (paper.hasAssignScore) {
        return acc + paper.assignStandardScore;
      } else {
        return acc + paper.standardScore;
      }
    }
  }, 0.0);
});

watchEffect(() => {
  console.log(props.paperList);
});
</script>

<template>
  <n-grid :cols="3">
    <n-gi>
      <n-space vertical>
        <n-skeleton
          v-if="loading"
          :width="128"
          :sharp="false"
          size="small"
          text
        />
        <n-skeleton v-if="loading" :width="256" :sharp="false" size="large" />
        <n-statistic label="类型" v-else>
          <template #default>
            <span class="exam-card-title terminal-exam">
              {{ getExamType(props.examType) }}
            </span>
          </template>
        </n-statistic>
      </n-space>
    </n-gi>
    <n-gi>
      <n-space vertical>
        <n-skeleton
          v-if="props.loading"
          :width="128"
          :sharp="false"
          size="small"
          text
        />
        <n-skeleton
          v-if="props.loading"
          :width="256"
          :sharp="false"
          size="large"
        />
        <n-statistic label="总分" :value="userScore" v-else>
          <template #prefix>
            <n-icon>
              <ChartLine />
            </n-icon>
          </template>
          <template #suffix> / {{ fullScore }} </template>
        </n-statistic>
      </n-space>
    </n-gi>
    <n-gi>
      <n-space vertical>
        <n-skeleton
          v-if="loading"
          :width="128"
          :sharp="false"
          size="small"
          text
        />
        <n-skeleton
          v-if="props.loading"
          :width="256"
          :sharp="false"
          size="large"
        />
        <n-statistic label="赋分总分" :value="userAssignScore" v-else>
          <template #prefix>
            <n-icon>
              <ChartLine />
            </n-icon>
          </template>
          <template #suffix> / {{ fullAssignScore }} </template>
        </n-statistic>
      </n-space>
    </n-gi>
  </n-grid>
</template>

<style scoped></style>
