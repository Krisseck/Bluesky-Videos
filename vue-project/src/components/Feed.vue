<template>
  <div id="feed" @pointerdown="startDragging">
    <div class="feed-inner-container">
      <article class="post" v-for="post in posts">
        <img :src="post.post.author.avatar" :alt="post.post.author.handle" class="avatar">
        <template v-if="post.post.embed === undefined">
          <div class="text-post">
            <div class="text">{{ //@ts-ignore
            post.post.record.text }}</div>
          </div>
          <PostBottomText :post="post"></PostBottomText>
        </template>
        <template v-else>
          <template v-if="post.post.embed.$type === 'app.bsky.embed.images#view'">
            <div class="image-post">
              <img :data-src="//@ts-ignore
              post.post.embed.images[0].fullsize" :alt="//@ts-ignore
              post.post.embed.images[0].alt" class="image">
            </div>
            <PostBottomText :post="post"></PostBottomText>
          </template>
          <template v-if="post.post.embed.$type === 'app.bsky.embed.video#view'">
            <div class="video-post">
              <video :data-playlist="post.post.embed.playlist" :poster="//@ts-ignore
              post.post.embed.thumbnail.toString()" class="video" loop></video>
            </div>
            <PostBottomText :post="post"></PostBottomText>
          </template>
          <template v-else-if="post.post.embed.$type === 'app.bsky.embed.external#view'">
            <div class="embed-external">
              <img :src="//@ts-ignore
              post.post.embed.external.thumb" :alt="//@ts-ignore
              post.post.embed.external.title" class="embed-image">
              <div class="embed-title">{{ //@ts-ignore
              post.post.embed.external.title }}</div>
              <div class="embed-description">{{ //@ts-ignore
              post.post.embed.external.description }}</div>
              <div class="embed-uri">{{ //@ts-ignore
              post.post.embed.external.uri }}</div>
            </div>
            <PostBottomText :post="post"></PostBottomText>
          </template>
        </template>
      </article>
    </div>
  </div>
</template>

<style lang="scss">

#feed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  touch-action: none;
  .feed-inner-container {
    position: relative;
  }
  .post {
    width: 100vw;
    height: 100vh;
    user-select: none;
    color: black;
    background: black;
    position: relative;
    overflow: hidden;
    .avatar {
      position: absolute;
      bottom: 20vh;
      right: 2vw;
      width: 12vw;
      height: 12vw;
      border-radius: 12vw;
      z-index: 500;
    }
    .image-post {
      .image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        object-fit: contain;
      }
    }
    .video-post {
      .video {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        object-fit: contain;
      }
    }
    .text-post {
      width: 80vw;
      height: 55vh;
      position: absolute;
      top: 10vh;
      left: 10vw;
      display: flex;
      .text {
        font-size: 2vh;
        white-space: pre-line;
        color: white;
        flex: 1;
        align-content: center;
        line-height: 1.5;
      }
    }
    .embed-external {
      width: 80vw;
      height: 55vh;
      position: absolute;
      top: 8vh;
      left: 10vw;
      background: #161e27;
      border-radius: 1vw;
      border: 1px solid #3f5369;
      color: white;
      overflow: hidden;
      .embed-image {
        width: 100%;
        height: 30vh;
        object-fit: cover;
      }
      .embed-title {
        font-weight: bold;
        font-size: 2vh;
        margin: 0.5em 0.5em;
      }
      .embed-description {
        font-size: 1.5vh;
        margin: 0.5em 0.5em;
      }
      .embed-uri {
        font-size: 1.5vh;
        color: #ccc;
        margin: 0.5em 0.5em;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 10em;
        white-space: nowrap;
      }
    }
  }
}

</style>

<script setup lang="ts">
import {type FeedViewPost} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {Tween} from "@tweenjs/tween.js";
import {onMounted, onUpdated} from "vue";
import PostBottomText from "@/components/PostBottomText.vue";
import Hls from "hls.js";

