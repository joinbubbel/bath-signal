import { createCall, joinCall, UserId } from "./bathSignal";

const userId = Math.floor(Math.random() * 100000000).toString();

const yourUserId = document.getElementById("your_user_id") as HTMLDivElement;
const yourCallId = document.getElementById("your_call_id") as HTMLDivElement;
const createCallButton = document.getElementById(
  "create_call",
) as HTMLButtonElement;
const joinCallButton = document.getElementById(
  "join_call",
) as HTMLButtonElement;
const joinCallInput = document.getElementById(
  "join_call_input",
) as HTMLInputElement;

const videosContainer = document.getElementById("videos") as HTMLDivElement;
const videos: Map<UserId, HTMLVideoElement> = new Map();

yourUserId.innerText = userId;

createCallButton.onclick = async () => {
  let callId = await createCall();
  yourCallId.innerText = callId.toString();

  let session = await joinCall(
    userId,
    callId,
    (remoteUserId, e) => {
      let video = videos.get(remoteUserId);
      if (!video) {
        video = document.createElement("video") as HTMLVideoElement;
        video.autoplay = true;
        video.width = 500;
        video.height = 500;
        videosContainer.appendChild(video);
      }
      video.srcObject = e.streams[0];
      videos.set(remoteUserId, video);
    },
    (remoteUserId) => {
      let video = videos.get(remoteUserId)!;
      videosContainer.removeChild(video);
      videos.delete(remoteUserId);
    },
  );
};

joinCallButton.onclick = async () => {
  let session = await joinCall(
    userId,
    parseInt(joinCallInput.value),
    (remoteUserId, e) => {
      let video = videos.get(remoteUserId);
      if (!video) {
        video = document.createElement("video") as HTMLVideoElement;
        video.autoplay = true;
        video.width = 500;
        video.height = 500;
        videosContainer.appendChild(video);
      }
      video.srcObject = e.streams[0];
      videos.set(remoteUserId, video);
    },
    (remoteUserId) => {
      let video = videos.get(remoteUserId)!;
      videosContainer.removeChild(video);
      videos.delete(remoteUserId);
    },
  );
};
