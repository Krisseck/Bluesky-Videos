<template>
  <div class="home">
    <template v-if="sessionStore.session?.handle">
      <Feed :posts="posts"></Feed>
    </template>
  </div>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {useSessionStore} from "@/stores/session";

import Feed from "../components/Feed.vue";
import {type FeedViewPost} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {useBskyAgentStore} from "@/stores/bskyAgent";

var posts = ref([] as FeedViewPost[]);

const sessionStore = useSessionStore();
const bskyAgentStore = useBskyAgentStore();

sessionStore.$subscribe((mutation, state) => {
  if(state.session?.handle !== undefined) {
    loadTimeline();
  }
});

onMounted(() => {
  loadTimeline();
});

async function loadTimeline() {
  posts.value = await bskyAgentStore.getTimeline();
}

</script>