const props = defineProps<{
  posts: FeedViewPost[]
}>();

let currentPost = 0;
let feedContainerHeight = 0;
let dragThreshold = 0.2;
let container = undefined as HTMLElement|undefined;
let dragStartPosition = 0;
let postTween = undefined as Tween|undefined;

onMounted(() => {
  container = document.querySelector("#feed .feed-inner-container") as HTMLElement;
  feedContainerHeight = document.querySelector("#feed")!.clientHeight;
});

onUpdated(() => {
  initPosts(currentPost);
});

function startDragging(e: PointerEvent) {

  // Don't allow dragging if the tween is playing
  if(!postTween || !postTween.isPlaying()) {

    dragStartPosition = e.screenY;

    document.addEventListener('pointermove', movePosts);

    document.addEventListener('pointerup', stopMovingPosts);

    document.querySelector("#feed .feed-inner-container")!.setPointerCapture(e.pointerId);

  }

}

function movePosts(e: PointerEvent) {

  let currentMargin = currentPost * feedContainerHeight * -1;

  let newPosition = e.screenY - dragStartPosition;

  // Don't allow dragging past first post
  if(currentPost !== 0 || newPosition < 0) {
    container!.style.marginTop = (currentMargin + newPosition) + "px";
  }
}

function stopMovingPosts(e: PointerEvent) {

  document.removeEventListener('pointermove', movePosts);
  document.removeEventListener('pointerup', stopMovingPosts);

  document.querySelector("#feed .feed-inner-container")!.releasePointerCapture(e.pointerId);

  let currentPostElement = document.querySelectorAll('#feed .post').item(currentPost) as HTMLElement;

  let currentMargin = currentPostElement.offsetTop * -1;

  let dragDistance = e.screenY - dragStartPosition;

  if(Math.abs(dragDistance) >= feedContainerHeight * dragThreshold) {
    // Travelled enough for a post change

    // If current post is a video, pause it
    if(currentPostElement.querySelector("video")) {
      currentPostElement.querySelector("video")!.pause();
    }

    if(currentPost !== 0 || dragDistance < 0) {

      if (dragDistance > 0) {
        currentPost--;
      } else {
        currentPost++;
      }

      currentPostElement = document.querySelectorAll('#feed .post').item(currentPost) as HTMLElement;

      let newMargin = currentPostElement.offsetTop * -1;

      postTween = new Tween({top: currentMargin + dragDistance}).to({top: newMargin}, 200).onUpdate((object) => {
        container!.style.marginTop = Math.round(object.top) + "px";
      }).start();

      animate();

      function animate() {
        postTween!.update();
        if (postTween!.isPlaying()) {
          requestAnimationFrame(animate);
        } else {
          // Animation over, initialize the post
          initPosts(currentPost);
        }
      }

    }

  } else {
    // Snap the post back
    container!.style.marginTop = (currentPostElement.offsetTop * -1) + "px";
  }

}

function initPosts(currentPost: number) {

  initMediaForPost(currentPost);

  let videoElement = document.querySelectorAll('#feed .post').item(currentPost).querySelector("video");

  if(videoElement) {
    // Restart from beginning
    videoElement.currentTime = 0;
    videoElement.play();
  }

  // Initialize videos for couple more future posts too

  for(let i = currentPost + 1; i <= currentPost + 5; i++) {
    if(i < props.posts.length) {
      initMediaForPost(i);
    }
  }

}

function initMediaForPost(postIndex: number) {
  let post = document.querySelectorAll('#feed .post').item(postIndex);

  let videoElement = post.querySelector("video");

  if(videoElement && !videoElement.src) {
    let hls = new Hls();
    hls.loadSource(videoElement.dataset.playlist!);
    hls.attachMedia(videoElement);
  }

  let imageElement = post.querySelector(".image") as HTMLImageElement;

  if(imageElement && !imageElement.src) {
    imageElement.src = imageElement.dataset.src!;
  }


}
</script>
