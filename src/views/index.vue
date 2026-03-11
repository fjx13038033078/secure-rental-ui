<template>
  <div class="app-container home">
    <!-- 主标题区域 -->
    <div class="hero-section animate__animated animate__fadeInDown">
      <h1 class="main-title">
        <span class="title-line">基于用户身份验证与数据安全存储的</span>
        <span class="title-line accent">汽车租赁系统</span>
      </h1>
      <p class="subtitle animate__animated animate__fadeIn animate__delay-1s">安全可靠 · 便捷高效 · 专业服务</p>
    </div>

    <!-- 快捷导航 -->
    <div class="section-title animate__animated animate__fadeIn">
      <el-icon><Aim /></el-icon>
      <span>快捷导航</span>
    </div>
    <el-row :gutter="20" class="nav-cards">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card
          class="nav-card animate__animated animate__fadeInUp"
          shadow="hover"
          :body-style="{ padding: '24px' }"
          @click="goTo('/rental/customer')"
        >
          <div class="nav-card-content">
            <div class="nav-icon customer">
              <el-icon :size="36"><User /></el-icon>
            </div>
            <h3>客户管理</h3>
            <p>管理客户信息，支持增删改查与数据脱敏</p>
            <el-button type="primary" link>进入管理 →</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card
          class="nav-card animate__animated animate__fadeInUp animate__delay-1"
          shadow="hover"
          :body-style="{ padding: '24px' }"
          @click="goTo('/rental/car')"
        >
          <div class="nav-card-content">
            <div class="nav-icon car">
              <el-icon :size="36"><Van /></el-icon>
            </div>
            <h3>车辆管理</h3>
            <p>车辆信息与图文管理，支持 OSS 图片上传</p>
            <el-button type="primary" link>进入管理 →</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card
          class="nav-card animate__animated animate__fadeInUp animate__delay-2"
          shadow="hover"
          :body-style="{ padding: '24px' }"
          @click="goTo('/rental/order')"
        >
          <div class="nav-card-content">
            <div class="nav-icon order">
              <el-icon :size="36"><Document /></el-icon>
            </div>
            <h3>租赁订单</h3>
            <p>租车与还车流程，订单状态机管理</p>
            <el-button type="primary" link>进入管理 →</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <!-- 通知公告 -->
      <el-col :xs="24" :lg="12">
        <div class="section-title animate__animated animate__fadeIn">
          <el-icon><Bell /></el-icon>
          <span>最新通知公告</span>
        </div>
        <el-card class="notice-card animate__animated animate__fadeInLeft" shadow="hover">
          <div v-loading="noticeLoading" class="notice-list">
            <template v-if="noticeList.length > 0">
              <div
                v-for="(item, index) in noticeList"
                :key="item.noticeId"
                class="notice-item animate__animated animate__fadeIn"
                :style="{ animationDelay: `${index * 0.1}s` }"
                @click="viewNotice(item)"
              >
                <div class="notice-header">
                  <el-tag v-if="item.noticeType === '1'" type="warning" size="small">通知</el-tag>
                  <el-tag v-else type="info" size="small">公告</el-tag>
                  <span class="notice-title">{{ item.noticeTitle }}</span>
                </div>
                <div class="notice-meta">
                  <span>{{ item.createByName }}</span>
                  <span>{{ formatTime(item.createTime) }}</span>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无通知公告" :image-size="80" />
          </div>
        </el-card>
      </el-col>

      <!-- 系统功能说明 -->
      <el-col :xs="24" :lg="12">
        <div class="section-title animate__animated animate__fadeIn">
          <el-icon><Setting /></el-icon>
          <span>系统主要功能</span>
        </div>
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12">
            <el-card class="feature-card animate__animated animate__fadeInRight" shadow="hover">
              <div class="feature-icon auth">
                <el-icon :size="28"><Lock /></el-icon>
              </div>
              <h4>身份验证与会话安全</h4>
              <p>密码加盐哈希、防暴击验证码、JWT 令牌、会话管理、离线 IP 城市解析</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-card class="feature-card animate__animated animate__fadeInRight animate__delay-1" shadow="hover">
              <div class="feature-icon encrypt">
                <el-icon :size="28"><Key /></el-icon>
              </div>
              <h4>数据安全存储与隐私</h4>
              <p>AES-256-GCM 透明加密、密钥管理、多维数据脱敏（手机、身份证）</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-card class="feature-card animate__animated animate__fadeInRight animate__delay-2" shadow="hover">
              <div class="feature-icon rbac">
                <el-icon :size="28"><CircleCheckFilled /></el-icon>
              </div>
              <h4>系统级安全与防灾</h4>
              <p>RBAC 细粒度访问控制、操作审计、防 SQL 注入</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-card class="feature-card animate__animated animate__fadeInRight animate__delay-3" shadow="hover">
              <div class="feature-icon business">
                <el-icon :size="28"><Operation /></el-icon>
              </div>
              <h4>汽车租赁业务流转</h4>
              <p>客户管理、车辆图文管理（OSS）、租赁订单状态机（租车/还车）</p>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- 公告详情弹窗 -->
    <el-dialog v-model="noticeDialog.visible" :title="noticeDialog.title" width="600px" append-to-body>
      <div v-if="noticeDialog.content" class="notice-detail-content" v-html="noticeDialog.content"></div>
    </el-dialog>
  </div>
