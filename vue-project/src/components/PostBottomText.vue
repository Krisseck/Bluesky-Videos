<template>
  <div class="bottom-text">
    <div class="author">{{ post.post.author.displayName }}<template v-if="post.reason && post.reason.$type === 'app.bsky.feed.defs#reasonRepost'"> (reposted by {{ //@ts-ignore
    post.reason.by.displayName }})</template></div>
    <div class="text" v-if="post.post.embed !== undefined">{{ //@ts-ignore
    post.post.record.text }}</div>
  </div>
</template>

<style lang="scss">
.bottom-text {
  position: absolute;
  bottom: 11vh;
  left: 2vw;
  height: 20vh;
  width: 80vw;
  z-index: 500;
  color: white;
  .author {
    font-weight: bold;
    font-size: 3.5vh;
    text-shadow: 0 0 0.5vh rgba(0, 0, 0, 0.9), 0 0 1vh rgba(0, 0, 0, 0.9), 0 0 1.5vh rgba(0, 0, 0, 0.9);
  }
  .text {
    margin-top: 2.5vh;
    font-size: 2vh;
    text-shadow: 0 0 0.5vh rgba(0, 0, 0, 0.9), 0 0 1vh rgba(0, 0, 0, 0.9), 0 0 1.5vh rgba(0, 0, 0, 0.9);
    white-space: pre-line;
  }
}
</style>

<script setup lang="ts">
import {type FeedViewPost} from "@atproto/api/dist/client/types/app/bsky/feed/defs";

const props = defineProps<{
  post: FeedViewPost
}>();
</script>
