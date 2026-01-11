<template>
  <div class="chat-area">
    <div class="tabs">
      <button v-for="(tab, index) in chats" :key="index" @click="currentTab = index">
        {{ tab.name }}
      </button>
      <button @click="addChat">+</button>
    </div>
    <div class="messages">
      <div v-for="msg in chats[currentTab].messages" :key="msg.id">
        {{ msg.user }}: {{ msg.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const chats = reactive([
  { name: 'Chat 1', messages: [{ id: 1, user: 'Alice', text: 'Hallo' }] }
])
const currentTab = ref(0)

const addChat = () => {
  chats.push({ name: `Chat ${chats.length + 1}`, messages: [] })
  currentTab.value = chats.length - 1
}
</script>

<style scoped>
.chat-area {
  color: #213547;
  border-top: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}
.tabs {
  display: flex;
  gap: 5px;
  padding: 5px;
  background-color: #eee;
}
.messages {
  padding: 10px;
  flex: 1;
  overflow-y: auto;
  background-color: #fafafa;
}
button {
  cursor: pointer;
}
</style>
