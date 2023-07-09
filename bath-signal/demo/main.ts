import { createCall, joinCall, CallSession } from "./bathSignal";

const userId = Math.floor(Math.random() * 10000).toString();

const yourUserId = document.getElementById("your_user_id") as HTMLDivElement;
const yourCallId = document.getElementById("your_call_id") as HTMLDivElement;
const createCallButton = document.getElementById(
  "create_call",
) as HTMLButtonElement;
const joinCallButton = document.getElementById(
  "join_call",
) as HTMLButtonElement;
const video = document.getElementById("video") as HTMLVideoElement;

yourUserId.innerText = userId;

createCallButton.onclick = async () => {
  let callId = await createCall();
  let session = joinCall(userId, callId, (_, e) => {
    video.srcObject = e.streams[0];
  });

  yourCallId.innerText = callId.toString();
};

joinCallButton.onclick = async () => {};
