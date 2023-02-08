<script setup lang="ts">
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NGrid,
  NGridItem,
  NCarousel,
  NButton,
  NIcon,
  useMessage,
} from "naive-ui";
import HandPointUpRegular from "@vicons/fa/HandPointUpRegular";
import TiredRegular from "@vicons/fa/TiredRegular";
import { ref, computed, h } from "vue";
import { constants, publicEncrypt } from "crypto";
import { Buffer } from "buffer";
import _ from "lodash";
import { useRouter } from "vue-router";
import { HTTP } from "../utils/http";

var router = useRouter();

var model = ref({
  username: "",
  password: "",
});

var gridCols = ref(2);
var renderCarousel = ref(true);

window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) {
    gridCols.value = 1;
    renderCarousel.value = false;
  } else {
    gridCols.value = 2;
    renderCarousel.value = true;
  }
});

var usernameLengthStatus = computed(() => {
  if (model.value.username.length == 0) {
    return "error";
  } else {
    return "success";
  }
});

var passwordLengthStatus = computed(() => {
  if (model.value.password.length > 16) {
    return "error";
  } else if (model.value.password.length == 0) {
    return "error";
  } else {
    return "success";
  }
});

var usernameLengthFeedback = computed(() => {
  if (model.value.username.length == 0) {
    return "你账号呢？";
  } else {
    return "";
  }
});

var passwordLengthFeedback = computed(() => {
  if (model.value.password.length > 16) {
    return "你这密码太长了吧";
  } else if (model.value.password.length == 0) {
    return "你密码呢？";
  } else {
    return "";
  }
});

function encryptPassword(password: string) {
  const encrypter = {
    key: "-----BEGIN PUBLIC KEY-----\nMCwwDQYJKoZIhvcNAQEBBQADGwAwGAIRAIwUf3PCWTy6C9AH5gqJreUCAwEAAQ==\n-----END PUBLIC KEY-----",
    padding: constants.RSA_NO_PADDING,
  };
  const encrypted = publicEncrypt(
    encrypter,
    Buffer.from(password.split("").reverse().join(""))
  ).toString("hex");
  return encrypted;
}

const message = useMessage();

async function ssoLogin() {
  console.log(model.value);
  var encryptedPassword = encryptPassword(model.value.password);
  console.log(encryptedPassword);

  const changyanSSOUrl = "https://open.changyan.com/sso/login";
  var changyanSSOData = {
    sso_from: "zhixuesso",
    service: "https%3A%2F%2Fwww.zhixue.com:443%2Fssoservice.jsp",
    encode: "true",
    sourceappname: "tkyh,tkyh",
    _eventId: "submit",
    appid: "zx-container-client",
    client: "web",
    type: "loginByNormal",
    key: "auto",
    customLogoutUrl: "https%3A%2F%2Fwww.zhixue.com%2Flogin.html",
  };

  const preResponse = await HTTP.getText(changyanSSOUrl, {
    query: changyanSSOData,
  });
  console.log(preResponse);

  var preResponseText = preResponse.replaceAll("\\", "")
  preResponseText = preResponseText.replaceAll("'", "");
  preResponseText = preResponseText.replaceAll("(", "")
  preResponseText = preResponseText.replaceAll(")", "");
  console.log(preResponseText);
  var preResponseJson = JSON.parse(preResponseText);

  console.log(preResponseJson);

  if (preResponseJson.code != 1000) {
    if (preResponseJson.code == 1001) {
      return preResponseJson.data.st;
    } else {
      message.error(
        "登录失败，错误代码：Login" +
          preResponseJson.code +
          "\n附加信息：" +
          preResponseJson.data
      );
      return Promise.reject({ code: 2001, message: "登录失败" });
    }
  }

  changyanSSOData = _.extend(changyanSSOData, {
    username: model.value.username,
    password: encryptedPassword,
    lt: preResponseJson.data.lt,
    execution: preResponseJson.data.execution,
  });

  const response = await HTTP.getText(changyanSSOUrl, {
    query: changyanSSOData,
  });
  console.log(response);

  var responseText = String(response).trim();
  responseText = responseText.replaceAll("\\", "").replaceAll("'", "");
  responseText = responseText.replaceAll("(", "").replaceAll(")", "");
  var responseJson = JSON.parse(responseText);
  console.log(responseJson);

  if (responseJson.code != 1001) {
    message.error(() =>
      h("div", {}, [
        h("div", "登录失败，错误代码：Lo" + responseJson.code),
        h("div", "附加信息：" + responseJson.data),
      ])
    );
    return Promise.reject({ code: 2001, message: "登录失败" });
  }

  return responseJson.data.st;
}

