<template>
  <div class="lobby-container py-4" data-bs-theme="dark">
    <div class="container">
      <!-- Lobby Header -->
      <div class="d-flex align-items-center mb-4">
        <h2 class="text-light mb-0 d-flex align-items-center">
          Lobby: {{ lobbyDto.id }}
          <button :class="statusClass" class="btn badge ms-2 d-flex align-items-center justify-content-center"
                  @click="toggleState">{{ lobbyDto.state }}<i class="bi bi-arrow-left-right"></i>
          </button>
        </h2>
        <!-- Copy Button -->
        <button class="btn btn-outline-light btn-sm ms-2 d-flex align-items-center justify-content-center"
                title="Lobby-ID kopieren"
                @click="copyLobbyId">
          <i class="bi bi-clipboard"></i>
        </button>
      </div>

      <div class="row mb-4">
        <div class="alert alert-danger" role="alert">
          {{ errorText }}
        </div>
        <!-- Spielerbereich -->
        <div class="col-md-6">
          <h5 class="text-light">Spieler</h5>
          <div v-for="player in lobbyDto.actors.filter(actor => actor.role === LobbyActorRole.PLAYER)"
               class="d-flex align-items-center mb-2 p-2 rounded shadow-sm actor-card">
            <div :style="{ backgroundColor: avatarColor(player.username) }" class="actor-avatar me-3">
              {{ player.username.charAt(0).toUpperCase() }}
            </div>
            <div class="actor-name">{{ player.username }}</div>
          </div>
          <div v-if="lobbyDto.actors.filter(a => a.role === LobbyActorRole.PLAYER).length < 2" class="text-muted mt-2">
            Warte auf Spieler...
          </div>
        </div>

        <!-- Zuschauerbereich -->
        <div class="col-md-6">
          <h5 class="text-light">Zuschauer</h5>
          <div v-for="spectator in lobbyDto.actors.filter(actor => actor.role === LobbyActorRole.SPECTATOR)"
               class="d-flex align-items-center mb-2 p-2 rounded shadow-sm actor-card">
            <div :style="{ backgroundColor: avatarColor(spectator.username) }" class="actor-avatar me-3">
              {{ spectator.username.charAt(0).toUpperCase() }}
            </div>
            <div class="actor-name">{{ spectator.username }}</div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="d-flex gap-2">
        <button :disabled="!canStartGame" class="btn btn-primary" @click="startGame">Start</button>
        <button class="btn btn-outline-light" @click="leaveLobby">Verlassen</button>
        <button :disabled="!canRoleToggle" class="btn btn-secondary" @click="toggleRole">Rolle wechseln</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {LobbyService} from "@/service/LobbyService.ts";
import {LobbyDTO} from "@/model/dto/LobbyDTO.ts";
import {LobbyState} from "@/model/enum/LobbyState.ts";
import {LobbyUpdateType} from "@/model/enum/LobbyUpdateType.ts";
import router from "@/router";
import {Routes} from "@/model/enum/Routes.ts";
import type {LobbyClient} from "@/websocket/LobbyClient.ts";
import {LobbyActorRole} from "@/model/dto/LobbyActorRole.ts";
import type {LobbyActor} from "@/model/dto/LobbyActor.ts";
import {useUserStore} from "@/stores/user.ts";

const props = defineProps<{
  lobbyId: string
}>();

const errorText = ref('');
const lobbyDto = ref<LobbyDTO>(new LobbyDTO('LOADING', [], LobbyState.CLOSED));
const userStore = useUserStore();

let lobbyWs: LobbyClient;

const loadLobby = async () => {
  const response = await LobbyService.getLobby(props.lobbyId);

  if (response.success && response.lobbyDto) {
    lobbyDto.value = response.lobbyDto;
    errorText.value = 'Lobby geladen!';

    const {LobbyClient} = await import('@/websocket/LobbyClient');
    lobbyWs = new LobbyClient(props.lobbyId, handleLobbyUpdate);
  } else {
    await router.push(Routes.OVERVIEW); //ToDO add error
  }
}