</template>

<script setup name="Index" lang="ts">
import { listNotice } from '@/api/system/notice';
import type { NoticeVO } from '@/api/system/notice/types';
import { parseTime } from '@/utils/ruoyi';
import { User, Van, Document, Bell, Setting, Lock, Key, CircleCheckFilled, Operation, Aim } from '@element-plus/icons-vue';
import 'animate.css';

const router = useRouter();

// 通知公告
const noticeList = ref<NoticeVO[]>([]);
const noticeLoading = ref(false);
const noticeDialog = reactive({
  visible: false,
  title: '',
  content: ''
});

const loadNotices = async () => {
  noticeLoading.value = true;
  try {
    const res = await listNotice({
      pageNum: 1,
      pageSize: 5,
      status: '0',
      noticeTitle: '',
      createByName: '',
      noticeType: ''
    });
    noticeList.value = res.rows || [];
  } catch {
    noticeList.value = [];
  } finally {
    noticeLoading.value = false;
  }
};

const formatTime = (time: string | number | undefined) => {
  return parseTime(time, '{y}-{m}-{d} {h}:{i}') || '-';
};

const viewNotice = (item: NoticeVO) => {
  noticeDialog.title = item.noticeTitle;
  noticeDialog.content = item.noticeContent || '暂无内容';
  noticeDialog.visible = true;
};

const goTo = (path: string) => {
  router.push(path);
};

onMounted(() => {
  loadNotices();
});
</script>

<style lang="scss" scoped>
.home {
  padding: 24px;
  min-height: calc(100vh - 84px);
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.hero-section {
  text-align: center;
  padding: 48px 24px 40px;
  margin-bottom: 32px;
}

.main-title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
  margin: 0;

  .title-line {
    display: block;
  }

  .accent {
    color: #0ea5e9;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(14, 165, 233, 0.2);
  }
}

.subtitle {
  margin-top: 16px;
  font-size: 1rem;
  color: #64748b;
  letter-spacing: 0.2em;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 16px;

  .el-icon {
    font-size: 1.25rem;
    color: #0ea5e9;
  }
}

.nav-cards {
  margin-bottom: 32px;
}

.nav-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  &:hover {
    transform: translateY(-4px);
    border-color: #0ea5e9;
    box-shadow: 0 12px 24px rgba(14, 165, 233, 0.15);
  }
}

.nav-card-content {
  text-align: center;

  .nav-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &.customer {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
    }

    &.car {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    }

    &.order {
      background: linear-gradient(135deg, #10b981, #059669);
    }
  }

  h3 {
    margin: 0 0 8px;
    font-size: 1.1rem;
    color: #1e293b;
  }

  p {
    margin: 0 0 12px;
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.5;
  }
}

.content-row {
  margin-top: 8px;
}

.notice-card {
  border-radius: 12px;
  min-height: 320px;
}

.notice-list {
  min-height: 260px;
}

.notice-item {
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
  }
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;

  .notice-title {
    flex: 1;
    font-weight: 500;
    color: #334155;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.notice-meta {
  font-size: 0.8rem;
  color: #94a3b8;

  span {
    margin-right: 12px;
  }
}

.feature-card {
  margin-bottom: 12px;
  border-radius: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin-bottom: 12px;

    &.auth {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    &.encrypt {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    &.rbac {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    &.business {
      background: linear-gradient(135deg, #10b981, #059669);
    }
  }

  h4 {
    margin: 0 0 8px;
    font-size: 0.95rem;
    color: #1e293b;
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.6;
  }
}

.notice-detail-content {
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.8;
  color: #475569;

  :deep(img) {
    max-width: 100%;
  }
}

.animate__delay-1 {
  animation-delay: 0.1s;
}

.animate__delay-2 {
  animation-delay: 0.2s;
}

.animate__delay-3 {
  animation-delay: 0.3s;
}
</style>