async function getSessionFromSt(st: string): Promise<string> {
  const response = await HTTP.postText(
    "https://www.zhixue.com/ssoservice.jsp",
    {
      form: {
        action: "login",
        ticket: st,
      },
    }
  );
  console.log(response);

  const tlsysSessionId: string = await HTTP.getCookie(
    "www.zhixue.com",
    "/",
    "tlsysSessionId"
  );

  console.log(tlsysSessionId);
  return tlsysSessionId;
}

async function getXToken() {
  const responseJson = await HTTP.getJson(
    "https://www.zhixue.com/addon/error/book/index"
  );
  console.log(responseJson);
  const xToken = responseJson.result;

  console.log(xToken);
  return xToken;
}

async function getBasicInfo() {
  const responseJson = await HTTP.getJson(
    "https://www.zhixue.com/container/getCurrentUser"
  );
  console.log(responseJson);

  var id = responseJson.result.id;
  var loginName = responseJson.result.loginName;
  var name = responseJson.result.name;
  var role = responseJson.result.role;
  var avatar = "";
  if (
    responseJson.result.avatar != undefined ||
    responseJson.result.avatar != null ||
    responseJson.result.avatar != ""
  ) {
    avatar = responseJson.result.avatar;
  }

  return {
    id: id,
    loginName: loginName,
    name: name,
    role: role,
    avatar: avatar,
  };
}

async function telemetryLogin(username: string, sessionId: string) {
  const responseJson = await HTTP.postJson("https://matrix.bjbybbs.com/api/token", {
    form: {
      username: username,
      password: sessionId,
    },
  });
  console.log(responseJson);

  const telemetryToken = responseJson.access_token;

  console.log(telemetryToken);
  return telemetryToken;
}

async function proceedLogin() {
  try {
    var st = await ssoLogin();
  } catch {
    return Promise.reject();
  }

  var sessionId = await getSessionFromSt(st);
  var xToken = await getXToken();
  var basicInfo = await getBasicInfo();
  var telemetryToken = await telemetryLogin(basicInfo.id, sessionId);

  var username = model.value.username;
  localStorage.setItem("username", username);
  localStorage.setItem("sessionId", sessionId);
  localStorage.setItem("telemetryToken", telemetryToken);
  localStorage.setItem("xToken", xToken);

  localStorage.setItem("user_id", basicInfo.id);
  localStorage.setItem("user_loginName", basicInfo.loginName);
  localStorage.setItem("user_name", basicInfo.name);
  localStorage.setItem("user_role", basicInfo.role);
  localStorage.setItem("user_avatar", basicInfo.avatar);

  router.push("/dashboard");
}
</script>

<template>
  <h1>查分器登录</h1>
  <div id="loginMain">
    <n-grid x-gap="16" :cols="gridCols">
      <n-grid-item>
        <n-carousel
          id="carousel"
          autoplay
          direction="horizontal"
          dot-placement="bottom"
          :interval="10000"
          v-if="renderCarousel"
        >
          <div>
            <n-icon color="gray" size="128" class="margin-icon">
              <HandPointUpRegular />
            </n-icon>
            <p>
              对于智学网功能有一些强化（说不定是弱化）
              <br />
              给你一点小小的查分震撼
            </p>
          </div>
          <div>
            <n-icon color="gray" size="128" class="margin-icon">
              <TiredRegular />
            </n-icon>
            <p>不知道写什么了，反正只是占地方罢了</p>
          </div>
        </n-carousel>
      </n-grid-item>
      <n-grid-item>
        <div style="margin: auto 16px">
          <n-card>
            <p>账号密码和智学网一样！</p>
            <n-form ref="formRef" :model="model">
              <n-form-item
                path="username"
                label="账号"
                :validation-status="usernameLengthStatus"
                :feedback="usernameLengthFeedback"
              >
                <n-input
                  v-model:value="model.username"
                  placeholder=""
                  @keydown.enter.prevent
                />
              </n-form-item>
              <n-form-item
                path="password"
                label="密码"
                :validation-status="passwordLengthStatus"
                :feedback="passwordLengthFeedback"
              >
                <n-input
                  v-model:value="model.password"
                  type="password"
                  placeholder=""
                  @keydown.enter.prevent
                />
              </n-form-item>
            </n-form>
            <n-button
              tertiary
              type="primary"
              class="horizontal-center"
              @click="proceedLogin"
              :disabled="
                usernameLengthStatus == 'error' ||
                passwordLengthStatus == 'error'
              "
            >
              登录
            </n-button>
          </n-card>
        </div>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
#loginMain {
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  text-align: center;
  font-weight: 500;
}

p {
  text-align: center;
  font-weight: 400;
}

.n-card {
  max-width: 512px;
  margin: 0 auto;
}

#carousel p {
  text-align: center;
  font-size: 16px;
  font-weight: 400;
}

.margin-icon {
  margin: 16px auto;
  display: block !important;
}
</style>