const handleLobbyUpdate = (event: any) => {
  lobbyDto.value = event.lobby;

  // Only needed for Chat MSG
  switch (event.type) {
    case LobbyUpdateType.JOIN: {
      break;
    }
    case LobbyUpdateType.LEFT:
    case LobbyUpdateType.TIMEOUT: {
      break;
    }
    case LobbyUpdateType.STATE_CHANGE: {
      break;
    }
    case LobbyUpdateType.ROLE_CHANGE: {
      break;
    }
  }
}

const leaveLobby = async () => {
  await router.push(Routes.OVERVIEW);
}

const startGame = () => {

}

const canStartGame = () => {
  const actor = getActor(userStore.username);
  const playingActors = lobbyDto.value.actors.filter(a => a.role === LobbyActorRole.PLAYER);

  return (playingActors.length >= 2 && actor.role === LobbyActorRole.PLAYER);
}

const toggleState = async () => {
  const actor = getActor(userStore.username);
  const newState = lobbyDto.value.state === LobbyState.CLOSED ? LobbyState.OPEN : LobbyState.CLOSED;
  const playingActors = lobbyDto.value.actors.filter(a => a.role === LobbyActorRole.PLAYER);

  if (actor.role === LobbyActorRole.SPECTATOR) {
    errorText.value = 'Du kannst den Lobby Status nicht setzen!';
  } else {
    if (newState === LobbyState.OPEN && playingActors.length >= 2) {
      errorText.value = 'Bei genügend Spieler, kann die Lobby nicht geöffnet werden!';
    } else {
      const response = await LobbyService.setState(lobbyDto.value.id, newState);

      if (response.success) {
        errorText.value = 'Lobby ' + newState;
      } else {
        errorText.value = response.error || 'Unbekannter Fehler';
      }
    }
  }
}

const canRoleToggle = () => {
  const actor = getActor(userStore.username);
  const newRole = actor.role === LobbyActorRole.PLAYER ? LobbyActorRole.SPECTATOR : LobbyActorRole.PLAYER;
  const playingActors = lobbyDto.value.actors.filter(a => a.role === LobbyActorRole.PLAYER);

  return (newRole !== LobbyActorRole.PLAYER || playingActors.length < 2);
}

const toggleRole = async () => {
  if (canRoleToggle()) {
    const actor = getActor(userStore.username);
    const newRole = actor.role === LobbyActorRole.PLAYER ? LobbyActorRole.SPECTATOR : LobbyActorRole.PLAYER;

    const response = await LobbyService.setRole(lobbyDto.value.id, newRole);

    if (response.success) {
      errorText.value = 'Neue Rolle ' + newRole;
    } else {
      errorText.value = response.error || 'Unbekannter Fehler';
    }
  } else {
    errorText.value = 'Kein freier Spieler Platz!';
  }
}

const getActor = (username: string): LobbyActor => {
  return <LobbyActor>lobbyDto.value.actors.find(actor => actor.username === username);
}

const copyLobbyId = () => {
  navigator.clipboard.writeText(lobbyDto.value.id);
};

const statusClass = computed(() => {
  return lobbyDto.value.state === LobbyState.OPEN ? 'bg-success' : 'bg-danger';
});

const avatarColor = (username: string) => {
  let hash = 0;

  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  return `hsl(${hash % 360}, 60%, 50%)`;
};

onMounted(async () => {
  await loadLobby();
});

onBeforeUnmount(async () => {
  try {
    //await LobbyService.leaveLobby(props.lobbyId);
  } finally {
    await lobbyWs.disconnect();
  }
});
</script>
<style scoped>
.lobby-container {
  width: 100%;
  background-color: var(--bs-body-bg);
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.actor-card {
  background-color: rgba(var(--bs-tertiary-bg-rgb));
  color: var(--bs-body-color);
}

.actor-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--bs-primary);
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.actor-name {
  font-weight: 500;
}

/* Badges */
.badge {
  font-size: 0.85rem;
}
</style>