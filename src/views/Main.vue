<template>
  <div class="main-layout">
    <Navbar/>
    <div class="content-area">
      <router-view/>
    </div>
    <ChatArea/>
  </div>
</template>

<script lang="ts" setup>

import ChatArea from '@/components/ChatArea.vue'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import Navbar from "@/components/Navbar.vue";
</script>