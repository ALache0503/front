<template>
  <div class="statistics-page">
    <h1>Statistik</h1>

    <div class="stats-grid">
      <div class="card">Games played: 12</div>
      <div class="card">Wins: 7</div>
      <div class="card">Losses: 5</div>
      <div class="card">Win rate: 58%</div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.statistics-page {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  color: #213547;
  background-color: #f5f5f5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.card {
  background: white;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  font-size: 16px;
}
</style>
